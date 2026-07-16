<?php

namespace App\Http\Middleware;

use App\Models\AccessControl;
use App\Models\ApiKey;
use App\Models\Endpoint;
use App\Models\RequestLog;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * ApiGatewayMiddleware — Gerbang API Lampung Utara
 *
 * Middleware ini adalah "otak" utama gateway yang menjadi satu-satunya
 * pintu masuk semua request sebelum diteruskan ke instansi tujuan.
 *
 * Pipeline 4-Layer (berurutan & wajib semua lulus):
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  L1: Auth API Key      → 401 jika key tidak valid/expired       │
 * │  L2: Resolve Endpoint  → 404 jika path tidak terdaftar          │
 * │  L3: Access Control    → 403 jika aplikasi tidak punya hak akses│
 * │  L4: Proxy + Logging   → Forward ke upstream, catat di DB       │
 * └─────────────────────────────────────────────────────────────────┘
 */
class ApiGatewayMiddleware
{
    // Prefix yang distrip dari path request sebelum di-match ke tabel endpoints
    private const GATEWAY_PREFIX = '/gateway';

    // Header yang TIDAK diteruskan ke upstream (header internal gateway)
    private const STRIPPED_HEADERS = [
        'host',
        'x-client-id',
        'x-secret-key',
        'content-length',
        'transfer-encoding',
        'connection',
    ];

    /**
     * Handle an incoming gateway request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ═══════════════════════════════════════════════════════════════
        // LAYER 1 — Autentikasi API Key
        // Validasi header X-Client-ID & X-Secret-Key terhadap tabel api_keys
        // ═══════════════════════════════════════════════════════════════
        $clientId  = $request->header('X-Client-ID');
        $secretKey = $request->header('X-Secret-Key');

        if (! $clientId || ! $secretKey) {
            return $this->errorResponse(
                'Unauthorized: X-Client-ID and X-Secret-Key headers are required.',
                401
            );
        }

        /** @var ApiKey|null $apiKey */
        $apiKey = ApiKey::with('application')
            ->where('key', $secretKey)
            ->first();

        // Validasi: key harus ada, application_id harus cocok dengan X-Client-ID
        if (! $apiKey || (string) $apiKey->application_id !== (string) $clientId) {
            return $this->errorResponse(
                'Unauthorized: Invalid API Key or Client ID.',
                401
            );
        }

        // Validasi: status harus 'active'
        if ($apiKey->status !== 'active') {
            return $this->errorResponse(
                sprintf('Unauthorized: API Key is %s.', $apiKey->status),
                401
            );
        }

        // Validasi: belum melewati batas waktu kedaluwarsa
        if ($apiKey->expires_at && $apiKey->expires_at->isPast()) {
            return $this->errorResponse(
                'Unauthorized: API Key has expired.',
                401
            );
        }

        $application = $apiKey->application;

