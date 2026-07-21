<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Endpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * EndpointManagementController
 *
 * CRUD lengkap untuk manajemen endpoint API di tabel `endpoints`.
 *
 * Routes:
 *   GET    /api/admin/endpoints
 *   POST   /api/admin/endpoints
 *   GET    /api/admin/endpoints/{id}
 *   PUT    /api/admin/endpoints/{id}
 *   DELETE /api/admin/endpoints/{id}
 */
class EndpointManagementController extends Controller
{
    /**
     * GET /api/admin/endpoints
     * Daftar semua endpoint dengan filter opsional.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Endpoint::withCount(['requestLogs', 'accessControls']);

        // Filter berdasarkan method HTTP
        if ($request->filled('method')) {
            $query->whereRaw('UPPER(method) = ?', [strtoupper($request->method_filter ?? $request->method)]);
        }

        // Filter berdasarkan tag
        if ($request->filled('tag')) {
            $query->where('tag', $request->tag);
        }

        // Search berdasarkan URL atau deskripsi
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('url', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('tag', 'like', "%{$search}%");
            });
        }

        $endpoints = $query->orderBy('tag')->orderBy('url')->paginate(
            (int) $request->get('per_page', 20)
        );

        return response()->json([
            'success' => true,
            'message' => 'Endpoints retrieved successfully.',
            'data'    => $endpoints,
        ]);
    }

    /**
     * POST /api/admin/endpoints
     * Tambah endpoint baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method'           => ['required', Rule::in(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', '*'])],
            'url'              => 'required|string|max:255',
            'description'      => 'nullable|string|max:500',
            'tag'              => 'nullable|string|max:50',
            'is_auth_required' => 'nullable|boolean',
            'rate_limit'       => 'nullable|integer|min:1|max:10000',
        ]);

        // Normalisasi: pastikan URL dimulai dengan '/'
        $url = '/' . ltrim($validated['url'], '/');

        // Cek duplikasi method + url
        $exists = Endpoint::whereRaw('UPPER(method) = ?', [strtoupper($validated['method'])])
            ->where('url', $url)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => "Endpoint [{$validated['method']} {$url}] already exists.",
                'data'    => null,
            ], 422);
        }

        $endpoint = Endpoint::create([
            'method'           => strtoupper($validated['method']),
            'url'              => $url,
            'description'      => $validated['description'] ?? null,
            'tag'              => $validated['tag'] ?? 'Umum',
            'is_auth_required' => $validated['is_auth_required'] ?? true,
            'rate_limit'       => $validated['rate_limit'] ?? 60,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Endpoint created successfully.',
            'data'    => $endpoint,
        ], 201);
    }

    /**
     * GET /api/admin/endpoints/{id}
     * Detail satu endpoint beserta daftar aplikasi yang memiliki akses.
     */
    public function show(int $id): JsonResponse
    {
        $endpoint = Endpoint::with([
            'applications' => fn ($q) => $q->withPivot('is_allowed')->select('applications.id', 'name', 'opd', 'status'),
        ])
        ->withCount('requestLogs')
        ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Endpoint retrieved successfully.',
            'data'    => $endpoint,
        ]);
    }

    /**
     * PUT /api/admin/endpoints/{id}
     * Update data endpoint.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $endpoint = Endpoint::findOrFail($id);

        $validated = $request->validate([
            'method'           => ['sometimes', Rule::in(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', '*'])],
            'url'              => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string|max:500',
            'tag'              => 'nullable|string|max:50',
            'is_auth_required' => 'nullable|boolean',
            'rate_limit'       => 'nullable|integer|min:1|max:10000',
        ]);

        if (isset($validated['url'])) {
            $validated['url'] = '/' . ltrim($validated['url'], '/');
        }

        if (isset($validated['method'])) {
            $validated['method'] = strtoupper($validated['method']);
        }

        $endpoint->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Endpoint updated successfully.',
            'data'    => $endpoint->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/endpoints/{id}
     * Hapus endpoint (cascade ke access_controls & request_logs via set null).
     */
    public function destroy(int $id): JsonResponse
    {
        $endpoint = Endpoint::findOrFail($id);
        $label    = $endpoint->method . ' ' . $endpoint->url;
        $endpoint->delete();

        return response()->json([
            'success' => true,
            'message' => "Endpoint [{$label}] deleted successfully.",
            'data'    => null,
        ]);
    }
}
