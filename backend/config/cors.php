<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration — Gerbang API Lampung Utara
    |--------------------------------------------------------------------------
    |
    | Mengizinkan frontend React dev server (Vite) di localhost:5173 untuk
    | mengakses endpoint /api/admin/* dan /gateway/*.
    |
    */

    'paths' => ['api/*', 'gateway/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Client-ID',
        'X-Secret-Key',
        'Accept',
        'X-Requested-With',
        'Origin',
    ],

    'exposed_headers' => [
        'X-Request-ID',
    ],

    'max_age' => 86400,

    'supports_credentials' => false,

];
