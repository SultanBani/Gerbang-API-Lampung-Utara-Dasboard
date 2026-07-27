<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RequestLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequestLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RequestLog::with([
            'endpoint:id,opd_id,title,slug',
            'opd:id,name,code',
            'accessRequest:id,endpoint_id,requestor_opd_id,status',
        ])->latest();

        if ($request->filled('status_code')) {
            $query->where('status_code', (int) $request->status_code);
        }

        if ($request->filled('status_range')) {
            match ($request->status_range) {
                '2xx'   => $query->whereBetween('status_code', [200, 299]),
                '4xx'   => $query->whereBetween('status_code', [400, 499]),
                '5xx'   => $query->whereBetween('status_code', [500, 599]),
                'error' => $query->where('status_code', '>=', 400),
                default => null,
            };
        }

        if ($request->filled('method')) {
            $query->whereRaw('UPPER(method) = ?', [strtoupper($request->input('method'))]);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('url', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('opd', fn ($oq) => $oq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('opd_id')) {
            $query->where('opd_id', (int) $request->opd_id);
        }

        $perPage = min((int) $request->get('per_page', 15), 100);
        $logs    = $query->paginate($perPage);

        $summary = [
            'total_shown'  => $logs->total(),
            'success_rate' => $this->calculateSuccessRate(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Request logs retrieved successfully.',
            'data'    => $logs,
            'summary' => $summary,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $log = RequestLog::with([
            'endpoint:id,opd_id,title,slug,target_url',
            'opd:id,name,code',
            'accessRequest',
        ])->findOrFail($id);

        $requestPayload  = $log->request_payload
            ? json_decode($log->request_payload, true) ?? $log->request_payload
            : null;

        $responsePayload = $log->response_payload
            ? json_decode($log->response_payload, true) ?? $log->response_payload
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Request log retrieved successfully.',
            'data'    => array_merge($log->toArray(), [
                'request_payload'  => $requestPayload,
                'response_payload' => $responsePayload,
            ]),
        ]);
    }

    public function purge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'older_than_days' => 'required|integer|min:1|max:365',
        ]);

        $cutoff  = now()->subDays($validated['older_than_days']);
        $deleted = RequestLog::where('created_at', '<', $cutoff)->delete();

        return response()->json([
            'success' => true,
            'message' => "{$deleted} log entries older than {$validated['older_than_days']} days have been purged.",
            'data'    => ['deleted_count' => $deleted],
        ]);
    }

    private function calculateSuccessRate(): float
    {
        $total   = RequestLog::count();
        $success = RequestLog::whereBetween('status_code', [200, 299])->count();

        return $total > 0 ? round(($success / $total) * 100, 1) : 0.0;
    }
}
