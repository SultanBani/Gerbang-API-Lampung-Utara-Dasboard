<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\ApplicationController;
use App\Http\Controllers\Api\Admin\EndpointController;
use App\Http\Controllers\Api\Admin\AccessControlController;
use App\Http\Controllers\Api\Admin\RequestLogController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\GatewayController;
use App\Http\Middleware\ApiGatewayMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Gerbang API Kabupaten Lampung Utara
|--------------------------------------------------------------------------
|
| 1. /api/auth/login        → Publik (tanpa auth)
| 2. /api/auth/me & logout  → Protected (auth:sanctum)
| 3. /api/admin/*           → Protected Admin (auth:sanctum)
| 4. /gateway/*             → Dynamic Gateway Proxy (ApiGatewayMiddleware)
|
*/

// ─────────────────────────────────────────────────────────────────────────
// [1] PUBLIC — Login (tidak memerlukan token)
// ─────────────────────────────────────────────────────────────────────────
Route::prefix('api/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// ─────────────────────────────────────────────────────────────────────────
// [2] PROTECTED — Routes yang membutuhkan Sanctum token
// ─────────────────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth endpoints
    Route::prefix('api/auth')->group(function () {
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/logout',  [AuthController::class, 'logout']);
    });

    // Admin Management REST API
    Route::prefix('api/admin')->group(function () {
        // Dashboard stats
        Route::get('/stats', [AdminStatsController::class, 'index']);

        // Applications & API Keys
        Route::apiResource('applications', ApplicationController::class);
        Route::post('/applications/{id}/generate-key', [ApplicationController::class, 'generateKey']);

        // Endpoints
        Route::apiResource('endpoints', EndpointController::class);

        // Access Control Matrix
        Route::get('/access-controls',          [AccessControlController::class, 'index']);
        Route::post('/access-controls/toggle',  [AccessControlController::class, 'toggle']);

        // Request Logs
        Route::get('/logs', [RequestLogController::class, 'index']);

        // User Management (admin creates/manages dinas accounts)
        Route::apiResource('users', UserManagementController::class);
    });
});

// ─────────────────────────────────────────────────────────────────────────
// [3] GATEWAY PROXY (/gateway) — ApiGatewayMiddleware pipeline
// ─────────────────────────────────────────────────────────────────────────
Route::get('/gateway/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'Gerbang API Lampung Utara',
        'version' => '1.0.0',
        'status'  => 'operational',
        'time'    => now()->toIso8601String(),
    ]);
})->name('gateway.health');

Route::any('/gateway/{path}', [GatewayController::class, 'handle'])
    ->where('path', '.*')
    ->middleware('api.gateway')
    ->name('gateway.proxy');
