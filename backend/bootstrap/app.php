<?php

use App\Http\Middleware\ApiGatewayMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Create The Application — Laravel 13 Bootstrap Style
|--------------------------------------------------------------------------
|
| Semua konfigurasi middleware, routing, dan exception handling dilakukan
| secara fluent di sini tanpa Kernel.php (dihapus di Laravel 13).
|
| URL Pattern yang dilayani:
|   /gateway/*   → API Gateway (routes/api.php via ApiGatewayMiddleware)
|   /            → Web routes standar (routes/web.php)
|   /up           → Health check bawaan Laravel
|
*/

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // Route web standar (Breeze auth, dll.)
        web: __DIR__.'/../routes/web.php',

        // Route API Gateway — semua request /gateway/* masuk ke sini
        // apiPrefix: 'gateway' menggantikan prefix default '/api'
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'gateway',

        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ─── Daftarkan alias untuk digunakan di routes/api.php ───────
        $middleware->alias([
            'api.gateway' => ApiGatewayMiddleware::class,
        ]);

        // ─── Lampirkan middleware ke grup 'api' secara global ────────
        // Semua route di routes/api.php (prefix /gateway/*) otomatis
        // melewati pipeline ApiGatewayMiddleware sebelum mencapai controller.
        $middleware->appendToGroup('api', [
            ApiGatewayMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render semua exception sebagai JSON di endpoint gateway & api
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('gateway/*') || $request->is('api/*'),
        );
    })
    ->create();
