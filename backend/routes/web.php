<?php

use Illuminate\Support\Facades\Route;

Route::fallback(function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return response()->json(['message' => 'Frontend build tidak ditemukan.'], 404);
});
