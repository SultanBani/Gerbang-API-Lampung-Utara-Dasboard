<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Endpoint;
use Illuminate\Http\Request;

class OpdController extends Controller
{
    // ─── 1. KATALOG API (PUBLIK) ──────────────────────────────────────
    public function catalog(Request $request)
    {
        $user = $request->user();

        $endpoints = Endpoint::with('opd')
            ->where('is_active', true)
            ->get();

        $userOpdId = $user ? $user->opd_id : null;

        // Tandai endpoint milik OPD sendiri
        $endpoints->transform(function ($ep) use ($userOpdId) {
            $ep->is_owner = $userOpdId && ((int)$userOpdId === (int)$ep->opd_id);
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

        // Validate slug uniqueness per-OPD
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

        // Validate slug uniqueness on update
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
}
