<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * GatewayController — Gerbang API Lampung Utara
 *
 * Controller proxy yang menerima request setelah ApiGatewayMiddleware
 * selesai memvalidasi autentikasi, resolusi endpoint, dan kontrol akses.
 *
 * Dalam arsitektur ini, middleware melakukan short-circuit dan langsung
 * mengembalikan response setelah proxy selesai. Controller ini berfungsi
 * sebagai fallback jika middleware tidak mengembalikan response.
 *
 * URL Pattern: /APIGATELU/{opd_code}/{endpoint_slug}
 */
class GatewayController extends Controller
{
    /**
     * Handle proxy request ke upstream service.
     *
     * Method ini hanya dipanggil jika middleware TIDAK melakukan short-circuit.
     * Dalam operasi normal, ApiGatewayMiddleware sudah mengembalikan response
     * sebelum sampai ke sini.
     *
     * @param Request $request
     * @param string  $opd_code       Kode OPD dari URL (e.g. 'diskominfo')
     * @param string  $endpoint_slug  Slug endpoint dari URL (e.g. 'data-pegawai')
     */
    public function handle(Request $request, string $opd_code, string $endpoint_slug): Response
    {
        // Middleware seharusnya sudah menangani dan me-return response.
        // Jika sampai di sini, ada kemungkinan middleware di-bypass atau
        // konfigurasi routing ada yang salah.
        return response()->json([
            'success' => false,
            'message' => 'Gateway Error: Request tidak diproses oleh middleware pipeline.',
            'meta'    => [
                'opd_code'      => $opd_code,
                'endpoint_slug' => $endpoint_slug,
                'method'        => $request->method(),
            ],
        ], 500);
    }
}
