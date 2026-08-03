<?php

namespace App\Http\Middleware;

use App\Models\Endpoint;
use App\Models\Opd;
use App\Models\RequestLog;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * ApiGatewayMiddleware — Gerbang API Lampung Utara (Multi-Tenant OPD)
 *
 * Middleware utama yang memvalidasi setiap request masuk ke gateway
 * sebelum di-proxy ke upstream service milik OPD tujuan.
 *
 * URL Pattern: /APIGATELU/{opd_code}/{endpoint_slug}
 *
 * Pipeline 3-Layer (Public Gateway — tanpa API Key):
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  L1: Resolve OPD & Endpoint  → 404 jika OPD/slug tidak ditemukan │
 * │  L2: Method Permission       → 405 jika HTTP method tidak diizin  │
 * │  L3: Proxy + Logging         → Forward ke upstream, catat di DB   │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * Semua data API yang dipublikasikan OPD bersifat publik dan dapat
 * diakses oleh siapa saja tanpa memerlukan API Key.
 */
class ApiGatewayMiddleware
{
    // Header internal yang TIDAK diteruskan ke upstream
    private const STRIPPED_HEADERS = [
        'host',
        'x-api-key',
        'content-length',
        'transfer-encoding',
        'connection',
    ];

    /**
     * Handle an incoming gateway request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle CORS Preflight (OPTIONS request dari browser)
        if ($request->isMethod('OPTIONS')) {
            return response()->json(['status' => 'OK'], 200, $this->corsHeaders());
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 1 — Resolve OPD & Endpoint dari URL segments
        // URL: /APIGATELU/{opd_code}/{endpoint_slug}
        // ═══════════════════════════════════════════════════════════════
        $opdCode      = $request->route('opd_code');
        $endpointSlug = $request->route('endpoint_slug');

        if (! $opdCode || ! $endpointSlug) {
            return $this->errorResponse(
                'Bad Request: Parameter opd_code dan endpoint_slug wajib diisi.',
                400
            );
        }

        /** @var Opd|null $opd */
        $opd = Opd::where('code', $opdCode)->first();

        if (! $opd) {
            return $this->errorResponse(
                sprintf('Not Found: OPD dengan kode "%s" tidak ditemukan.', $opdCode),
                404
            );
        }

        /** @var Endpoint|null $endpoint */
        $endpoint = Endpoint::where('opd_id', $opd->id)
            ->where('slug', $endpointSlug)
            ->first();

        if (! $endpoint) {
            return $this->errorResponse(
                sprintf('Not Found: Endpoint "%s" tidak ditemukan pada OPD "%s".', $endpointSlug, $opd->name),
                404
            );
        }

