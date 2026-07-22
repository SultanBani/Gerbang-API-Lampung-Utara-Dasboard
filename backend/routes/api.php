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
| File ini menangani 3 domain utama:
|   1. /api/auth/*     → Authentication (Login Admin & Login Dinas OPD)
|   2. /api/admin/*    → Dashboard & REST API Management (Applications, Endpoints, Access Controls, Logs, Users)
|   3. /gateway/*      → Dynamic Gateway Proxy (4-layer pipeline via ApiGatewayMiddleware)
|
*/

// ─────────────────────────────────────────────────────────────────────────
// [1] AUTHENTICATION API (/api/auth)
// ─────────────────────────────────────────────────────────────────────────
Route::prefix('api/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// ─────────────────────────────────────────────────────────────────────────
// [2] ADMIN MANAGEMENT REST API (/api/admin)
// ─────────────────────────────────────────────────────────────────────────
Route::prefix('api/admin')->group(function () {
    // Stats overview
    Route::get('/stats', [AdminStatsController::class, 'index']);

    // Applications & API Keys
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications/{id}', [ApplicationController::class, 'show']);
    Route::put('/applications/{id}', [ApplicationController::class, 'update']);
    Route::delete('/applications/{id}', [ApplicationController::class, 'destroy']);
    Route::post('/applications/{id}/generate-key', [ApplicationController::class, 'generateKey']);

    // Endpoints
    Route::get('/endpoints', [EndpointController::class, 'index']);
    Route::post('/endpoints', [EndpointController::class, 'store']);
    Route::put('/endpoints/{id}', [EndpointController::class, 'update']);
    Route::delete('/endpoints/{id}', [EndpointController::class, 'destroy']);

    // Access Control Matrix
    Route::get('/access-controls', [AccessControlController::class, 'index']);
    Route::post('/access-controls/toggle', [AccessControlController::class, 'toggle']);

    // Logs
    Route::get('/logs', [RequestLogController::class, 'index']);

    // User Management (Admin & Dinas accounts)
    Route::get('/users', [UserManagementController::class, 'index']);
    Route::post('/users', [UserManagementController::class, 'store']);
    Route::put('/users/{id}', [UserManagementController::class, 'update']);
    Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
});

// ─────────────────────────────────────────────────────────────────────────
// [3] GATEWAY PROXY ROUTES (/gateway)
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
