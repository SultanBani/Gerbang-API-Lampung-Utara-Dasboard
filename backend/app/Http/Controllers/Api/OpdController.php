<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Endpoint;
use App\Models\AccessRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OpdController extends Controller
{
    // ─── 1. KATALOG API ──────────────────────────────────────────────
    public function catalog(Request $request)
    {
        $user = $request->user();

        $endpoints = Endpoint::with('opd')
            ->where('is_active', true)
            ->get();

        $userOpdId = $user ? $user->opd_id : null;
        if (!$userOpdId && $user && $user->role === 'admin') {
            $diskominfo = \App\Models\Opd::where('code', 'diskominfo')->first();
            $userOpdId = $diskominfo ? $diskominfo->id : null;
        }

        // Fetch user's access requests
        $myRequests = [];
        if ($userOpdId) {
            $myRequests = AccessRequest::where('requestor_opd_id', $userOpdId)
                ->get()
                ->keyBy('endpoint_id');
        }

        $endpoints->transform(function ($ep) use ($user, $userOpdId, $myRequests) {
            // Super Admin also needs approval unless it is their own OPD endpoint!
            $isOwner = $userOpdId && ((int)$userOpdId === (int)$ep->opd_id);
            $req = $myRequests[$ep->id] ?? null;

            $ep->is_owner = $isOwner;
            $ep->access_status = $isOwner ? 'approved' : ($req ? $req->status : 'none');
            $ep->user_api_key = ($req && $req->status === 'approved') ? $req->api_key : null;
            return $ep;
        });

        return response()->json(['success' => true, 'data' => $endpoints]);
    }

    // ─── 2. KELOLA API SENDIRI ───────────────────────────────────────
    public function myEndpoints(Request $request)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }

        $endpoints = Endpoint::where('opd_id', $user->opd_id)->get();
        return response()->json(['success' => true, 'data' => $endpoints]);
    }

    public function storeEndpoint(Request $request)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }

        // Support stringified JSON array from FormData
        if ($request->has('method_permissions') && is_string($request->input('method_permissions'))) {
            $decoded = json_decode($request->input('method_permissions'), true);
            if (is_array($decoded)) {
                $request->merge(['method_permissions' => $decoded]);
            }
        }

        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'slug'               => 'required|string|max:255|regex:/^[a-z0-9\-]+$/',
            'target_url'         => 'nullable|string',
            'file'               => 'nullable|file|mimes:csv,txt,pdf,json,xlsx|max:10240',
            'method_permissions' => 'required|array|min:1',
            'method_permissions.*' => 'in:GET,POST,PUT,PATCH,DELETE',
            'is_active'          => 'nullable',
        ]);

        // BUG-11: Validate slug uniqueness per-OPD
        $exists = Endpoint::where('opd_id', $user->opd_id)
            ->where('slug', $validated['slug'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => "Endpoint dengan slug \"{$validated['slug']}\" sudah ada pada OPD Anda.",
            ], 422);
        }

        // Process File Upload if provided
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $opdCode = $user->opd ? $user->opd->code : 'opd';
            $extension = strtolower($file->getClientOriginalExtension());
            $fileName = $validated['slug'] . '_' . time() . '.' . $extension;
            $path = $file->storeAs("datasets/{$opdCode}", $fileName, 'public');
            $validated['target_url'] = url("storage/{$path}");
        }

        if (empty($validated['target_url'])) {
            return response()->json([
                'success' => false,
                'message' => 'Harap upload file (CSV/PDF/JSON) atau isi Target URL.',
            ], 422);
        }

        $validated['opd_id'] = $user->opd_id;
        $validated['is_active'] = filter_var($validated['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN);

        $endpoint = Endpoint::create($validated);

        return response()->json(['success' => true, 'data' => $endpoint]);
    }

    public function updateEndpoint(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }

        $endpoint = Endpoint::where('id', $id)->where('opd_id', $user->opd_id)->firstOrFail();

        // Support stringified JSON array from FormData
        if ($request->has('method_permissions') && is_string($request->input('method_permissions'))) {
            $decoded = json_decode($request->input('method_permissions'), true);
            if (is_array($decoded)) {
                $request->merge(['method_permissions' => $decoded]);
            }
        }

        $validated = $request->validate([
            'title'              => 'sometimes|required|string|max:255',
            'slug'               => 'sometimes|required|string|max:255|regex:/^[a-z0-9\-]+$/',
            'target_url'         => 'nullable|string',
            'file'               => 'nullable|file|mimes:csv,txt,pdf,json,xlsx|max:10240',
            'method_permissions' => 'sometimes|required|array|min:1',
            'method_permissions.*' => 'in:GET,POST,PUT,PATCH,DELETE',
            'is_active'          => 'nullable',
        ]);

        // BUG-11: Validate slug uniqueness on update
        if (isset($validated['slug']) && $validated['slug'] !== $endpoint->slug) {
            $exists = Endpoint::where('opd_id', $user->opd_id)
                ->where('slug', $validated['slug'])
                ->where('id', '!=', $endpoint->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => "Endpoint dengan slug \"{$validated['slug']}\" sudah ada pada OPD Anda.",
                ], 422);
            }
        }

        // Process File Upload if provided
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $opdCode = $user->opd ? $user->opd->code : 'opd';
            $extension = strtolower($file->getClientOriginalExtension());
            $slug = $validated['slug'] ?? $endpoint->slug;
            $fileName = $slug . '_' . time() . '.' . $extension;
            $path = $file->storeAs("datasets/{$opdCode}", $fileName, 'public');
            $validated['target_url'] = url("storage/{$path}");
        }

        if (isset($validated['is_active'])) {
            $validated['is_active'] = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);
        }

        $endpoint->update($validated);

        return response()->json(['success' => true, 'data' => $endpoint]);
    }

    public function destroyEndpoint(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }

        $endpoint = Endpoint::where('id', $id)->where('opd_id', $user->opd_id)->firstOrFail();
        $endpoint->delete();
        
        return response()->json(['success' => true, 'message' => 'Endpoint dihapus']);
    }

    // ─── 3. PERMINTAAN AKSES MASUK (INCOMING) ────────────────────────
    public function incomingRequests(Request $request)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }
        
        $requests = AccessRequest::with(['endpoint', 'requestorOpd'])
            ->whereHas('endpoint', function ($q) use ($user) {
                $q->where('opd_id', $user->opd_id);
            })
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $requests]);
    }

    // BUG-09: Fixed — now validates $action parameter
    public function processRequest(Request $request, $id, $action)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }

        // Validate action parameter
        if (!in_array($action, ['approve', 'reject'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Action tidak valid. Gunakan "approve" atau "reject".',
            ], 422);
        }

        $accessReq = AccessRequest::with('endpoint')->where('id', $id)->firstOrFail();

        // Pastikan endpoint milik OPD yang login
        if ($accessReq->endpoint->opd_id !== $user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($action === 'approve') {
            $accessReq->status = 'approved';
            $accessReq->api_key = $accessReq->api_key ?: Str::random(40);
        } elseif ($action === 'reject') {
            $accessReq->status = 'rejected';
        }

        $accessReq->save();

        return response()->json(['success' => true, 'data' => $accessReq]);
    }

    // ─── 4. STATUS PENGAJUAN SAYA (OUTGOING) ─────────────────────────
    public function myAccessRequests(Request $request)
    {
        $user = $request->user();

        if (!$user->opd_id) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }
        
        $requests = AccessRequest::with(['endpoint.opd'])
            ->where('requestor_opd_id', $user->opd_id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $requests]);
    }

    // BUG-10: Fixed — prevents duplicate access requests
    public function submitRequest(Request $request)
    {
        $user = $request->user();

        $userOpdId = $user->opd_id;
        if (!$userOpdId && $user->role === 'admin') {
            $diskominfo = \App\Models\Opd::where('code', 'diskominfo')->first();
            $userOpdId = $diskominfo ? $diskominfo->id : null;
        }

        if (!$userOpdId) {
            return response()->json(['success' => false, 'message' => 'Akun tidak terhubung ke OPD.'], 403);
        }

        $validated = $request->validate([
            'endpoint_id' => 'required|exists:endpoints,id',
            'requested_methods' => 'required|array|min:1',
            'requested_methods.*' => 'in:GET,POST,PUT,PATCH,DELETE',
        ]);

        // Prevent duplicate: check for existing pending/approved request
        $existing = AccessRequest::where('requestor_opd_id', $userOpdId)
            ->where('endpoint_id', $validated['endpoint_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            $statusText = $existing->status === 'pending' ? 'masih menunggu persetujuan' : 'sudah disetujui';
            return response()->json([
                'success' => false,
                'message' => "Permintaan akses ke endpoint ini {$statusText}.",
                'data'    => $existing,
            ], 422);
        }

        // Prevent requesting own endpoint
        $endpoint = Endpoint::findOrFail($validated['endpoint_id']);
        if ((int)$endpoint->opd_id === (int)$userOpdId) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak perlu mengajukan akses ke endpoint milik OPD Anda sendiri.',
            ], 422);
        }

        $validated['requestor_opd_id'] = $userOpdId;
        $validated['status'] = 'pending';

        $req = AccessRequest::create($validated);

        return response()->json(['success' => true, 'data' => $req]);
    }
}