        // Cek apakah endpoint aktif
        if (! $endpoint->is_active) {
            return $this->errorResponse(
                sprintf('Service Unavailable: Endpoint "%s" sedang tidak aktif.', $endpoint->title),
                503
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2 — Validasi HTTP Method
        // Cek apakah method request diizinkan di method_permissions endpoint
        // ═══════════════════════════════════════════════════════════════
        $requestMethod  = strtoupper($request->method());
        $allowedMethods = array_map('strtoupper', $endpoint->method_permissions ?? ['GET']);

        if (! in_array($requestMethod, $allowedMethods, true)) {
            return $this->errorResponse(
                sprintf(
                    'Method Not Allowed: HTTP %s tidak diizinkan. Method yang diizinkan: %s.',
                    $requestMethod,
                    implode(', ', $allowedMethods)
                ),
                405
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3 — Proxy Request ke Upstream & Request Logging
        // ═══════════════════════════════════════════════════════════════

        $startTime = microtime(true);
        $requestId = (string) Str::uuid();

        // Siapkan headers upstream
        $upstreamHeaders = $this->buildUpstreamHeaders(
            $request,
            $opd->name,
            $requestId
        );

        // Capture payload request untuk logging
        $requestPayload = [
            'method' => $requestMethod,
            'opd'    => $opdCode,
            'slug'   => $endpointSlug,
            'query'  => $request->query() ?: null,
            'body'   => $request->isJson() ? $request->json()->all() : ($request->all() ?: null),
        ];

        // Inisialisasi variabel response
        $httpStatus      = 500;
        $responsePayload = null;

        try {
            $proxyResponse = $this->forwardRequest($request, $endpoint->target_url, $upstreamHeaders);

            $httpStatus      = $proxyResponse->status();
            $rawBody         = $proxyResponse->body();
            $jsonData        = $proxyResponse->json();

            // Auto-convert CSV upstream response to structured JSON
            if (! $jsonData && (str_contains(strtolower($endpoint->target_url), '.csv') || str_contains(strtolower($proxyResponse->header('Content-Type') ?? ''), 'csv'))) {
                $jsonData = $this->parseCsvToJson($rawBody);
            }

            $responsePayload = $jsonData ?? $rawBody;

        } catch (ConnectionException $e) {
            $httpStatus = 502;
            $responsePayload = [
                'error'   => 'Bad Gateway: Upstream service tidak dapat dijangkau atau timeout.',
                'details' => $e->getMessage(),
            ];

            Log::warning('[ApiGateway] Upstream connection failed', [
                'request_id'   => $requestId,
                'upstream_url' => $endpoint->target_url,
                'opd'          => $opdCode,
                'error'        => $e->getMessage(),
            ]);

        } catch (\Throwable $e) {
            $httpStatus = 502;
            $responsePayload = [
                'error'   => 'Bad Gateway: Terjadi kesalahan tidak terduga saat meneruskan request.',
                'details' => $e->getMessage(),
            ];

            Log::error('[ApiGateway] Unexpected proxy error', [
                'request_id'   => $requestId,
                'upstream_url' => $endpoint->target_url,
                'opd'          => $opdCode,
                'error'        => $e->getMessage(),
                'trace'        => $e->getTraceAsString(),
            ]);
        }

        // Hitung waktu eksekusi
        $responseTimeMs = (int) round((microtime(true) - $startTime) * 1000);

        // Simpan log ke request_logs
        $this->writeLog([
            'endpoint_id'       => $endpoint->id,
            'opd_id'            => $opd->id,
            'method'            => $requestMethod,
            'url'               => sprintf('/APIGATELU/%s/%s', $opdCode, $endpointSlug),
            'status_code'       => $httpStatus,
            'response_time_ms'  => $responseTimeMs,
            'ip_address'        => $request->ip(),
            'request_payload'   => json_encode($requestPayload, JSON_UNESCAPED_UNICODE),
            'response_payload'  => is_array($responsePayload)
                ? json_encode($responsePayload, JSON_UNESCAPED_UNICODE)
                : (string) $responsePayload,
        ]);

        // Kembalikan response ke klien
        return $this->gatewayResponse($responsePayload, $httpStatus, $responseTimeMs, $requestId);
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────

    /**
     * Bangun headers untuk diteruskan ke upstream.
     */
    private function buildUpstreamHeaders(Request $request, string $opdName, string $requestId): array
    {
        $headers = [];

        foreach ($request->headers->all() as $name => $values) {
            if (in_array(strtolower($name), self::STRIPPED_HEADERS, true)) {
                continue;
            }
            $headers[$name] = $values[0] ?? '';
        }

        // Header forwarding gateway
        $headers['X-Forwarded-For']  = $request->ip();
        $headers['X-Forwarded-Host'] = $request->getHost();
        $headers['X-Gateway-OPD']    = $opdName;
        $headers['X-Request-ID']     = $requestId;
        $headers['Accept']           = 'application/json';

        return $headers;
    }

    /**
     * Forward request ke upstream URL menggunakan Laravel HTTP Client.
     */
    private function forwardRequest(
        Request $request,
        string  $upstreamUrl,
        array   $headers
    ): \Illuminate\Http\Client\Response {
        $method = strtolower($request->method());

        $targetUrl = rtrim($upstreamUrl, '/');
        if ($request->getQueryString()) {
            $targetUrl .= '?' . $request->getQueryString();
        }

        $pending = Http::withHeaders($headers)->timeout(30);

        return match ($method) {
            'get'    => $pending->get($targetUrl),
            'post'   => $pending->withBody($request->getContent(), $request->header('Content-Type', 'application/json'))->post($targetUrl),
            'put'    => $pending->withBody($request->getContent(), $request->header('Content-Type', 'application/json'))->put($targetUrl),
            'patch'  => $pending->withBody($request->getContent(), $request->header('Content-Type', 'application/json'))->patch($targetUrl),
            'delete' => $pending->delete($targetUrl),
            default  => $pending->get($targetUrl),
        };
    }

    /**
     * Simpan entri ke tabel request_logs secara aman.
     */
    private function writeLog(array $data): void
    {
        try {
            RequestLog::create($data);
        } catch (\Throwable $e) {
            Log::error('[ApiGateway] Failed to write request log', [
                'error' => $e->getMessage(),
                'data'  => \Illuminate\Support\Arr::except($data, ['request_payload', 'response_payload']),
            ]);
        }
    }

    /**
     * Response JSON standar gateway (sukses / upstream error).
     */
    private function gatewayResponse(
        mixed  $data,
        int    $httpStatus,
        int    $responseTimeMs,
        string $requestId
    ): Response {
        $success = $httpStatus >= 200 && $httpStatus < 300;

        return response()->json([
            'success'          => $success,
            'gateway_status'   => $httpStatus,
            'response_time_ms' => $responseTimeMs,
            'x_request_id'     => $requestId,
            'data'             => $data,
        ], $httpStatus, $this->corsHeaders());
    }

    /**
     * Response JSON standar untuk error validasi gateway.
     */
    private function errorResponse(string $message, int $status): Response
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => null,
        ], $status, $this->corsHeaders());
    }

    /**
     * Parse raw CSV content text into a structured JSON array.
     */
    private function parseCsvToJson(string $csvContent): array
    {
        $lines = explode("\n", str_replace("\r", "", trim($csvContent)));
        if (count($lines) === 0) return [];

        $delimiter = str_contains($lines[0], ';') ? ';' : ',';
        $headers = str_getcsv(array_shift($lines), $delimiter);

        $data = [];
        foreach ($lines as $line) {
            if (trim($line) === '') continue;
            $row = str_getcsv($line, $delimiter);
            if (count($row) === count($headers)) {
                $data[] = array_combine($headers, $row);
            }
        }

        return [
            'status'        => 'success',
            'format'        => 'JSON (Parsed from CSV)',
            'total_records' => count($data),
            'data'          => $data
        ];
    }

    /**
     * CORS headers yang ditambahkan ke setiap response.
     */
    private function corsHeaders(): array
    {
        return [
            'Access-Control-Allow-Origin'  => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization',
        ];
    }
}
