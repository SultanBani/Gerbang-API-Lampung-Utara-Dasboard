<?php

namespace Database\Seeders;

use App\Models\Opd;
use Illuminate\Database\Seeder;

class OpdSeeder extends Seeder
{
    public function run(): void
    {
        $opds = [
            [
                'name' => 'Dinas Kependudukan dan Pencatatan Sipil',
                'code' => 'disdukcapil',
                'description' => 'Dinas yang menangani administrasi kependudukan seperti KTP, KK, dan Akta Kelahiran.',
            ],
            [
                'name' => 'Badan Perencanaan Pembangunan Daerah',
                'code' => 'bappeda',
                'description' => 'Badan yang bertanggung jawab atas perencanaan pembangunan daerah.',
            ],
            [
                'name' => 'Dinas Kesehatan',
                'code' => 'dinkes',
                'description' => 'Dinas yang mengelola layanan kesehatan masyarakat.',
            ],
            [
                'name' => 'Dinas Komunikasi dan Informatika',
                'code' => 'diskominfo',
                'description' => 'Dinas yang mengelola teknologi informasi dan komunikasi pemerintahan.',
            ],
            [
                'name' => 'Badan Pengelola Keuangan dan Aset Daerah',
                'code' => 'bpkad',
                'description' => 'Badan yang mengelola keuangan dan aset daerah.',
            ],
            [
                'name' => 'Badan Kepegawaian & Pengembangan SDM',
                'code' => 'bkd',
                'description' => 'Badan yang mengelola data kepegawaian.',
            ],
            [
                'name' => 'Dinas Pendidikan dan Kebudayaan',
                'code' => 'disdik',
                'description' => 'Dinas yang mengelola pendidikan daerah.',
            ],
            [
                'name' => 'Dinas Sosial',
                'code' => 'dinsos',
                'description' => 'Dinas yang menangani permasalahan sosial.',
            ]
        ];

        foreach ($opds as $opd) {
            Opd::updateOrCreate(['code' => $opd['code']], $opd);
        }
    }
}
