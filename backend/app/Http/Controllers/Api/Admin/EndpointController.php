<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Endpoint;
use App\Models\Opd;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * EndpointController
 *
 * CRUD lengkap untuk manajemen endpoint API di tabel `endpoints`.
 * Menggunakan skema baru: opd_id, title, slug, target_url, method_permissions, is_active.
 *
 * Routes:
 *   GET    /api/admin/endpoints
 *   POST   /api/admin/endpoints
 *   GET    /api/admin/endpoints/{id}
 *   PUT    /api/admin/endpoints/{id}
 *   DELETE /api/admin/endpoints/{id}
 */
class EndpointController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);
        $search  = $request->query('search');

        $query = Endpoint::with('opd')->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('target_url', 'like', "%{$search}%")
                  ->orWhereHas('opd', fn ($oq) => $oq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('opd_id')) {
            $query->where('opd_id', (int) $request->opd_id);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $endpoints = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $endpoints,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'opd_id'             => 'required|integer|exists:opds,id',
            'title'              => 'required|string|max:255',
            'slug'               => 'required|string|max:255|regex:/^[a-z0-9\-]+$/',
            'target_url'         => 'required|url|max:500',
            'method_permissions' => 'required|array|min:1',
            'method_permissions.*' => 'in:GET,POST,PUT,PATCH,DELETE',
            'is_active'          => 'boolean',
        ]);

        // Cek duplikasi slug per-OPD
        $exists = Endpoint::where('opd_id', $validated['opd_id'])
            ->where('slug', $validated['slug'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => "Endpoint dengan slug \"{$validated['slug']}\" sudah ada pada OPD ini.",
            ], 422);
        }

        $endpoint = Endpoint::create($validated);
        $endpoint->load('opd');

        return response()->json([
            'success' => true,
            'message' => 'Endpoint API baru berhasil ditambahkan.',
            'data'    => $endpoint,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $endpoint = Endpoint::with(['opd', 'accessRequests.requestorOpd'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $endpoint,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $endpoint = Endpoint::findOrFail($id);

        $validated = $request->validate([
            'opd_id'             => 'sometimes|required|integer|exists:opds,id',
            'title'              => 'sometimes|required|string|max:255',
            'slug'               => 'sometimes|required|string|max:255|regex:/^[a-z0-9\-]+$/',
            'target_url'         => 'sometimes|required|url|max:500',
            'method_permissions' => 'sometimes|required|array|min:1',
            'method_permissions.*' => 'in:GET,POST,PUT,PATCH,DELETE',
            'is_active'          => 'boolean',
        ]);

        // Cek duplikasi slug jika berubah
        if (isset($validated['slug']) && $validated['slug'] !== $endpoint->slug) {
            $opdId = $validated['opd_id'] ?? $endpoint->opd_id;
            $exists = Endpoint::where('opd_id', $opdId)
                ->where('slug', $validated['slug'])
                ->where('id', '!=', $endpoint->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => "Endpoint dengan slug \"{$validated['slug']}\" sudah ada pada OPD ini.",
                ], 422);
            }
        }

        $endpoint->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data Endpoint API berhasil diperbarui.',
            'data'    => $endpoint->fresh('opd'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $endpoint = Endpoint::findOrFail($id);
        $title    = $endpoint->title;
        $endpoint->delete();

        return response()->json([
            'success' => true,
            'message' => "Endpoint \"{$title}\" berhasil dihapus.",
        ]);
    }
}
