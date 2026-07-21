<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestLog;
use Illuminate\Http\Request;

class RequestLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 15);
        $search  = $request->query('search');
        $appId   = $request->query('application_id');

        $query = RequestLog::with(['application', 'endpoint'])->latest();

        if ($appId) {
            $query->where('application_id', $appId);
        }

        if ($search) {
            $query->where('path', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('status_code', 'like', "%{$search}%");
        }

        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $logs
        ]);
    }
}
