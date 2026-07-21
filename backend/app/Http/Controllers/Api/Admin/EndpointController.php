<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Endpoint;
use Illuminate\Http\Request;

class EndpointController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 100);
        $search  = $request->query('search');

        $query = Endpoint::latest();

        if ($search) {
            $query->where('url', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('tag', 'like', "%{$search}%");
        }

        $endpoints = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $endpoints
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'method'           => 'required|string|in:GET,POST,PUT,PATCH,DELETE',
            'url'              => 'required|string|max:255',
            'description'      => 'nullable|string',
            'tag'              => 'nullable|string|max:100',
            'is_auth_required' => 'boolean',
            'rate_limit'       => 'nullable|integer|min:1',
        ]);

        $endpoint = Endpoint::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Endpoint API baru berhasil ditambahkan.',
            'data'    => $endpoint
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $endpoint = Endpoint::findOrFail($id);

        $validated = $request->validate([
            'method'           => 'sometimes|required|string|in:GET,POST,PUT,PATCH,DELETE',
            'url'              => 'sometimes|required|string|max:255',
            'description'      => 'nullable|string',
            'tag'              => 'nullable|string|max:100',
            'is_auth_required' => 'boolean',
            'rate_limit'       => 'nullable|integer|min:1',
        ]);

        $endpoint->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data Endpoint API berhasil diperbarui.',
            'data'    => $endpoint
        ]);
    }

    public function destroy($id)
    {
        $endpoint = Endpoint::findOrFail($id);
        $endpoint->delete();

        return response()->json([
            'success' => true,
            'message' => 'Endpoint API berhasil dihapus.'
        ]);
    }
}
