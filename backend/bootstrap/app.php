<?php

use App\Http\Middleware\ApiGatewayMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Create The Application — Laravel 13 Bootstrap Style
|--------------------------------------------------------------------------
|
| URL Pattern yang dilayani:
|   /gateway/*    → API Gateway Proxy (routes/api.php via ApiGatewayMiddleware)
|   /api/admin/*  → Admin REST API (routes/admin.php) — bebas dari gateway MW
|   /             → Web routes standar (routes/web.php)
|   /up            → Health check bawaan Laravel
|
*/

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        api:      __DIR__.'/../routes/api.php',
        apiPrefix: '',

        commands: __DIR__.'/../routes/console.php',
        health:   '/up',

        // Route Admin didaftarkan di 'then' agar bebas dari ApiGatewayMiddleware.
        // Menggunakan middleware group 'admin-api' yang TIDAK berisi gateway middleware.
        then: function (): void {
            Route::middleware('admin-api')
                ->prefix('api/admin')
                ->group(base_path('routes/admin.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ─── CORS ────────────────────────────────────────────────────────
        // Tambahkan HandleCors di kedua group agar preflight OPTIONS
        // dari frontend React (localhost:5173) dijawab dengan benar.
        $middleware->appendToGroup('web', [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // ─── Buat group 'admin-api' — tanpa ApiGatewayMiddleware ─────────
        // Group ini mewarisi perilaku dasar JSON API tapi tidak mengandung
        // middleware proxy gateway.
        $middleware->appendToGroup('admin-api', [
            \Illuminate\Http\Middleware\HandleCors::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // ─── Alias ─────────────────────────────────────────────────────
        $middleware->alias([
            'api.gateway' => ApiGatewayMiddleware::class,
        ]);

        // ─── Lampirkan ApiGatewayMiddleware HANYA ke grup 'api' ─────────
        // Grup 'api' dipakai oleh routes/api.php (gateway proxy).
        $middleware->appendToGroup('api', [
            ApiGatewayMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('gateway/*') || $request->is('api/*'),
        );
    })
    ->create();
