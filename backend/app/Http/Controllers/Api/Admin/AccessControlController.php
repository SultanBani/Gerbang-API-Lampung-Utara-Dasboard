<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use App\Models\Opd;
use App\Models\Endpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AccessControlController
 *
 * Mengelola hak akses antar-OPD dan endpoint melalui AccessRequest model.
 * Menyediakan matrix view dan toggle per-kombinasi.
 *
 * Routes:
 *   GET  /api/admin/access-controls         → Matrix izin semua OPD × endpoint
 *   POST /api/admin/access-controls/toggle  → Toggle izin OPD ke endpoint
 */
class AccessControlController extends Controller
{
    /**
     * GET /api/admin/access-controls
     *
     * Mengembalikan matrix hak akses:
     * - Daftar semua OPD
     * - Daftar semua endpoint
     * - Map izin: { "opd_id:endpoint_id" => is_allowed }
     */
    public function index(): JsonResponse
    {
        $opds = Opd::select('id', 'name', 'code', 'description')
            ->orderBy('name')
            ->get();

        $endpoints = Endpoint::with('opd:id,name,code')
            ->select('id', 'opd_id', 'title', 'slug', 'target_url', 'method_permissions', 'is_active')
            ->orderBy('opd_id')
            ->orderBy('title')
            ->get();

        // Ambil semua access_requests yang disetujui dan bangun lookup map
        $accessRequests = AccessRequest::where('status', 'approved')->get();

        // Map format: { "requestor_opd_id:endpoint_id" => { id, is_allowed } }
        $matrix = [];
        foreach ($accessRequests as $ar) {
            $key          = "{$ar->requestor_opd_id}:{$ar->endpoint_id}";
            $isActive     = !$ar->isExpired();
            $matrix[$key] = [
                'id'         => $ar->id,
                'is_allowed' => $isActive,
                'api_key'    => $ar->api_key,
                'status'     => $ar->status,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Access control matrix retrieved successfully.',
            'data'    => [
                'applications'    => $opds,
                'endpoints'       => $endpoints,
                'matrix'          => $matrix,
                'total_grants'    => collect($matrix)->where('is_allowed', true)->count(),
                'total_denies'    => collect($matrix)->where('is_allowed', false)->count(),
            ],
        ]);
    }

    /**
     * POST /api/admin/access-controls/toggle
     *
     * Toggle izin OPD terhadap endpoint tertentu.
     * - Jika belum ada AccessRequest → buat baru status approved + generate api_key
     * - Jika sudah ada dan approved → ubah ke rejected
     * - Jika sudah ada dan rejected → ubah ke approved + regenerate api_key
     *
     * Body: { "opd_id": 1, "endpoint_id": 3 }
     */
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_id' => 'required|integer|exists:opds,id',   // Frontend sends application_id
            'endpoint_id'    => 'required|integer|exists:endpoints,id',
        ]);

        $opdId      = $validated['application_id'];
        $endpointId = $validated['endpoint_id'];

        // Cari AccessRequest yang sudah ada
        $access = AccessRequest::where('requestor_opd_id', $opdId)
            ->where('endpoint_id', $endpointId)
            ->first();

        if ($access) {
            // Toggle: approved <-> rejected
            if ($access->status === 'approved') {
                $access->status = 'rejected';
                $access->save();
                $isAllowed = false;
            } else {
                $access->status  = 'approved';
                $access->api_key = $access->api_key ?: \Illuminate\Support\Str::random(40);
                $access->save();
                $isAllowed = true;
            }
        } else {
            // Buat baru langsung approved
            $endpoint = Endpoint::find($endpointId);
            $access = AccessRequest::create([
                'endpoint_id'      => $endpointId,
                'requestor_opd_id' => $opdId,
                'requested_methods' => $endpoint->method_permissions ?? ['GET'],
                'status'           => 'approved',
                'api_key'          => \Illuminate\Support\Str::random(40),
            ]);
            $isAllowed = true;
        }

        $opd      = Opd::find($opdId);
        $endpoint = Endpoint::find($endpointId);
        $status   = $isAllowed ? 'GRANTED' : 'REVOKED';
        $message  = "[{$status}] {$opd?->name} → {$endpoint?->title}";

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => [
                'id'             => $access->id,
                'application_id' => $access->requestor_opd_id,
                'endpoint_id'    => $access->endpoint_id,
                'is_allowed'     => $isAllowed,
                'application'    => $opd?->name,
                'endpoint'       => $endpoint?->title,
            ],
        ]);
    }
}
