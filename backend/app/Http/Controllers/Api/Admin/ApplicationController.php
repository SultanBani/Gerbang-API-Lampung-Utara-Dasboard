<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * ApplicationController
 *
 * Mengelola aplikasi klien OPD di tabel `applications`.
 * Setiap aplikasi baru otomatis mendapat API Key pertama saat dibuat.
 */
class ApplicationController extends Controller
{
    /**
     * GET /api/admin/applications
     * Daftar semua aplikasi beserta API key aktifnya dan akun user OPD.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Application::with([
            'apiKeys' => fn ($q) => $q->orderByDesc('created_at'),
            'users'
        ])
        ->withCount(['requestLogs', 'apiKeys']);

        // Filter opsional berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search berdasarkan nama, OPD, atau PIC
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('opd', 'like', "%{$search}%")
                  ->orWhere('pic_name', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 50);
        $applications = $query->latest()->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Applications retrieved successfully.',
            'data'    => $applications,
        ]);
    }

    /**
     * POST /api/admin/applications
     * Tambah aplikasi baru dan otomatis buat API Key pertama.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'opd'         => 'required|string|max:255',
            'pic_name'    => 'required|string|max:255',
            'pic_phone'   => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
            'status'      => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $application = Application::create([
            'name'        => $validated['name'],
            'opd'         => $validated['opd'],
            'pic_name'    => $validated['pic_name'],
            'pic_phone'   => $validated['pic_phone'] ?? null,
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'] ?? 'active',
        ]);

        // Buat API Key pertama secara otomatis
        $apiKey = $this->createApiKey($application);

        return response()->json([
            'success' => true,
            'message' => 'Application created successfully. API key has been generated.',
            'data'    => [
                'application' => $application->load('apiKeys'),
                'api_key'     => $apiKey,
            ],
        ], 201);
    }

    /**
     * GET /api/admin/applications/{id}
     * Detail satu aplikasi dengan semua API key, user, dan statistiknya.
     */
    public function show(int $id): JsonResponse
    {
        $application = Application::with([
            'apiKeys'        => fn ($q) => $q->orderByDesc('created_at'),
            'endpoints'      => fn ($q) => $q->withPivot('is_allowed'),
            'users',
            'accessControls.endpoint',
            'requestLogs',
        ])
        ->withCount('requestLogs')
        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Application retrieved successfully.',
            'data'    => $application,
        ]);
    }

    /**
     * PUT /api/admin/applications/{id}
     * Update data aplikasi.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $application = Application::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'opd'         => 'sometimes|required|string|max:255',
            'pic_name'    => 'sometimes|required|string|max:255',
            'pic_phone'   => 'nullable|string|max:50',
            'description' => 'nullable|string|max:500',
            'status'      => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $application->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully.',
            'data'    => $application->fresh(['apiKeys', 'users']),
        ]);
    }

    /**
     * DELETE /api/admin/applications/{id}
     * Hapus aplikasi beserta semua data terkaitnya.
     */
    public function destroy(int $id): JsonResponse
    {
        $application = Application::findOrFail($id);
        $name = $application->name;
        $application->delete();

        return response()->json([
            'success' => true,
            'message' => "Application \"{$name}\" deleted successfully.",
            'data'    => null,
        ]);
    }

    /**
     * POST /api/admin/applications/{id}/generate-key
     * Generate API key baru (menggantikan key lama yang di-revoke).
     */
    public function generateKey(int $id): JsonResponse
    {
        $application = Application::findOrFail($id);

        // Revoke semua key aktif sebelumnya
        ApiKey::where('application_id', $id)
            ->where('status', 'active')
            ->update(['status' => 'revoked']);

        $apiKey = $this->createApiKey($application);

        return response()->json([
            'success' => true,
            'message' => 'New API key generated successfully. Previous active keys have been revoked.',
            'data'    => $apiKey,
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────────

    /**
     * Buat record ApiKey baru untuk suatu aplikasi.
     * Secret key menggunakan format: LAMPURA-{APP_ID}-{random_hex_32}
     */
    private function createApiKey(Application $application): ApiKey
    {
        $secretKey = 'LAMPURA-' . strtoupper(Str::slug($application->opd, '')) . '-' . Str::random(32);

        return ApiKey::create([
            'application_id' => $application->id,
            'key'            => $secretKey,
            'status'         => 'active',
            'expires_at'     => now()->addYear(),
        ]);
    }
}

