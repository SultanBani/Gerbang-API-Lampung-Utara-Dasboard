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
| URL Pattern yang dilayani:
|   /api/auth/*   → Authentication (Login, Me, Logout via AuthController)
|   /api/admin/*  → Admin REST API (protected by auth:sanctum)
|   /gateway/*    → API Gateway Proxy (routes/api.php via ApiGatewayMiddleware)
|   /             → Web routes standar (routes/web.php)
|   /up           → Health check bawaan Laravel
|
| Seluruh routing API (auth, admin, gateway) didefinisikan di routes/api.php.
| Tidak ada lagi pendaftaran ganda via 'then:'.
|
*/

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web:      __DIR__.'/../routes/web.php',
        api:      __DIR__.'/../routes/api.php',
        apiPrefix: '',
        commands: __DIR__.'/../routes/console.php',
        health:   '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // ─── CORS ─────────────────────────────────────────────────────────
        // HandleCors di semua group agar preflight OPTIONS dari frontend
        // React (localhost:5173) dijawab dengan benar.
        $middleware->appendToGroup('web', [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->appendToGroup('api', [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // ─── Alias ────────────────────────────────────────────────────────
        $middleware->alias([
            'api.gateway' => ApiGatewayMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('gateway/*') || $request->is('api/*'),
        );
    })
    ->create();
