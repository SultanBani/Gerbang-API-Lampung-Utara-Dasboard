<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Endpoint;
use App\Models\ApiKey;
use App\Models\RequestLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    public function index()
    {
        $appsCount          = Application::count();
        $endpointsCount     = Endpoint::count();
        $activeKeysCount    = ApiKey::where('status', 'active')->count();
        $requestsTodayCount = RequestLog::whereDate('created_at', today())->count();
        $failedRequestsTodayCount = RequestLog::whereDate('created_at', today())
            ->where('status_code', '>=', 400)
            ->count();

        $avgResponseTime = RequestLog::avg('response_time_ms');
        $avgResponseTime = $avgResponseTime ? (int) round($avgResponseTime) : 0;

        // Traffic chart 7 hari terakhir
        $trafficChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $displayDate = now()->subDays($i)->format('d M');
            $total  = RequestLog::whereDate('created_at', $date)->count();
            $failed = RequestLog::whereDate('created_at', $date)->where('status_code', '>=', 400)->count();

            $trafficChart[] = [
                'date'   => $displayDate,
                'total'  => $total,
                'failed' => $failed,
            ];
        }

        // Distribusi status code
        $statusDistRaw = RequestLog::select('status_code', DB::raw('count(*) as total'))
            ->groupBy('status_code')
            ->pluck('total', 'status_code')
            ->toArray();

        $statusDistribution = !empty($statusDistRaw) ? $statusDistRaw : ['200' => 0];

        // Top Applications by request count
        $topApplications = RequestLog::select('application_id', DB::raw('count(*) as hits'))
            ->groupBy('application_id')
            ->with('application')
            ->orderBy('hits', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'application' => $item->application->name ?? 'Aplikasi OPD',
                    'opd'         => $item->application->opd ?? 'Instansi OPD',
                    'hits'        => $item->hits,
                ];
            });

        $recentLogs = RequestLog::with(['application', 'endpoint'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => [
                // Frontend Dashboard Keys
                'total_applications'   => $appsCount,
                'total_endpoints'      => $endpointsCount,
                'active_keys'          => $activeKeysCount,
                'total_hits_today'     => $requestsTodayCount,
                'failed_hits_today'    => $failedRequestsTodayCount,
                'avg_response_time'    => $avgResponseTime,
                'traffic_chart'        => $trafficChart,
                'status_distribution'  => $statusDistribution,
                'top_applications'     => $topApplications,
                'recent_logs'          => $recentLogs,

                // Legacy Keys
                'apps_count'           => $appsCount,
                'endpoints_count'      => $endpointsCount,
                'active_keys_count'    => $activeKeysCount,
                'requests_today_count' => $requestsTodayCount,
                'failed_requests_today_count' => $failedRequestsTodayCount,
            ]
        ]);
    }
}
