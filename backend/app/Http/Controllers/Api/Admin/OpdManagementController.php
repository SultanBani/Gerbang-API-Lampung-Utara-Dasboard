<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * OpdManagementController
 *
 * Mengelola data OPD (Organisasi Perangkat Daerah) di tabel `opds`.
 * Menggantikan ApplicationController yang sudah deprecated.
 *
 * Routes:
 *   GET    /api/admin/opds
 *   POST   /api/admin/opds
 *   GET    /api/admin/opds/{id}
 *   PUT    /api/admin/opds/{id}
 *   DELETE /api/admin/opds/{id}
 */
class OpdManagementController extends Controller
{
    /**
     * GET /api/admin/opds
     * Daftar semua OPD beserta endpoint dan user terkait.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Opd::withCount(['users', 'endpoints']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 50);
        $opds = $query->orderBy('name')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'OPD list retrieved successfully.',
            'data'    => $opds,
        ]);
    }

    /**
     * POST /api/admin/opds
     * Tambah OPD baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:50|unique:opds,code|regex:/^[a-z0-9\-]+$/',
            'description' => 'nullable|string|max:500',
        ]);

        $opd = Opd::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'OPD berhasil ditambahkan.',
            'data'    => $opd,
        ], 201);
    }

    /**
     * GET /api/admin/opds/{id}
     * Detail satu OPD dengan semua endpoint dan user.
     */
    public function show(int $id): JsonResponse
    {
        $opd = Opd::with(['users', 'endpoints'])
            ->withCount(['users', 'endpoints'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $opd,
        ]);
    }

    /**
     * PUT /api/admin/opds/{id}
     * Update data OPD.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $opd = Opd::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'code'        => ['sometimes', 'required', 'string', 'max:50', 'regex:/^[a-z0-9\-]+$/', Rule::unique('opds')->ignore($opd->id)],
            'description' => 'nullable|string|max:500',
        ]);

        $opd->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data OPD berhasil diperbarui.',
            'data'    => $opd->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/opds/{id}
     * Hapus OPD beserta semua data terkaitnya (cascade).
     */
    public function destroy(int $id): JsonResponse
    {
        $opd  = Opd::findOrFail($id);
        $name = $opd->name;
        $opd->delete();

        return response()->json([
            'success' => true,
            'message' => "OPD \"{$name}\" berhasil dihapus.",
        ]);
    }
}
