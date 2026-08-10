<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Opd;
use App\Models\Endpoint;
use App\Models\RequestLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * AdminStatsController
 *
 * Menyediakan data statistik real-time dari database untuk
 * ditampilkan di halaman Dashboard Admin React.
 *
 * GET /api/admin/stats
 */
class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        // ── Statistik Dasar ──────────────────────────────────────────
        $totalOpds      = Opd::count();
        $totalEndpoints = Endpoint::count();
        $totalUsers     = User::count();
        $activeEndpoints = Endpoint::where('is_active', true)->count();

        // ── Traffic Hari Ini ─────────────────────────────────────────
        $totalHitsToday  = RequestLog::whereDate('created_at', today())->count();
        $failedHitsToday = RequestLog::whereDate('created_at', today())
            ->where('status_code', '>=', 400)
            ->count();

        // ── Rata-rata Response Time (semua log yang ada) ─────────────
        $avgResponseTime = (int) round(
            RequestLog::avg('response_time_ms') ?? 0
        );

        // ── Distribusi Status Code Hari Ini ──────────────────────────
        $statusDistribution = RequestLog::whereDate('created_at', today())
            ->select('status_code', DB::raw('count(*) as total'))
            ->groupBy('status_code')
            ->orderBy('status_code')
            ->get()
            ->mapWithKeys(fn ($row) => [(string) $row->status_code => $row->total]);

        // ── Traffic Chart — 7 Hari Terakhir ──────────────────────────
        $sevenDaysAgo = Carbon::today()->subDays(6);
        $trafficData = RequestLog::select(
                DB::raw('DATE(created_at) as date_val'),
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as failed')
            )
            ->where('created_at', '>=', $sevenDaysAgo)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy('date_val');

        $trafficChart = collect(range(6, 0))->map(function (int $daysAgo) use ($trafficData): array {
            $date = Carbon::today()->subDays($daysAgo);
            $dateString = $date->format('Y-m-d');
            $data = $trafficData->get($dateString);

            return [
                'date'   => $date->format('d M'),
                'total'  => $data ? (int) $data->total : 0,
                'failed' => $data ? (int) $data->failed : 0,
            ];
        })->values()->all();

        // ── Top 5 Endpoint Paling Banyak Dipanggil ───────────────────
        $topEndpoints = RequestLog::select('endpoint_id', 'url', 'method', DB::raw('count(*) as hits'))
            ->whereNotNull('endpoint_id')
            ->groupBy('endpoint_id', 'url', 'method')
            ->orderByDesc('hits')
            ->limit(5)
            ->get();

        // ── OPD Teraktif (hits 7 hari terakhir) ─────────────────────
        $topApplications = RequestLog::with('opd')
            ->select('opd_id', DB::raw('count(*) as hits'))
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->whereNotNull('opd_id')
            ->groupBy('opd_id')
            ->orderByDesc('hits')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'application' => $log->opd->name ?? 'Unknown',
                    'opd'         => $log->opd->code ?? '-',
                    'hits'        => $log->hits,
                ];
            });

        // ── Recent logs ──────────────────────────────────────────────
        $recentLogs = RequestLog::with(['endpoint', 'opd'])
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard statistics retrieved successfully.',
            'data'    => [
                'total_applications'  => $totalOpds,
                'total_endpoints'     => $totalEndpoints,
                'total_users'         => $totalUsers,
                'active_keys'         => $activeEndpoints,
                'total_hits_today'    => $totalHitsToday,
                'failed_hits_today'   => $failedHitsToday,
                'avg_response_time'   => $avgResponseTime,
                'status_distribution' => $statusDistribution,
                'traffic_chart'       => $trafficChart,
                'top_endpoints'       => $topEndpoints,
                'top_applications'    => $topApplications,
                'recent_logs'         => $recentLogs,
            ],
        ]);
    }
}
