<?php

namespace App\Http\Middleware;

use App\Models\AccessRequest;
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
        $startTime = microtime(true);

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
                400,
                $request,
                $startTime
            );
        }

        /** @var Opd|null $opd */
        $opd = Opd::where('code', $opdCode)->first();

        if (! $opd) {
            return $this->errorResponse(
                sprintf('Not Found: OPD dengan kode "%s" tidak ditemukan.', $opdCode),
                404,
                $request,
                $startTime
            );
        }

        /** @var Endpoint|null $endpoint */
        $endpoint = Endpoint::where('opd_id', $opd->id)
            ->where('slug', $endpointSlug)
            ->first();

        if (! $endpoint) {
            return $this->errorResponse(
                sprintf('Not Found: Endpoint "%s" tidak ditemukan pada OPD "%s".', $endpointSlug, $opd->name),
                404,
                $request,
                $startTime,
                $opd
            );
        }

        // Cek apakah endpoint aktif
        if (! $endpoint->is_active) {
            return $this->errorResponse(
                sprintf('Service Unavailable: Endpoint "%s" sedang tidak aktif.', $endpoint->title),
                503,
                $request,
                $startTime,
                $opd,
                $endpoint
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
                405,
                $request,
                $startTime,
                $opd,
                $endpoint
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2.5 — Validasi Permohonan Hak Akses (Access Request)
        // Jika permohonan hak akses untuk endpoint ini sudah DISETUJUI (APPROVED)
        // atau dikirim dengan API Key / Master Key yang valid -> Izinkan Langsung (200 OK)
        // ═══════════════════════════════════════════════════════════════
        $apiKey = $request->header('X-API-KEY')
            ?? $request->header('X-Secret-Key')
            ?? $request->header('X-Client-Key')
            ?? $request->query('api_key')
            ?? $request->query('key');

        $isAuthorized = false;
        $authErrorMessage = null;

        // ── Owner Bypass: Cek Bearer token (dari header ATAU query _token) ──
        // Ini memungkinkan pemilik API membuka data miliknya sendiri
        // langsung di browser tanpa perlu API Key khusus.
        $bearerToken = $request->bearerToken() ?? $request->query('_token');

        if ($bearerToken) {
            try {
                $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($bearerToken);
                if ($accessToken) {
                    $tokenUser = $accessToken->tokenable;
                    if ($tokenUser && ($tokenUser->role === 'admin' || $tokenUser->opd_id === $opd->id)) {
                        $isAuthorized = true;
                    }
                }
            } catch (\Throwable $e) {
                // Token tidak valid, lanjutkan ke pengecekan API Key biasa
                Log::debug('[ApiGateway] Owner bypass token check failed', ['error' => $e->getMessage()]);
            }
        }

        if (!$isAuthorized && $apiKey) {
            $accessReq = AccessRequest::where('endpoint_id', $endpoint->id)
                ->where('api_key', $apiKey)
                ->first();

            if ($accessReq) {
                $status = strtolower($accessReq->status);
                if ($status === 'approved') {
                    if ($accessReq->isExpired()) {
                        $authErrorMessage = 'Forbidden: Hak akses API milik Anda telah kedaluwarsa.';
                    } else {
                        $isAuthorized = true;
                    }
                } elseif ($status === 'pending') {
                    $authErrorMessage = sprintf(
                        'Forbidden: Permohonan hak akses API ke OPD "%s" (%s) masih dalam proses peninjauan (PENDING).',
                        $opd->name,
                        $endpoint->title
                    );
                } elseif ($status === 'rejected') {
                    $authErrorMessage = sprintf(
                        'Forbidden: Permohonan hak akses API ke OPD "%s" (%s) telah DITOLAK oleh OPD pemilik.',
                        $opd->name,
                        $endpoint->title
                    );
                }
            } else {
                $authErrorMessage = 'Forbidden: API Key tidak valid untuk endpoint ini.';
            }
        } elseif (!$isAuthorized) {
            $authErrorMessage = sprintf(
                'Forbidden: Akses ditolak. Untuk mengakses API milik OPD "%s" (%s), Anda wajib menyertakan API Key dari Permohonan Hak Akses yang telah disetujui.',
                $opd->name,
                $endpoint->title
            );
        }

        if (! $isAuthorized) {
            $msg = $authErrorMessage ?? sprintf(
                'Forbidden: Akses ditolak. Untuk mengakses API milik OPD "%s" (%s), Anda wajib mengajukan Permohonan Hak Akses (Access Request) terlebih dahulu di Katalog API dan disetujui oleh OPD pemilik.',
                $opd->name,
                $endpoint->title
            );

            return $this->errorResponse(
                $msg,
                403,
                $request,
                $startTime,
                $opd,
                $endpoint
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3 — Proxy Request ke Upstream & Request Logging
        // ═══════════════════════════════════════════════════════════════

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
            $localResponse = $this->tryReadLocalStorage($request, $endpoint->target_url);

            if ($localResponse !== null) {
                $httpStatus      = 200;
                $responsePayload = $localResponse;
            } else {
                // ── Deteksi Self-Loopback (Anti-Deadlock) ──
                // php artisan serve berjalan single-threaded.
                // Jika target_url mengarah ke server ini sendiri (localhost / 127.0.0.1),
                // forward HTTP akan menyebabkan DEADLOCK (server menunggu dirinya sendiri).
                $parsedHost = parse_url($endpoint->target_url, PHP_URL_HOST);
                $parsedPort = parse_url($endpoint->target_url, PHP_URL_PORT);
                $serverPort = $request->getPort();
                $isLoopback = in_array($parsedHost, ['localhost', '127.0.0.1', '0.0.0.0', '::1'], true)
                    && ($parsedPort == $serverPort || $parsedPort === null);

                if ($isLoopback) {
                    // Coba baca file lokal dari path URL jika ada
                    $urlPath = parse_url($endpoint->target_url, PHP_URL_PATH) ?? '';
                    $localPath = public_path(ltrim($urlPath, '/'));
                    
                    if (file_exists($localPath) && is_file($localPath)) {
                        $rawContent = file_get_contents($localPath);
                        $ext = strtolower(pathinfo($localPath, PATHINFO_EXTENSION));
                        
                        if ($ext === 'json') {
                            $responsePayload = json_decode($rawContent, true) ?? $rawContent;
                        } elseif ($ext === 'csv') {
                            $responsePayload = $this->parseCsvToJson($rawContent);
                        } else {
                            $responsePayload = $rawContent;
                        }
                        $httpStatus = 200;
                    } else {
                        $httpStatus = 502;
                        $responsePayload = [
                            'error'   => 'Bad Gateway: Target URL mengarah ke server lokal yang sama (loopback). File tidak ditemukan di disk.',
                            'details' => sprintf('Target "%s" tidak dapat dijangkau tanpa menyebabkan deadlock pada server single-threaded. Pastikan file tersedia di: %s', $endpoint->target_url, $localPath ?? 'N/A'),
                            'solusi'  => 'Gunakan "Upload File (CSV/JSON)" saat membuat endpoint, atau arahkan target_url ke server eksternal.',
                        ];
                    }
                } else {
                    $proxyResponse = $this->forwardRequest($request, $endpoint->target_url, $upstreamHeaders);

                    $httpStatus      = $proxyResponse->status();
                    $rawBody         = $proxyResponse->body();
                    $jsonData        = $proxyResponse->json();

                    // Auto-convert CSV upstream response to structured JSON
                    if (! $jsonData && (str_contains(strtolower($endpoint->target_url), '.csv') || str_contains(strtolower($proxyResponse->header('Content-Type') ?? ''), 'csv'))) {
                        $jsonData = $this->parseCsvToJson($rawBody);
                    }

                    $responsePayload = $jsonData ?? $rawBody;
                }
            }
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
        $encodedResponse = is_array($responsePayload) 
            ? json_encode($responsePayload, JSON_UNESCAPED_UNICODE) 
            : (string) $responsePayload;
        
        // Cegah error DB (kolom TEXT limit) dengan memotong payload log jika sangat besar (> 10000 karakter)
        if (strlen($encodedResponse) > 10000) {
            $encodedResponse = substr($encodedResponse, 0, 10000) . "\n\n... [LOG DIPOTONG: PAYLOAD TERLALU BESAR (" . strlen($encodedResponse) . " bytes)] ...";
        }

        $this->writeLog([
            'endpoint_id'       => $endpoint->id,
            'opd_id'            => $opd->id,
            'method'            => $requestMethod,
            'url'               => sprintf('/APIGATELU/%s/%s', $opdCode, $endpointSlug),
            'status_code'       => $httpStatus,
            'response_time_ms'  => $responseTimeMs,
            'ip_address'        => $request->ip(),
            'request_payload'   => json_encode($requestPayload, JSON_UNESCAPED_UNICODE),
            'response_payload'  => $encodedResponse,
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
     * Cek apakah upstream URL merujuk ke file lokal dalam direktori /storage/ publik.
     * Jika ya, baca file secara langsung dari disk untuk menghindari deadlock HTTP loopback
     * pada server single-threaded (php artisan serve).
     */
    private function tryReadLocalStorage(Request $request, string $upstreamUrl): mixed
    {
        if (! str_contains($upstreamUrl, '/storage/')) {
            return null;
        }

        $parsedPath = parse_url($upstreamUrl, PHP_URL_PATH);
        if (! $parsedPath) {
            return null;
        }

        $storagePos = strpos($parsedPath, '/storage/');
        $relativePath = substr($parsedPath, $storagePos + strlen('/storage/'));

        $fullPath = storage_path('app/public/' . ltrim($relativePath, '/'));

        if (! file_exists($fullPath) || ! is_file($fullPath)) {
            $fullPath = public_path('storage/' . ltrim($relativePath, '/'));
        }

        if (! file_exists($fullPath) || ! is_file($fullPath)) {
            return null;
        }

        $rawContent = file_get_contents($fullPath);
        $extension  = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

        if ($extension === 'json') {
            $decoded = json_decode($rawContent, true);
            return $decoded !== null ? $decoded : $rawContent;
        }

        if ($extension === 'csv' || str_contains($rawContent, ',')) {
            return $this->parseCsvToJson($rawContent);
        }

        return $rawContent;
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
    private function errorResponse(
        string $message,
        int $status,
        ?Request $request = null,
        float $startTime = 0.0,
        ?Opd $opd = null,
        ?Endpoint $endpoint = null
    ): Response {
        if ($request && $startTime > 0) {
            $responseTimeMs = (int) round((microtime(true) - $startTime) * 1000);
            $requestPayload = [
                'method' => strtoupper($request->method()),
                'url'    => $request->fullUrl(),
                'query'  => $request->query() ?: null,
                'body'   => $request->isJson() ? $request->json()->all() : ($request->all() ?: null),
            ];

            $this->writeLog([
                'endpoint_id'      => $endpoint?->id,
                'opd_id'           => $opd?->id,
                'method'           => strtoupper($request->method()),
                'url'              => '/' . ltrim($request->path(), '/'),
                'status_code'      => $status,
                'response_time_ms' => $responseTimeMs,
                'ip_address'       => $request->ip(),
                'request_payload'  => json_encode($requestPayload, JSON_UNESCAPED_UNICODE),
                'response_payload' => json_encode(['success' => false, 'message' => $message], JSON_UNESCAPED_UNICODE),
            ]);
        }

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
