<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Application;
use App\Models\Endpoint;
use App\Models\ApiKey;
use App\Models\RequestLog;

class DashboardController extends Controller
{
    public function index()
    {
        $appsCount = Application::count();
        $endpointsCount = Endpoint::count();
        $activeKeysCount = ApiKey::where('status', 'active')->count();
        
        $requestsTodayCount = RequestLog::whereDate('created_at', today())->count();
        $failedRequestsTodayCount = RequestLog::whereDate('created_at', today())
            ->where('status_code', '>=', 400)
            ->count();

        $recentLogs = RequestLog::with(['application', 'endpoint'])
            ->latest()
            ->take(5)
            ->get();

        return view('dashboard', compact(
            'appsCount',
            'endpointsCount',
            'activeKeysCount',
            'requestsTodayCount',
            'failedRequestsTodayCount',
            'recentLogs'
        ));
    }
}
