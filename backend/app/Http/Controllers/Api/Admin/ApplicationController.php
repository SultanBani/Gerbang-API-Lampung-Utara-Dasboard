<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
        ]);
    }
}
