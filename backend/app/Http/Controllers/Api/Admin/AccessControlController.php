<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccessControl;
use App\Models\Application;
use App\Models\Endpoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessControlController extends Controller
{
    public function index(): JsonResponse
    {
        $applications = Application::select(['id', 'name', 'opd', 'status'])
            ->orderBy('name')
            ->get();

        $endpoints = Endpoint::select(['id', 'method', 'url', 'description', 'tag'])
            ->orderBy('tag')
            ->orderBy('url')
            ->get();

        $accessControls = AccessControl::all();

        $matrix = [];
        foreach ($accessControls as $ac) {
            $key = "{$ac->application_id}:{$ac->endpoint_id}";
            $matrix[$key] = [
                'id'         => $ac->id,
                'is_allowed' => (bool) $ac->is_allowed,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Access control matrix retrieved successfully.',
            'data'    => [
                'applications' => $applications,
                'endpoints'    => $endpoints,
                'matrix'       => $matrix,
            ],
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:applications,id',
            'endpoint_id'    => 'required|exists:endpoints,id',
        ]);

        $access = AccessControl::firstOrCreate(
            [
                'application_id' => $validated['application_id'],
                'endpoint_id'    => $validated['endpoint_id'],
            ],
            ['is_allowed' => false]
        );

        $access->is_allowed = ! $access->is_allowed;
        $access->save();

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
                'is_allowed'     => (bool) $access->is_allowed,
                'application'    => $app?->name,
                'endpoint'       => $endpoint?->method . ' ' . $endpoint?->url,
            ],
        ]);
    }
}
