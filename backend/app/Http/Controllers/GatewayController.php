<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GatewayController
 *
 * Controller tipis (thin controller) yang berfungsi sebagai titik masuk
 * untuk semua request dinamis gateway. Logic utama ada di ApiGatewayMiddleware.
 *
 * Controller ini dipanggil SETELAH middleware selesai memvalidasi dan
 * mem-proxy request. Dalam skenario normal, middleware mengembalikan
 * response lebih awal (sebelum mencapai controller ini) menggunakan
 * return response()->json(...).
 *
 * Method `handle()` di sini berperan sebagai fallback / "pass-through"
 * jika dikonfigurasi dalam mode yang berbeda di masa mendatang.
 */
class GatewayController extends Controller
{
    /**
     * Titik masuk tunggal untuk semua request proxy gateway.
     *
     * Karena ApiGatewayMiddleware mengembalikan response secara langsung
     * (short-circuit) setelah proxy selesai, method ini hanya dipanggil
     * jika terjadi kondisi tak terduga di luar pipeline middleware.
     */
    public function handle(Request $request, string $path = ''): Response
    {
        // Middleware seharusnya sudah menangani dan me-return response.
        // Jika sampai di sini, ada kemungkinan middleware di-bypass atau
        // konfigurasi routing ada yang salah.
        return response()->json([
            'success' => false,
            'message' => 'Gateway Error: Request was not processed by the middleware pipeline.',
            'path'    => $path,
        ], 500);
    }
}
