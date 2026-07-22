<?php

namespace Database\Seeders;

use App\Models\AccessControl;
use App\Models\ApiKey;
use App\Models\Application;
use App\Models\Endpoint;
use App\Models\RequestLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class GatewaySeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Applications ──────────────────────────────────────────
        $apps = [
            [
                'name'        => 'SIAK Disdukcapil',
                'opd'         => 'Disdukcapil',
                'pic_name'    => 'Siti Rahma',
                'pic_phone'   => '0813-9876-5432',
                'description' => 'Integrasi data kependudukan dan NIK warga Kabupaten Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIMPEG BKPSDM',
                'opd'         => 'BKPSDM',
                'pic_name'    => 'Budi Santoso',
                'pic_phone'   => '0812-3456-7890',
                'description' => 'Sistem Informasi Kepegawaian ASN Kabupaten Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIPD Bappeda',
                'opd'         => 'Bappeda',
                'pic_name'    => 'Rina Dewi',
                'pic_phone'   => '0821-4455-6677',
                'description' => 'Sistem Informasi Perencanaan dan Pembangunan Daerah.',
                'status'      => 'active',
            ],
            [
                'name'        => 'E-Kinerja BKPSDM',
                'opd'         => 'BKPSDM',
                'pic_name'    => 'Yuli Andini',
                'pic_phone'   => '0823-1122-4455',
                'description' => 'Manajemen penilaian SKP dan capaian kinerja ASN.',
                'status'      => 'active',
            ],
            [
                'name'        => 'PPDB Dinas Pendidikan',
                'opd'         => 'Dinas Pendidikan',
                'pic_name'    => 'Hendra W.',
                'pic_phone'   => '0819-3344-5566',
                'description' => 'Penerimaan Peserta Didik Baru tingkat SD dan SMP.',
                'status'      => 'inactive',
            ],
        ];

        $createdApps = [];
        foreach ($apps as $appData) {
            $createdApps[] = Application::create($appData);
        }

        // ── 2. Endpoints ─────────────────────────────────────────────
        $endpoints = [
            ['method' => 'GET',    'url' => '/v1/penduduk',        'description' => 'Ambil daftar data kependudukan',                   'tag' => 'Kependudukan', 'is_auth_required' => true,  'rate_limit' => 100],
            ['method' => 'GET',    'url' => '/v1/penduduk/{nik}',   'description' => 'Ambil detail penduduk berdasarkan NIK',            'tag' => 'Kependudukan', 'is_auth_required' => true,  'rate_limit' => 50],
            ['method' => 'GET',    'url' => '/v1/pegawai',          'description' => 'Daftar seluruh data ASN aktif',                    'tag' => 'Kepegawaian',  'is_auth_required' => true,  'rate_limit' => 100],
            ['method' => 'GET',    'url' => '/v1/pegawai/{nip}',    'description' => 'Detail profil ASN berdasarkan NIP',               'tag' => 'Kepegawaian',  'is_auth_required' => true,  'rate_limit' => 100],
            ['method' => 'POST',   'url' => '/v1/pegawai',          'description' => 'Tambah data pegawai baru',                        'tag' => 'Kepegawaian',  'is_auth_required' => true,  'rate_limit' => 20],
            ['method' => 'GET',    'url' => '/v1/anggaran',         'description' => 'Data realisasi anggaran tahunan daerah',          'tag' => 'Perencanaan',  'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'GET',    'url' => '/v1/program-kerja',    'description' => 'Daftar program kerja OPD aktif',                  'tag' => 'Perencanaan',  'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'POST',   'url' => '/v1/auth/login',       'description' => 'Autentikasi dan generate token sesi',             'tag' => 'Auth',         'is_auth_required' => false, 'rate_limit' => 10],
            ['method' => 'POST',   'url' => '/v1/auth/logout',      'description' => 'Invalidasi token sesi aktif',                     'tag' => 'Auth',         'is_auth_required' => true,  'rate_limit' => 10],
        ];

        $createdEndpoints = [];
        foreach ($endpoints as $epData) {
            $createdEndpoints[] = Endpoint::create($epData);
        }

        // ── 3. API Keys ───────────────────────────────────────────────
        $createdKeys = [];
        foreach ($createdApps as $app) {
            $slugOpd = strtoupper(Str::slug($app->opd, ''));
            $key     = "LAMPURA-{$slugOpd}-" . Str::random(32);

            $createdKeys[$app->id] = ApiKey::create([
                'application_id' => $app->id,
                'key'            => $key,
                'status'         => $app->status === 'active' ? 'active' : 'revoked',
                'expires_at'     => now()->addYear(),
            ]);
        }

        // ── 4. Access Controls ────────────────────────────────────────
        // Definisi hak akses: [app_index => [endpoint_indices...]]
        // App 0 = SIAK   → akses endpoint Kependudukan + Auth
        // App 1 = SIMPEG → akses endpoint Kepegawaian + Auth
        // App 2 = Bappeda→ akses endpoint Perencanaan + Kepegawaian (read) + Auth
        // App 3 = E-Kinerja → akses Kepegawaian
        // App 4 = PPDB   → akses Auth saja (inactive)
        $accessMatrix = [
            0 => [0, 1, 7, 8],           // SIAK: penduduk, penduduk/{nik}, login, logout
            1 => [2, 3, 4, 7, 8],        // SIMPEG: pegawai (all), login, logout
            2 => [2, 3, 5, 6, 7, 8],     // Bappeda: pegawai (read), anggaran, program, login, logout
            3 => [2, 3, 7, 8],           // E-Kinerja: pegawai (read), login, logout
            4 => [7],                    // PPDB: hanya login
        ];

        foreach ($accessMatrix as $appIndex => $endpointIndices) {
            $app = $createdApps[$appIndex];
            foreach ($endpointIndices as $epIndex) {
                $endpoint = $createdEndpoints[$epIndex];
                AccessControl::create([
                    'application_id' => $app->id,
                    'endpoint_id'    => $endpoint->id,
                    'is_allowed'     => true,
                ]);
            }
        }

        // ── 5. Request Logs (25 sampel, 7 hari terakhir) ─────────────
        $scenarios = [
            // [app_index, endpoint_index, method, status_code, response_time_ms]
            [0, 0,  'GET',  200, 87,   '2026-07-21 08:10:00'],
            [0, 1,  'GET',  200, 102,  '2026-07-21 07:55:00'],
            [1, 2,  'GET',  200, 145,  '2026-07-21 07:40:00'],
            [1, 3,  'GET',  200, 98,   '2026-07-21 07:20:00'],
            [2, 5,  'GET',  200, 210,  '2026-07-21 07:00:00'],
            [3, 2,  'GET',  200, 130,  '2026-07-21 06:30:00'],
            [0, 0,  'GET',  401, 31,   '2026-07-21 06:00:00'],  // key expired
            [1, 4,  'POST', 403, 45,   '2026-07-20 15:30:00'],  // no access
            [2, 5,  'GET',  200, 189,  '2026-07-20 15:00:00'],
            [1, 2,  'GET',  200, 77,   '2026-07-20 14:30:00'],
            [0, 7,  'POST', 200, 210,  '2026-07-20 14:00:00'],
            [2, 6,  'GET',  200, 160,  '2026-07-20 13:30:00'],
            [3, 3,  'GET',  502, 2103, '2026-07-20 13:00:00'],  // upstream timeout
            [1, 3,  'GET',  200, 88,   '2026-07-20 12:30:00'],
            [4, 7,  'POST', 401, 22,   '2026-07-20 12:00:00'],  // revoked key
            [0, 1,  'GET',  200, 110,  '2026-07-19 16:00:00'],
            [1, 2,  'GET',  200, 95,   '2026-07-19 15:00:00'],
            [2, 5,  'GET',  404, 30,   '2026-07-19 14:00:00'],  // endpoint not found
            [0, 0,  'GET',  200, 112,  '2026-07-19 13:00:00'],
            [3, 2,  'GET',  200, 143,  '2026-07-19 12:00:00'],
            [1, 4,  'POST', 200, 198,  '2026-07-18 11:00:00'],
            [2, 6,  'GET',  200, 175,  '2026-07-18 10:00:00'],
            [0, 0,  'GET',  200, 90,   '2026-07-17 16:00:00'],
            [1, 2,  'GET',  200, 101,  '2026-07-17 15:00:00'],
            [2, 5,  'GET',  503, 5000, '2026-07-16 14:00:00'],  // upstream down
        ];

        foreach ($scenarios as $scenario) {
            [$appIdx, $epIdx, $method, $statusCode, $responseTime, $timestamp] = $scenario;

            $app      = $createdApps[$appIdx];
            $endpoint = $createdEndpoints[$epIdx];
            $apiKey   = $createdKeys[$app->id] ?? null;

            RequestLog::create([
                'api_key_id'       => $apiKey?->id,
                'application_id'   => $app->id,
                'endpoint_id'      => $endpoint->id,
                'method'           => $method,
                'url'              => $endpoint->url,
                'status_code'      => $statusCode,
                'response_time_ms' => $responseTime,
                'ip_address'       => '172.16.0.' . rand(10, 50),
                'request_payload'  => json_encode([
                    'method' => $method,
                    'path'   => $endpoint->url,
                    'query'  => null,
                    'body'   => null,
                ]),
                'response_payload' => json_encode(
                    $statusCode >= 200 && $statusCode < 300
                        ? ['success' => true, 'data' => ['sample' => 'response data']]
                        : ['success' => false, 'error' => "HTTP {$statusCode}"]
                ),
                'created_at' => Carbon::parse($timestamp),
                'updated_at' => Carbon::parse($timestamp),
            ]);
        }
    }
}