        // Pastikan entitas Application-nya juga masih aktif
        if (! $application || $application->status !== 'active') {
            return $this->errorResponse(
                'Unauthorized: The application associated with this key is inactive.',
                401
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 2 — Resolusi Endpoint
        // Strip prefix /gateway dari path, lalu cocokkan ke tabel endpoints
        // ═══════════════════════════════════════════════════════════════

        // Normalisasi path: /gateway/dukcapil/penduduk → /dukcapil/penduduk
        $fullPath     = '/' . ltrim($request->path(), '/');
        $endpointPath = str_starts_with($fullPath, self::GATEWAY_PREFIX)
            ? '/' . ltrim(substr($fullPath, strlen(self::GATEWAY_PREFIX)), '/')
            : $fullPath;

        // Jika path kosong setelah strip prefix, jadikan "/"
        if (empty($endpointPath)) {
            $endpointPath = '/';
        }

        /** @var Endpoint|null $endpoint */
        $endpoint = Endpoint::where('url', $endpointPath)
            ->where(function ($query) use ($request) {
                $query->whereRaw('UPPER(method) = ?', [strtoupper($request->method())])
                      ->orWhere('method', '*');  // wildcard method
            })
            ->first();

        if (! $endpoint) {
            return $this->errorResponse(
                sprintf(
                    'Not Found: Endpoint path [%s] with method [%s] is not registered in the gateway.',
                    $endpointPath,
                    strtoupper($request->method())
                ),
                404
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 3 — Kontrol Akses (Access Control)
        // Pastikan kombinasi application_id + endpoint_id ada dan diizinkan
        // ═══════════════════════════════════════════════════════════════
        /** @var AccessControl|null $access */
        $access = AccessControl::where('application_id', $application->id)
            ->where('endpoint_id', $endpoint->id)
            ->first();

        if (! $access || ! $access->is_allowed) {
            return $this->errorResponse(
                sprintf(
                    'Forbidden: Application "%s" does not have permission to access this endpoint.',
                    $application->name
                ),
                403
            );
        }

        // ═══════════════════════════════════════════════════════════════
        // LAYER 4 — Proxy Request ke Upstream & Request Logging
        // ═══════════════════════════════════════════════════════════════

        // [4.1] Catat timestamp awal untuk menghitung response time
        $startTime = microtime(true);

        // [4.2] Buat X-Request-ID unik untuk tracing di sisi upstream
        $requestId = (string) Str::uuid();

        // [4.3] Siapkan headers yang akan diteruskan ke upstream
        //       Hapus header sensitif internal gateway, tambah header forwarding
        $upstreamHeaders = $this->buildUpstreamHeaders($request, $application->name, $requestId);

        // [4.4] Capture payload request untuk logging
        $requestBody = $request->isJson()
            ? $request->json()->all()
            : ($request->all() ?: null);

        $requestPayload = [
            'method' => strtoupper($request->method()),
            'path'   => $endpointPath,
            'query'  => $request->query() ?: null,
            'body'   => $requestBody,
        ];

        // [4.5] Inisialisasi variabel response
        $httpStatus      = 500;
        $responsePayload = null;
        $upstreamError   = null;

        try {
            $proxyResponse = $this->forwardRequest(
                $request,
                $endpoint->url,
                $upstreamHeaders
            );

            $httpStatus      = $proxyResponse->status();
            $responsePayload = $proxyResponse->json() ?? $proxyResponse->body();

        } catch (ConnectionException $e) {
            // Upstream tidak dapat dijangkau (timeout, refused connection, dll)
            $upstreamError = $e->getMessage();
            $httpStatus    = 502;
            $responsePayload = [
                'error'   => 'Bad Gateway: The upstream service is unreachable or timed out.',
                'details' => $upstreamError,
            ];

            Log::warning('[ApiGateway] Upstream connection failed', [
                'request_id'   => $requestId,
                'upstream_url' => $endpoint->url,
                'application'  => $application->name,
                'error'        => $upstreamError,
            ]);

        } catch (\Throwable $e) {
            // Error tak terduga lainnya saat mem-proxy request
            $upstreamError = $e->getMessage();
            $httpStatus    = 502;
            $responsePayload = [
                'error'   => 'Bad Gateway: An unexpected error occurred while forwarding the request.',
                'details' => $upstreamError,
            ];

            Log::error('[ApiGateway] Unexpected proxy error', [
                'request_id'   => $requestId,
                'upstream_url' => $endpoint->url,
                'application'  => $application->name,
                'error'        => $upstreamError,
                'trace'        => $e->getTraceAsString(),
            ]);
        }

        // [4.6] Hitung waktu eksekusi dalam milidetik
        $responseTimeMs = (int) round((microtime(true) - $startTime) * 1000);

        // [4.7] Simpan ke tabel request_logs
        //       Payload request/response SELALU dilog untuk monitoring.
        //       Jika respons sukses (2xx), response_payload bisa di-null
        //       untuk menghemat storage (konfigurasi opsional).
        $this->writeLog([
            'api_key_id'       => $apiKey->id,
            'application_id'   => $application->id,
            'endpoint_id'      => $endpoint->id,
            'method'           => strtoupper($request->method()),
            'url'              => $endpointPath,
            'status_code'      => $httpStatus,
            'response_time_ms' => $responseTimeMs,
            'ip_address'       => $request->ip(),
            // Selalu simpan request payload
            'request_payload'  => json_encode($requestPayload, JSON_UNESCAPED_UNICODE),
            // Simpan response payload SELALU (untuk monitoring & debugging 5xx)
            'response_payload' => is_array($responsePayload)
                ? json_encode($responsePayload, JSON_UNESCAPED_UNICODE)
                : (string) $responsePayload,
        ]);

        // [4.8] Update timestamp penggunaan terakhir API Key
        $this->touchApiKey($apiKey);

        // [4.9] Kembalikan response ke klien dengan envelope gateway
        return $this->gatewayResponse($responsePayload, $httpStatus, $responseTimeMs, $requestId);
    }

    // ─────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────

    /**
     * Bangun array headers untuk diteruskan ke upstream.
     * Strip header internal gateway dan tambah header forwarding.
     *
     * @param Request $request
     * @param string  $appName    Nama aplikasi klien
     * @param string  $requestId  UUID unik untuk request ini
     * @return array<string, string>
     */
    private function buildUpstreamHeaders(Request $request, string $appName, string $requestId): array
    {
        $headers = [];

        foreach ($request->headers->all() as $name => $values) {
            // Skip header yang tidak boleh diteruskan
            if (in_array(strtolower($name), self::STRIPPED_HEADERS, true)) {
                continue;
            }
            // Ambil nilai pertama dari array header
            $headers[$name] = $values[0] ?? '';
        }

        // Tambah/override header forwarding gateway
        $headers['X-Forwarded-For']  = $request->ip();
        $headers['X-Forwarded-Host'] = $request->getHost();
        $headers['X-Gateway-App']    = $appName;
        $headers['X-Request-ID']     = $requestId;
        $headers['Accept']           = 'application/json';

        return $headers;
    }

    /**
     * Forward request ke upstream URL menggunakan Laravel HTTP Client.
     * Mendukung GET, POST, PUT, PATCH, DELETE.
     *
     * @param Request              $request
     * @param string               $upstreamUrl  URL sumber asli instansi tujuan
     * @param array<string,string> $headers
     * @return \Illuminate\Http\Client\Response
     * @throws ConnectionException|\Throwable
     */
    private function forwardRequest(
        Request $request,
        string  $upstreamUrl,
        array   $headers
    ): \Illuminate\Http\Client\Response {
        $method = strtolower($request->method());

        // Sertakan query string dari request original jika ada
        $targetUrl = rtrim($upstreamUrl, '/');
        if ($request->getQueryString()) {
            $targetUrl .= '?' . $request->getQueryString();
        }

        $pending = Http::withHeaders($headers)->timeout(30);

        return match ($method) {
            'get'    => $pending->get($targetUrl),

            'post'   => $pending
                ->withBody($request->getContent(), $request->header('Content-Type', 'application/json'))
                ->post($targetUrl),

            'put'    => $pending
                ->withBody($request->getContent(), $request->header('Content-Type', 'application/json'))
                ->put($targetUrl),

            'patch'  => $pending
                ->withBody($request->getContent(), $request->header('Content-Type', 'application/json'))
                ->patch($targetUrl),

            'delete' => $pending->delete($targetUrl),

            default  => $pending->get($targetUrl),
        };
    }

    /**
     * Simpan entri ke tabel request_logs secara aman.
     * Kegagalan logging TIDAK boleh menggagalkan response ke klien.
     *
     * @param array<string, mixed> $data
     */
    private function writeLog(array $data): void
    {
        try {
            RequestLog::create($data);
        } catch (\Throwable $e) {
            Log::error('[ApiGateway] Failed to write request log to database', [
                'error' => $e->getMessage(),
                'data'  => Arr::except($data, ['request_payload', 'response_payload']),
            ]);
        }
    }

    /**
     * Update kolom last_used_at pada ApiKey secara aman.
     */
    private function touchApiKey(ApiKey $apiKey): void
    {
        try {
            $apiKey->update(['last_used_at' => now()]);
        } catch (\Throwable $e) {
            Log::warning('[ApiGateway] Failed to update api_key last_used_at', [
                'api_key_id' => $apiKey->id,
                'error'      => $e->getMessage(),
            ]);
        }
    }

    /**
     * Buat response JSON standar gateway untuk kasus sukses / upstream error.
     *
     * @param mixed  $data           Payload response dari upstream
     * @param int    $httpStatus     HTTP status code
     * @param int    $responseTimeMs Waktu eksekusi dalam ms
     * @param string $requestId      UUID request untuk tracing
     */
    private function gatewayResponse(
        mixed  $data,
        int    $httpStatus,
        int    $responseTimeMs,
        string $requestId
    ): Response {
        $success = $httpStatus >= 200 && $httpStatus < 300;

        return response()->json([
            'success'           => $success,
            'gateway_status'    => $httpStatus,
            'response_time_ms'  => $responseTimeMs,
            'x_request_id'     => $requestId,
            'data'              => $data,
        ], $httpStatus);
    }

    /**
     * Buat response JSON standar untuk error validasi gateway (4xx).
     *
     * @param string $message  Pesan error yang ramah untuk klien
     * @param int    $status   HTTP status code (401 / 403 / 404)
     */
    private function errorResponse(string $message, int $status): Response
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => null,
        ], $status);
    }
}
