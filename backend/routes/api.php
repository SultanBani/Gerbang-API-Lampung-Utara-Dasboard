<?php

use App\Http\Controllers\GatewayController;
use App\Http\Middleware\ApiGatewayMiddleware;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Gateway Routes — routes/api.php
|--------------------------------------------------------------------------
|
| Semua route di file ini memiliki prefix /gateway (dikonfigurasi via
| bootstrap/app.php → withRouting(apiPrefix: 'gateway')).
|
| ApiGatewayMiddleware sudah di-append ke grup 'api' secara global,
| sehingga SETIAP request /gateway/* melewati 4-layer pipeline:
|   L1: Auth API Key  →  L2: Resolve Endpoint  →  L3: Access Control
|   L4: Proxy & Logging
|
| ┌─────────────────────────────────────────────────────────────────┐
| │  Contoh pemanggilan dari sisi klien:                            │
| │                                                                 │
| │  GET /gateway/dukcapil/penduduk                                 │
| │    -H "X-Client-ID: 1"                                          │
| │    -H "X-Secret-Key: your_api_key_here"                         │
| │                                                                 │
| │  POST /gateway/kepegawaian/v1/data                              │
| │    -H "X-Client-ID: 2"                                          │
| │    -H "X-Secret-Key: your_api_key_here"                         │
| │    -H "Content-Type: application/json"                          │
| │    -d '{"nik": "1234567890"}'                                   │
| └─────────────────────────────────────────────────────────────────┘
|
*/

// ─────────────────────────────────────────────────────────────────────
// [1] Health-check endpoint gateway
//
// Tidak memerlukan API Key — digunakan untuk monitoring uptime
// oleh load balancer, Laragon dashboard, atau tools eksternal.
//
// URL: GET /gateway/health
// ─────────────────────────────────────────────────────────────────────
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'service' => 'Gerbang API Lampung Utara',
        'version' => '1.0.0',
        'status'  => 'operational',
        'time'    => now()->toIso8601String(),
    ]);
})->withoutMiddleware(ApiGatewayMiddleware::class)
  ->name('gateway.health');

// ─────────────────────────────────────────────────────────────────────
// [2] WILDCARD DYNAMIC ROUTE — Inti dari API Gateway
//
// Menangkap SEMUA path setelah /gateway/ dengan segala kedalaman:
//   /gateway/dukcapil/penduduk
//   /gateway/kepegawaian/v1/data
//   /gateway/bkd/pegawai/123
//
// Route::any() mendukung GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.
// ->where('path', '.*') memastikan nested path (dengan slash) juga cocok.
//
// ApiGatewayMiddleware sudah aktif secara global, tapi kita tetap
// pasang eksplisit di sini agar jelas dan dapat di-override per-route.
//
// URL Pattern: ANY /gateway/{any_nested_path}
// ─────────────────────────────────────────────────────────────────────
Route::any('/{path}', [GatewayController::class, 'handle'])
    ->where('path', '.*')
    ->middleware('api.gateway')
    ->name('gateway.proxy');
