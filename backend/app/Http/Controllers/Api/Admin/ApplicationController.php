<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
<<<<<<< HEAD
use App\Models\ApiKey;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * ApplicationController
 *
 * CRUD lengkap untuk manajemen aplikasi klien OPD di tabel `applications`.
 * Setiap aplikasi baru otomatis mendapat API Key pertama saat dibuat.
 *
 * Routes:
 *   GET    /api/admin/applications
 *   POST   /api/admin/applications
 *   GET    /api/admin/applications/{id}
 *   PUT    /api/admin/applications/{id}
 *   DELETE /api/admin/applications/{id}
 *   POST   /api/admin/applications/{id}/generate-key
 */
class ApplicationController extends Controller
{
    /**
     * GET /api/admin/applications
     * Daftar semua aplikasi beserta API key aktifnya.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Application::with(['apiKeys' => fn ($q) => $q->orderByDesc('created_at')])
            ->withCount(['requestLogs', 'apiKeys']);

        // Filter opsional berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Search berdasarkan nama atau OPD
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('opd', 'like', "%{$search}%");
            });
        }

        $applications = $query->latest()->paginate((int) $request->get('per_page', 15));

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
            'name'        => 'required|string|max:100',
            'opd'         => 'required|string|max:100',
            'pic_name'    => 'required|string|max:100',
            'pic_phone'   => 'nullable|string|max:20',
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
                'application' => $application,
                'api_key'     => $apiKey,
            ],
        ], 201);
    }

    /**
     * GET /api/admin/applications/{id}
     * Detail satu aplikasi dengan semua API key dan statistiknya.
     */
    public function show(int $id): JsonResponse
    {
        $application = Application::with([
            'apiKeys'  => fn ($q) => $q->orderByDesc('created_at'),
            'endpoints' => fn ($q) => $q->withPivot('is_allowed'),
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
            'name'        => 'sometimes|required|string|max:100',
            'opd'         => 'sometimes|required|string|max:100',
            'pic_name'    => 'sometimes|required|string|max:100',
            'pic_phone'   => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'status'      => ['nullable', Rule::in(['active', 'inactive'])],
        ]);

        $application->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully.',
            'data'    => $application->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/applications/{id}
     * Hapus aplikasi beserta semua data terkaitnya (cascade).
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
=======
use App\Models\Application;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 50);
        $search  = $request->query('search');

        $query = Application::with(['apiKeys', 'users'])->latest();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('opd', 'like', "%{$search}%")
                  ->orWhere('pic_name', 'like', "%{$search}%");
        }

        $applications = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $applications
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'opd'         => 'required|string|max:255',
            'pic_name'    => 'required|string|max:255',
            'pic_phone'   => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:active,inactive',
        ]);

        $app = Application::create($validated);

        // Otomatis generate API key pertama
        $key = 'gkp_' . Str::random(32);
        $secret = Str::random(64);

        $apiKey = ApiKey::create([
            'application_id' => $app->id,
            'key'            => $key,
            'status'         => 'active',
        ]);

        $app->load('apiKeys');

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi OPD berhasil didaftarkan.',
            'data'    => $app
        ], 201);
    }

    public function show($id)
    {
        $app = Application::with(['apiKeys', 'accessControls.endpoint', 'requestLogs', 'users'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $app
        ]);
    }

    public function update(Request $request, $id)
    {
        $app = Application::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'opd'         => 'sometimes|required|string|max:255',
            'pic_name'    => 'sometimes|required|string|max:255',
            'pic_phone'   => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:active,inactive',
        ]);

        $app->update($validated);
        $app->load('apiKeys');

        return response()->json([
            'success' => true,
            'message' => 'Data aplikasi OPD berhasil diperbarui.',
            'data'    => $app
        ]);
    }

    public function destroy($id)
    {
        $app = Application::findOrFail($id);
        $app->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi OPD berhasil dihapus.'
        ]);
    }

    public function generateKey($appId)
    {
        $app = Application::findOrFail($appId);

        // Revoke key aktif lama
        ApiKey::where('application_id', $app->id)
            ->where('status', 'active')
            ->update(['status' => 'revoked']);

        // Generate key baru
        $key = 'gkp_' . Str::random(32);
        $secret = Str::random(64);

        $apiKey = ApiKey::create([
            'application_id' => $app->id,
            'key'            => $key,
            'status'         => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'API Key baru berhasil digenerate.',
            'data'    => $apiKey
>>>>>>> e8c209772a04986bda00d790be2a2f57d087dc1a
        ]);
    }
}
