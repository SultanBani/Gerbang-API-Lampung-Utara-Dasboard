<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PadDatasetController;

// Endpoint Publik yang dapat dibuka langsung via browser
Route::get('/gateway/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara', [PadDatasetController::class, 'index']);
Route::get('/gateway/keuangan/pad-2023-2024', [PadDatasetController::class, 'index']);
Route::get('/api/v1/pad-2023-2024', [PadDatasetController::class, 'index']);
Route::get('/APIGATELU/bpkad/jumlah-pendapatan-asli-daerah-pad-tahun-2023-2024-kab-lampung-utara', [PadDatasetController::class, 'index']);

Route::fallback(function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return response()->json(['message' => 'Frontend build tidak ditemukan.'], 404);
});
