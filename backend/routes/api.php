<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\AdminStatsController;
use App\Http\Controllers\Api\Admin\NotificationController;
use App\Http\Controllers\Api\Admin\EndpointController;
use App\Http\Controllers\Api\Admin\AccessControlController;
use App\Http\Controllers\Api\Admin\RequestLogController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\OpdManagementController;
use App\Http\Controllers\Api\PadDatasetController;
use App\Http\Controllers\GatewayController;
use Illuminate\Support\Facades\Route;

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC DATASETS (Dapat diakses langsung di browser tanpa header token)
// ─────────────────────────────────────────────────────────────────────────
Route::get('/gateway/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara', [PadDatasetController::class, 'index']);
Route::get('/gateway/keuangan/pad-2023-2024', [PadDatasetController::class, 'index']);
Route::get('/api/v1/pad-2023-2024', [PadDatasetController::class, 'index']);
Route::get('/APIGATELU/bpkad/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara', [PadDatasetController::class, 'index']);

/*
|--------------------------------------------------------------------------
| API Routes — Gerbang API Kabupaten Lampung Utara
|--------------------------------------------------------------------------
|
| 1. /api/auth/login        → Publik (tanpa auth)
| 2. /api/auth/me & logout  → Protected (auth:sanctum)
| 3. /api/admin/*           → Protected Admin (auth:sanctum + role admin)
| 4. /api/opd/*             → Protected OPD (auth:sanctum)
| 5. /APIGATELU/{opd}/{slug}→ Dynamic Gateway Proxy (ApiGatewayMiddleware)
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

    // ─────────────────────────────────────────────────────────────────
    // [3] Admin Management REST API — hanya role 'admin'
    // ─────────────────────────────────────────────────────────────────
    Route::prefix('api/admin')->middleware('role:admin')->group(function () {
        // Dashboard stats
        Route::get('/stats', [AdminStatsController::class, 'index']);

        // OPD Management (menggantikan Application CRUD)
        Route::apiResource('opds', OpdManagementController::class);

        // Endpoint Management
        Route::apiResource('endpoints', EndpointController::class);
        Route::post('endpoints/{id}/status', [EndpointController::class, 'updateStatus']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'getUnread']);
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/test-trigger', [NotificationController::class, 'triggerTestNotification']);

        // Access Control (melalui AccessRequest)
        Route::get('/access-controls',          [AccessControlController::class, 'index']);
        Route::post('/access-controls/toggle',  [AccessControlController::class, 'toggle']);

        // Request Logs
        Route::get('/logs',         [RequestLogController::class, 'index']);
        Route::get('/logs/{id}',    [RequestLogController::class, 'show']);
        Route::delete('/logs/purge',[RequestLogController::class, 'purge']);

        // User Management (admin creates/manages OPD accounts)
        Route::apiResource('users', UserManagementController::class);
    });

    // ─────────────────────────────────────────────────────────────────
    // [4] OPD Dashboard API — authenticated users with opd role
    // ─────────────────────────────────────────────────────────────────
    Route::prefix('api/opd')->group(function () {
        Route::get('/catalog', [\App\Http\Controllers\Api\OpdController::class, 'catalog']);
        Route::get('/my-endpoints', [\App\Http\Controllers\Api\OpdController::class, 'myEndpoints']);
        Route::post('/my-endpoints', [\App\Http\Controllers\Api\OpdController::class, 'storeEndpoint']);
        Route::put('/my-endpoints/{id}', [\App\Http\Controllers\Api\OpdController::class, 'updateEndpoint']);
        Route::delete('/my-endpoints/{id}', [\App\Http\Controllers\Api\OpdController::class, 'destroyEndpoint']);
        
        Route::get('/incoming-requests', [\App\Http\Controllers\Api\OpdController::class, 'incomingRequests']);
        Route::patch('/incoming-requests/{id}/{action}', [\App\Http\Controllers\Api\OpdController::class, 'processRequest']);
        
        Route::get('/my-access-requests', [\App\Http\Controllers\Api\OpdController::class, 'myAccessRequests']);
        Route::post('/access-requests', [\App\Http\Controllers\Api\OpdController::class, 'submitRequest']);
    });
});

// ─────────────────────────────────────────────────────────────────────────
// [5] GATEWAY PROXY — /APIGATELU/{opd_code}/{endpoint_slug}
//     ApiGatewayMiddleware melakukan validasi API Key, resolve endpoint,
//     cek method permission, lalu proxy pass ke upstream target_url.
// ─────────────────────────────────────────────────────────────────────────
Route::get('/APIGATELU/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'Gerbang API Lampung Utara',
        'version' => '2.0.0',
        'status'  => 'operational',
        'time'    => now()->toIso8601String(),
    ]);
})->name('gateway.health');

Route::any('/APIGATELU/{opd_code}/{endpoint_slug}', [GatewayController::class, 'handle'])
    ->middleware('api.gateway')
    ->name('gateway.proxy');
