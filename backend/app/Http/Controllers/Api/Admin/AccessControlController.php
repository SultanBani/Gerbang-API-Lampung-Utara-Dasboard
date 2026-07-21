<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessControl;
use App\Models\Application;
use App\Models\Endpoint;
use Illuminate\Http\Request;

class AccessControlController extends Controller
{
    public function index()
    {
        $applications = Application::select(['id', 'name', 'opd'])->orderBy('name')->get();
        $endpoints    = Endpoint::select(['id', 'method', 'url', 'description', 'tag'])->orderBy('url')->get();
        $controls     = AccessControl::all();

        // Construct permissions matrix format: { "appId:endpointId": { id, is_allowed } }
        $matrix = [];
        foreach ($controls as $ac) {
            $key = "{$ac->application_id}:{$ac->endpoint_id}";
            $matrix[$key] = [
                'id'         => $ac->id,
                'is_allowed' => (bool) $ac->is_allowed,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'applications' => $applications,
                'endpoints'    => $endpoints,
                'matrix'       => $matrix,
            ]
        ]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'endpoint_id'    => 'required|exists:endpoints,id',
        ]);

        $ac = AccessControl::where('application_id', $validated['application_id'])
            ->where('endpoint_id', $validated['endpoint_id'])
            ->first();

        if ($ac) {
            $ac->is_allowed = !$ac->is_allowed;
            $ac->save();
        } else {
            $ac = AccessControl::create([
                'application_id' => $validated['application_id'],
                'endpoint_id'    => $validated['endpoint_id'],
                'is_allowed'     => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status hak akses berhasil diperbarui.',
            'data'    => [
                'id'         => $ac->id,
                'is_allowed' => (bool) $ac->is_allowed,
            ]
        ]);
    }
}
