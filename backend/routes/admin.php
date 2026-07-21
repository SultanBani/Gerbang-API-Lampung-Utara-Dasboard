<?php

use App\Http\Controllers\Api\Admin\AccessControlController;
use App\Http\Controllers\Api\Admin\ApplicationController;
use App\Http\Controllers\Api\Admin\DashboardStatsController;
use App\Http\Controllers\Api\Admin\EndpointManagementController;
use App\Http\Controllers\Api\Admin\RequestLogController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin API Routes — routes/admin.php
|--------------------------------------------------------------------------
|
| Seluruh route di file ini dilayani dengan prefix /api/admin/ dan
| menggunakan middleware group 'admin-api' (tanpa ApiGatewayMiddleware).
|
| Route ini diregistrasikan via callback 'then' di bootstrap/app.php
| sehingga TIDAK terkena ApiGatewayMiddleware global di grup 'api'.
|
| Base URL: http://localhost:8000/api/admin/
|
| ┌──────────────────────────────────────────────────────────────────┐
| │  Dashboard Stats                                                 │
| │  GET  /api/admin/stats                                           │
| │                                                                  │
| │  Applications                                                    │
| │  GET    /api/admin/applications                                  │
| │  POST   /api/admin/applications                                  │
| │  GET    /api/admin/applications/{id}                             │
| │  PUT    /api/admin/applications/{id}                             │
| │  DELETE /api/admin/applications/{id}                             │
| │  POST   /api/admin/applications/{id}/generate-key               │
| │                                                                  │
| │  Endpoints                                                       │
| │  GET    /api/admin/endpoints                                     │
| │  POST   /api/admin/endpoints                                     │
| │  GET    /api/admin/endpoints/{id}                                │
| │  PUT    /api/admin/endpoints/{id}                                │
| │  DELETE /api/admin/endpoints/{id}                                │
| │                                                                  │
| │  Access Controls                                                 │
| │  GET  /api/admin/access-controls                                 │
| │  POST /api/admin/access-controls/toggle                          │
| │                                                                  │
| │  Request Logs                                                    │
| │  GET    /api/admin/logs                                          │
| │  GET    /api/admin/logs/{id}                                     │
| │  DELETE /api/admin/logs/purge                                    │
| └──────────────────────────────────────────────────────────────────┘
|
*/

// ─────────────────────────────────────────────────────────────────────
// Health Check Admin
// ─────────────────────────────────────────────────────────────────────
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'Gerbang API Admin — Lampung Utara',
        'version' => '1.0.0',
        'status'  => 'operational',
        'time'    => now()->toIso8601String(),
    ]);
})->name('admin.health');

// ─────────────────────────────────────────────────────────────────────
// [1] Dashboard Statistics
// ─────────────────────────────────────────────────────────────────────
Route::get('/stats', [DashboardStatsController::class, 'index'])
    ->name('admin.stats');

// ─────────────────────────────────────────────────────────────────────
// [2] Applications — CRUD + Generate Key
// ─────────────────────────────────────────────────────────────────────
Route::prefix('applications')->name('admin.applications.')->group(function () {
    Route::get('/',          [ApplicationController::class, 'index'])       ->name('index');
    Route::post('/',         [ApplicationController::class, 'store'])       ->name('store');
    Route::get('/{id}',      [ApplicationController::class, 'show'])        ->name('show');
    Route::put('/{id}',      [ApplicationController::class, 'update'])      ->name('update');
    Route::delete('/{id}',   [ApplicationController::class, 'destroy'])     ->name('destroy');
    Route::post('/{id}/generate-key', [ApplicationController::class, 'generateKey'])->name('generate-key');
});

// ─────────────────────────────────────────────────────────────────────
// [3] Endpoints — CRUD
// ─────────────────────────────────────────────────────────────────────
Route::prefix('endpoints')->name('admin.endpoints.')->group(function () {
    Route::get('/',        [EndpointManagementController::class, 'index'])   ->name('index');
    Route::post('/',       [EndpointManagementController::class, 'store'])   ->name('store');
    Route::get('/{id}',    [EndpointManagementController::class, 'show'])    ->name('show');
    Route::put('/{id}',    [EndpointManagementController::class, 'update'])  ->name('update');
    Route::delete('/{id}', [EndpointManagementController::class, 'destroy']) ->name('destroy');
});

// ─────────────────────────────────────────────────────────────────────
// [4] Access Controls — Matrix & Toggle
// ─────────────────────────────────────────────────────────────────────
Route::prefix('access-controls')->name('admin.access-controls.')->group(function () {
    Route::get('/',        [AccessControlController::class, 'index'])  ->name('index');
    Route::post('/toggle', [AccessControlController::class, 'toggle']) ->name('toggle');
});

// ─────────────────────────────────────────────────────────────────────
// [5] Request Logs — Read + Purge
// ─────────────────────────────────────────────────────────────────────
Route::prefix('logs')->name('admin.logs.')->group(function () {
    Route::get('/',         [RequestLogController::class, 'index'])->name('index');
    Route::delete('/purge', [RequestLogController::class, 'purge'])->name('purge');
    Route::get('/{id}',     [RequestLogController::class, 'show']) ->name('show');
});
