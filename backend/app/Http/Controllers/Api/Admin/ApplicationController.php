<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $search  = $request->query('search');

        $query = Application::with(['apiKeys', 'users'])->withCount(['requestLogs', 'apiKeys'])->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('opd', 'like', "%{$search}%")
                  ->orWhere('pic_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Applications retrieved successfully.',
            'data'    => $applications,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'opd'         => 'required|string|max:255',
            'pic_name'    => 'required|string|max:255',
            'pic_phone'   => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'status'      => 'nullable|string|in:active,inactive',
        ]);

        $app = Application::create([
            'name'        => $validated['name'],
            'opd'         => $validated['opd'],
            'pic_name'    => $validated['pic_name'],
            'pic_phone'   => $validated['pic_phone'] ?? null,
            'description' => $validated['description'] ?? null,
            'status'      => $validated['status'] ?? 'active',
        ]);

        $key = 'gkp_' . Str::slug($app->opd, '_') . '_key_' . Str::random(8);

        $apiKey = ApiKey::create([
            'application_id' => $app->id,
            'key'            => $key,
            'status'         => 'active',
        ]);

        $app->load('apiKeys');

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi OPD berhasil didaftarkan. API Key telah digenerate.',
            'data'    => [
                'application' => $app,
                'api_key'     => $apiKey,
            ],
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $app = Application::with(['apiKeys', 'accessControls.endpoint', 'requestLogs', 'users'])
            ->withCount('requestLogs')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $app,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
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
            'data'    => $app,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $app = Application::findOrFail($id);
        $app->delete();

        return response()->json([
            'success' => true,
            'message' => 'Aplikasi OPD berhasil dihapus.',
        ]);
    }

    public function generateKey(int $id): JsonResponse
    {
        $app = Application::findOrFail($id);

        ApiKey::where('application_id', $app->id)
            ->where('status', 'active')
            ->update(['status' => 'revoked']);

        $key = 'gkp_' . Str::slug($app->opd, '_') . '_key_' . Str::random(8);

        $apiKey = ApiKey::create([
            'application_id' => $app->id,
            'key'            => $key,
            'status'         => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'API Key baru berhasil digenerate. Key sebelumnya telah dicabut.',
            'data'    => $apiKey,
        ], 201);
    }
}
