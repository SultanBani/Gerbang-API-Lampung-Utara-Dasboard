<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Application;
use App\Models\Endpoint;
use App\Models\RequestLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * DashboardStatsController
 *
 * Menyediakan data statistik real-time dari database untuk
 * ditampilkan di halaman Dashboard Admin React.
 *
 * GET /api/admin/stats
 */
class DashboardStatsController extends Controller
{
    /**
     * Kembalikan statistik ringkasan gateway.
     */
    public function index(): JsonResponse
    {
        // ── Statistik Dasar ──────────────────────────────────────────
        $totalApplications = Application::count();
        $totalEndpoints    = Endpoint::count();
        $activeKeys        = ApiKey::where('status', 'active')->count();

        // ── Traffic Hari Ini ─────────────────────────────────────────
        $totalHitsToday   = RequestLog::whereDate('created_at', today())->count();
        $failedHitsToday  = RequestLog::whereDate('created_at', today())
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
        // Menghasilkan array [{date, total, failed}] untuk grafik line chart.
        $trafficChart = collect(range(6, 0))->map(function (int $daysAgo): array {
            $date  = Carbon::today()->subDays($daysAgo);
            $total = RequestLog::whereDate('created_at', $date)->count();
            $failed = RequestLog::whereDate('created_at', $date)
                ->where('status_code', '>=', 400)
                ->count();

            return [
                'date'   => $date->format('d M'),
                'total'  => $total,
                'failed' => $failed,
            ];
        })->values()->all();

        // ── Top 5 Endpoint Paling Banyak Dipanggil ───────────────────
        $topEndpoints = RequestLog::select('url', 'method', DB::raw('count(*) as hits'))
            ->groupBy('url', 'method')
            ->orderByDesc('hits')
            ->limit(5)
            ->get();

        // ── Aplikasi Teraktif (hits 7 hari terakhir) ─────────────────
        $topApplications = RequestLog::select('application_id', DB::raw('count(*) as hits'))
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->whereNotNull('application_id')
            ->groupBy('application_id')
            ->orderByDesc('hits')
            ->limit(5)
            ->with('application:id,name,opd')
            ->get()
            ->map(fn ($log) => [
                'application' => $log->application?->name ?? 'Unknown',
                'opd'         => $log->application?->opd ?? '-',
                'hits'        => $log->hits,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard statistics retrieved successfully.',
            'data'    => [
                'total_applications'  => $totalApplications,
                'total_endpoints'     => $totalEndpoints,
                'active_keys'         => $activeKeys,
                'total_hits_today'    => $totalHitsToday,
                'failed_hits_today'   => $failedHitsToday,
                'avg_response_time'   => $avgResponseTime,
                'status_distribution' => $statusDistribution,
                'traffic_chart'       => $trafficChart,
                'top_endpoints'       => $topEndpoints,
                'top_applications'    => $topApplications,
            ],
        ]);
    }
}
