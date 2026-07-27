<?php

namespace Database\Seeders;

use App\Models\Opd;
use App\Models\Endpoint;
use Illuminate\Database\Seeder;

class EndpointSeeder extends Seeder
{
    public function run(): void
    {
        // Ambil OPD
        $disdukcapil = Opd::where('code', 'disdukcapil')->first();
        $bappeda = Opd::where('code', 'bappeda')->first();
        $dinkes = Opd::where('code', 'dinkes')->first();
        $bpkad = Opd::where('code', 'bpkad')->first();
        $bkd = Opd::where('code', 'bkd')->first();

        if (!$disdukcapil) return; // Pastikan OPD sudah ada

        $endpoints = [
            [
                'opd_id' => $disdukcapil->id,
                'title' => 'API Data Kependudukan (NIK)',
                'slug' => 'penduduk',
                'target_url' => 'http://disdukcapil.local/api/v1/penduduk',
                'method_permissions' => json_encode(['GET', 'POST']),
                'is_active' => true,
            ],
            [
                'opd_id' => $disdukcapil->id,
                'title' => 'API Pencarian Kartu Keluarga',
                'slug' => 'pencarian-kk',
                'target_url' => 'http://disdukcapil.local/api/v1/kk',
                'method_permissions' => json_encode(['GET']),
                'is_active' => true,
            ],
            [
                'opd_id' => $bappeda->id,
                'title' => 'API Capaian Program Pembangunan',
                'slug' => 'capaian-program',
                'target_url' => 'http://bappeda.local/api/capaian-program',
                'method_permissions' => json_encode(['GET']),
                'is_active' => true,
            ],
            [
                'opd_id' => $dinkes->id,
                'title' => 'API Data Sebaran Stunting',
                'slug' => 'data-stunting',
                'target_url' => 'http://dinkes.local/api/stunting',
                'method_permissions' => json_encode(['GET']),
                'is_active' => true,
            ],
            [
                'opd_id' => $bpkad->id,
                'title' => 'API Serapan Anggaran APBD',
                'slug' => 'serapan-apbd',
                'target_url' => 'http://bpkad.local/api/anggaran/serapan',
                'method_permissions' => json_encode(['GET']),
                'is_active' => true,
            ],
            [
                'opd_id' => $bkd->id,
                'title' => 'API Data Kepegawaian',
                'slug' => 'data-pegawai',
                'target_url' => 'http://bkd.local/api/pegawai',
                'method_permissions' => json_encode(['GET']),
                'is_active' => true,
            ]
        ];

        foreach ($endpoints as $ep) {
            Endpoint::updateOrCreate(
                ['slug' => $ep['slug'], 'opd_id' => $ep['opd_id']],
                $ep
            );
        }
    }
}
