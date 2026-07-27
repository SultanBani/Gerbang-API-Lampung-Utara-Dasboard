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
        $opdId = $request->user()->opd_id;
        
        $endpoints = Endpoint::with('opd')
            ->where('is_active', true)
            ->where('opd_id', '!=', $opdId)
            ->get();

        return response()->json(['success' => true, 'data' => $endpoints]);
    }

    // ─── 2. KELOLA API SENDIRI ───────────────────────────────────────
    public function myEndpoints(Request $request)
    {
        $opdId = $request->user()->opd_id;
        $endpoints = Endpoint::where('opd_id', $opdId)->get();
        return response()->json(['success' => true, 'data' => $endpoints]);
    }

    public function storeEndpoint(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'target_url' => 'required|url',
            'method_permissions' => 'required|array|min:1',
            'is_active' => 'boolean',
        ]);

        $validated['opd_id'] = $request->user()->opd_id;
        
        $endpoint = Endpoint::create($validated);

        return response()->json(['success' => true, 'data' => $endpoint]);
    }

    public function updateEndpoint(Request $request, $id)
    {
        $endpoint = Endpoint::where('id', $id)->where('opd_id', $request->user()->opd_id)->firstOrFail();
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255',
            'target_url' => 'sometimes|required|url',
            'method_permissions' => 'sometimes|required|array|min:1',
            'is_active' => 'boolean',
        ]);

        $endpoint->update($validated);

        return response()->json(['success' => true, 'data' => $endpoint]);
    }

    public function destroyEndpoint(Request $request, $id)
    {
        $endpoint = Endpoint::where('id', $id)->where('opd_id', $request->user()->opd_id)->firstOrFail();
        $endpoint->delete();
        
        return response()->json(['success' => true, 'message' => 'Endpoint dihapus']);
    }

    // ─── 3. PERMINTAAN AKSES MASUK (INCOMING) ────────────────────────
    public function incomingRequests(Request $request)
    {
        $opdId = $request->user()->opd_id;
        
        $requests = AccessRequest::with(['endpoint', 'requestorOpd'])
            ->whereHas('endpoint', function ($q) use ($opdId) {
                $q->where('opd_id', $opdId);
            })
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function processRequest(Request $request, $id, $action)
    {
        $opdId = $request->user()->opd_id;
        $accessReq = AccessRequest::with('endpoint')->where('id', $id)->firstOrFail();

        // Pastikan endpoint milik OPD yang login
        if ($accessReq->endpoint->opd_id !== $opdId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($action === 'approve') {
            $accessReq->status = 'approved';
            $accessReq->api_key = Str::random(40);
        } elseif ($action === 'reject') {
            $accessReq->status = 'rejected';
        }

        $accessReq->save();

        return response()->json(['success' => true, 'data' => $accessReq]);
    }

    // ─── 4. STATUS PENGAJUAN SAYA (OUTGOING) ─────────────────────────
    public function myAccessRequests(Request $request)
    {
        $opdId = $request->user()->opd_id;
        
        $requests = AccessRequest::with(['endpoint.opd'])
            ->where('requestor_opd_id', $opdId)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $requests]);
    }

    public function submitRequest(Request $request)
    {
        $validated = $request->validate([
            'endpoint_id' => 'required|exists:endpoints,id',
            'requested_methods' => 'required|array|min:1',
        ]);

        $validated['requestor_opd_id'] = $request->user()->opd_id;
        $validated['status'] = 'pending';

        $req = AccessRequest::create($validated);

        return response()->json(['success' => true, 'data' => $req]);
    }
}
