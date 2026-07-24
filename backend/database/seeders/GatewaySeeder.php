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
        // ── 1. Applications (OPD Kabupaten Lampung Utara) ────────────────
        $apps = [
            [
                'name'        => 'SIAK Integrasi Dukcapil',
                'opd'         => 'Dinas Kependudukan dan Pencatatan Sipil',
                'pic_name'    => 'Drs. Hendra Saputra',
                'pic_phone'   => '0813-6655-4433',
                'description' => 'Layanan validasi NIK dan data kependudukan Kabupaten Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIMPEG Kepegawaian',
                'opd'         => 'Badan Kepegawaian & Pengembangan SDM (BKD)',
                'pic_name'    => 'Rina Rahmawati, S.STP.',
                'pic_phone'   => '0852-1122-3344',
                'description' => 'Manajemen profil, pangkat, dan data ASN Pemkab Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIPD E-Planning',
                'opd'         => 'Badan Perencanaan Pembangunan Daerah (Bappeda)',
                'pic_name'    => 'Ir. H. Ahmad Fauzi, M.T.',
                'pic_phone'   => '0812-7788-9900',
                'description' => 'Sistem perencanaan pembangunan daerah & RKPD Kabupaten Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIPKD Keuangan Daerah',
                'opd'         => 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
                'pic_name'    => 'Bambang Irawan, S.E., M.Si.',
                'pic_phone'   => '0819-8877-6655',
                'description' => 'Integrasi realisasi anggaran APBD dan kas daerah Lampura.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIMPUS E-Puskesmas',
                'opd'         => 'Dinas Kesehatan',
                'pic_name'    => 'dr. Maya Kartika',
                'pic_phone'   => '0812-3344-5566',
                'description' => 'Sistem informasi pelayanan kesehatan dan faskes Kabupaten Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIMDIK & PPDB Online',
                'opd'         => 'Dinas Pendidikan dan Kebudayaan',
                'pic_name'    => 'Drs. Supriyadi, M.Pd.',
                'pic_phone'   => '0813-7788-1122',
                'description' => 'Penerimaan peserta didik baru dan pendataan sekolah daerah.',
                'status'      => 'active',
            ],
            [
                'name'        => 'E-Bansos DTKS',
                'opd'         => 'Dinas Sosial',
                'pic_name'    => 'Ahmad Zulkarnain, S.Sos.',
                'pic_phone'   => '0853-9900-1122',
                'description' => 'Verifikasi dan validasi penerima bantuan sosial masyarakat miskin.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SiCantik E-Perizinan',
                'opd'         => 'Dinas PMPTSP',
                'pic_name'    => 'Dewi Lestari, S.H.',
                'pic_phone'   => '0821-6677-8899',
                'description' => 'Pelayanan perizinan dan penanaman modal terpadu Kabupaten Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'Portal Satu Data Lampura',
                'opd'         => 'Dinas Komunikasi dan Informatika',
                'pic_name'    => 'Tim Teknis Diskominfo',
                'pic_phone'   => '0724-21001',
                'description' => 'Portal agregator data sektoral dan statistik daerah Lampung Utara.',
                'status'      => 'active',
            ],
            [
                'name'        => 'SIMRS RSUD Ryacudu Kotabumi',
                'opd'         => 'RSUD Mayjend HM Ryacudu',
                'pic_name'    => 'dr. Arief Rahman',
                'pic_phone'   => '0724-22334',
                'description' => 'Sistem manajemen pelayanan rumah sakit daerah Kotabumi.',
                'status'      => 'active',
            ],
        ];

        $createdApps = [];
        foreach ($apps as $appData) {
            $createdApps[] = Application::create($appData);
        }

        // ── 2. Endpoints Gateway ─────────────────────────────────────────
        $endpoints = [
            ['method' => 'GET',  'url' => 'dukcapil/penduduk',        'description' => 'Validasi data kependudukan berbasis NIK',           'tag' => 'Kependudukan', 'is_auth_required' => true,  'rate_limit' => 100],
            ['method' => 'GET',  'url' => 'dukcapil/keluarga',        'description' => 'Pencarian kartu keluarga & data keluarga',           'tag' => 'Kependudukan', 'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'GET',  'url' => 'kepegawaian/v1/data',      'description' => 'Data profil & riwayat jabatan ASN berbasis NIP',   'tag' => 'Kepegawaian',  'is_auth_required' => true,  'rate_limit' => 100],
            ['method' => 'GET',  'url' => 'kepegawaian/v1/kinerja',   'description' => 'Capaian SKP dan nilai kinerja ASN bulanan',         'tag' => 'Kepegawaian',  'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'GET',  'url' => 'perencanaan/program',      'description' => 'Daftar program kerja & kegiatan RKPD daerah',       'tag' => 'Perencanaan',  'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'GET',  'url' => 'perencanaan/usulan-musrenbang', 'description' => 'Daftar usulan pembangunan desa & kecamatan',   'tag' => 'Perencanaan',  'is_auth_required' => true,  'rate_limit' => 40],
            ['method' => 'GET',  'url' => 'keuangan/apbd',            'description' => 'Realisasi anggaran pendapatan & belanja APBD',      'tag' => 'Keuangan',     'is_auth_required' => true,  'rate_limit' => 30],
            ['method' => 'GET',  'url' => 'kesehatan/faskes',         'description' => 'Daftar Puskesmas & faskes di Kotabumi & sekitarnya', 'tag' => 'Kesehatan',   'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'GET',  'url' => 'pendidikan/sekolah',       'description' => 'Data profil SD & SMP se-Kabupaten Lampung Utara',  'tag' => 'Pendidikan',   'is_auth_required' => true,  'rate_limit' => 60],
            ['method' => 'GET',  'url' => 'dinsos/dtks',              'description' => 'Verifikasi data warga penerima bantuan DTKS',        'tag' => 'Sosial',       'is_auth_required' => true,  'rate_limit' => 80],
            ['method' => 'GET',  'url' => 'perizinan/izin-aktif',     'description' => 'Daftar izin usaha & non-usaha yang terbit',         'tag' => 'Perizinan',    'is_auth_required' => true,  'rate_limit' => 50],
        ];

        $createdEndpoints = [];
        foreach ($endpoints as $epData) {
            $createdEndpoints[] = Endpoint::create($epData);
        }

        // ── 3. API Keys ──────────────────────────────────────────────────
        $createdKeys = [];
        foreach ($createdApps as $app) {
            $slugOpd = strtoupper(Str::slug(substr($app->opd, 0, 10), ''));
            $key     = "LAMPURA-{$slugOpd}-" . Str::random(24);

            $createdKeys[$app->id] = ApiKey::create([
                'application_id' => $app->id,
                'key'            => strtolower($key),
                'status'         => 'active',
                'expires_at'     => now()->addYear(),
            ]);
        }

        // ── 4. Access Controls Matrix (Hak Akses) ────────────────────────
        foreach ($createdApps as $app) {
            foreach ($createdEndpoints as $ep) {
                // Berikan akses terstruktur
                AccessControl::create([
                    'application_id' => $app->id,
                    'endpoint_id'    => $ep->id,
                    'is_allowed'     => true,
                ]);
            }
        }

        // ── 5. Sample Request Logs (7 hari terakhir) ─────────────────────
        for ($i = 0; $i < 30; $i++) {
            $app      = $createdApps[array_rand($createdApps)];
            $endpoint = $createdEndpoints[array_rand($createdEndpoints)];
            $apiKey   = $createdKeys[$app->id] ?? null;

            $statusCodes = [200, 200, 200, 200, 200, 401, 403, 500];
            $statusCode  = $statusCodes[array_rand($statusCodes)];
            $hoursAgo    = rand(0, 168); // 7 hari = 168 jam

            RequestLog::create([
                'api_key_id'       => $apiKey?->id,
                'application_id'   => $app->id,
                'endpoint_id'      => $endpoint->id,
                'method'           => $endpoint->method,
                'url'              => $endpoint->url,
                'status_code'      => $statusCode,
                'response_time_ms' => rand(45, 350),
                'ip_address'       => '192.168.3.' . rand(10, 90),
                'request_payload'  => json_encode(['path' => $endpoint->url, 'timestamp' => now()->subHours($hoursAgo)]),
                'response_payload' => json_encode(
                    $statusCode === 200
                        ? ['success' => true, 'message' => 'Data berhasil diambil']
                        : ['success' => false, 'error' => "HTTP {$statusCode}"]
                ),
                'created_at' => now()->subHours($hoursAgo),
                'updated_at' => now()->subHours($hoursAgo),
            ]);
        }
    }
}
