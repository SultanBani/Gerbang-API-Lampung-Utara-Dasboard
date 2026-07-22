<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessControl;
use App\Models\Application;
use App\Models\Endpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AccessControlController
 *
 * Mengelola hak akses antar-aplikasi dan endpoint (tabel `access_controls`).
 * Menyediakan matrix view dan toggle per-kombinasi.
 *
 * Routes:
 *   GET  /api/admin/access-controls         → Matrix izin semua app × endpoint
 *   POST /api/admin/access-controls/toggle  → Toggle izin aplikasi ke endpoint
 */
class AccessControlController extends Controller
{
    /**
     * GET /api/admin/access-controls
     *
     * Mengembalikan matrix hak akses:
     * - Daftar semua aplikasi
     * - Daftar semua endpoint
     * - Map izin: { "app_id:endpoint_id" => is_allowed }
     */
    public function index(): JsonResponse
    {
        $applications = Application::select('id', 'name', 'opd', 'status')
            ->orderBy('name')
            ->get();

        $endpoints = Endpoint::select('id', 'method', 'url', 'tag', 'description')
            ->orderBy('tag')
            ->orderBy('url')
            ->get();

        // Ambil semua record access_control dan bangun lookup map
        $accessControls = AccessControl::all();

        // Map format: { "app_id:endpoint_id" => ["id" => ..., "is_allowed" => ...] }
        $matrix = [];
        foreach ($accessControls as $ac) {
            $key          = "{$ac->application_id}:{$ac->endpoint_id}";
            $matrix[$key] = [
                'id'         => $ac->id,
                'is_allowed' => (bool) $ac->is_allowed,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Access control matrix retrieved successfully.',
            'data'    => [
                'applications'    => $applications,
                'endpoints'       => $endpoints,
                'matrix'          => $matrix,
                'total_grants'    => $accessControls->where('is_allowed', true)->count(),
                'total_denies'    => $accessControls->where('is_allowed', false)->count(),
            ],
        ]);
    }

    /**
     * POST /api/admin/access-controls/toggle
     *
     * Toggle izin aplikasi terhadap endpoint tertentu.
     * - Jika record belum ada → buat dengan is_allowed = true
     * - Jika record sudah ada → flip nilai is_allowed
     *
     * Body: { "application_id": 1, "endpoint_id": 3 }
     */
    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_id' => 'required|integer|exists:applications,id',
            'endpoint_id'    => 'required|integer|exists:endpoints,id',
        ]);

        // firstOrCreate + toggle
        $access = AccessControl::firstOrCreate(
            [
                'application_id' => $validated['application_id'],
                'endpoint_id'    => $validated['endpoint_id'],
            ],
            ['is_allowed' => false]  // default saat baru dibuat = false, lalu di-flip
        );

        // Flip nilai
        $access->is_allowed = ! $access->is_allowed;
        $access->save();

        // Ambil nama untuk pesan yang ramah
        $app      = Application::find($validated['application_id']);
        $endpoint = Endpoint::find($validated['endpoint_id']);

        $status  = $access->is_allowed ? 'GRANTED' : 'REVOKED';
        $message = "[{$status}] {$app?->name} → {$endpoint?->method} {$endpoint?->url}";

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => [
                'id'             => $access->id,
                'application_id' => $access->application_id,
                'endpoint_id'    => $access->endpoint_id,
                'is_allowed'     => $access->is_allowed,
                'application'    => $app?->name,
                'endpoint'       => $endpoint?->method . ' ' . $endpoint?->url,
            ],
        ]);
    }
}

