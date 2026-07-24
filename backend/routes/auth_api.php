<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auth API Routes — routes/auth_api.php
|--------------------------------------------------------------------------
|
| Route ini didaftarkan dengan prefix /api/auth dan middleware 'admin-api'
| (bebas dari ApiGatewayMiddleware) sehingga login tidak memerlukan API Key.
|
*/

Route::post('/login',  [AuthController::class, 'login']);
Route::get('/me',      [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);
