<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Application;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. Gateway Data: Applications, Endpoints, Keys, ACL, Logs ──
        $this->call(GatewaySeeder::class);

        // ── 2. Users (Super Admin Diskominfo & Akun Per-Dinas OPD) ──────
        $admin = User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name'           => 'Admin Super Diskominfo',
                'email'          => 'admin@lampungutarakab.go.id',
                'password'       => Hash::make('AdminPassword2026!'),
                'role'           => 'admin',
                'opd_name'       => 'Dinas Komunikasi dan Informatika',
                'application_id' => null,
            ]
        );

        $opdAccounts = [
            [
                'username'  => 'disdukcapil',
                'name'      => 'Dinas Kependudukan & Capil',
                'email'     => 'disdukcapil@lampungutarakab.go.id',
                'password'  => 'Disdukcapil2026!',
                'opd_name'  => 'Dinas Kependudukan dan Pencatatan Sipil',
                'opd_query' => 'Dinas Kependudukan dan Pencatatan Sipil',
            ],
            [
                'username'  => 'bkd',
                'name'      => 'Badan Kepegawaian Daerah',
                'email'     => 'bkd@lampungutarakab.go.id',
                'password'  => 'BkdLampura2026!',
                'opd_name'  => 'Badan Kepegawaian & Pengembangan SDM (BKD)',
                'opd_query' => 'Badan Kepegawaian & Pengembangan SDM (BKD)',
            ],
            [
                'username'  => 'bappeda',
                'name'      => 'Dinas Perencanaan (Bappeda)',
                'email'     => 'bappeda@lampungutarakab.go.id',
                'password'  => 'DinasPerencanaan2026!',
                'opd_name'  => 'Badan Perencanaan Pembangunan Daerah (Bappeda)',
                'opd_query' => 'Badan Perencanaan Pembangunan Daerah (Bappeda)',
            ],
            [
                'username'  => 'bpkad',
                'name'      => 'Badan Pengelola Keuangan Daerah',
                'email'     => 'bpkad@lampungutarakab.go.id',
                'password'  => 'BpkadLampura2026!',
                'opd_name'  => 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
                'opd_query' => 'Badan Pengelola Keuangan dan Aset Daerah (BPKAD)',
            ],
            [
                'username'  => 'dinkes',
                'name'      => 'Dinas Kesehatan Lampung Utara',
                'email'     => 'dinkes@lampungutarakab.go.id',
                'password'  => 'DinkesLampura2026!',
                'opd_name'  => 'Dinas Kesehatan',
                'opd_query' => 'Dinas Kesehatan',
            ],
            [
                'username'  => 'disdik',
                'name'      => 'Dinas Pendidikan & Kebudayaan',
                'email'     => 'disdik@lampungutarakab.go.id',
                'password'  => 'DisdikLampura2026!',
                'opd_name'  => 'Dinas Pendidikan dan Kebudayaan',
                'opd_query' => 'Dinas Pendidikan dan Kebudayaan',
            ],
            [
                'username'  => 'dinsos',
                'name'      => 'Dinas Sosial Lampung Utara',
                'email'     => 'dinsos@lampungutarakab.go.id',
                'password'  => 'DinsosLampura2026!',
                'opd_name'  => 'Dinas Sosial',
                'opd_query' => 'Dinas Sosial',
            ],
        ];

        foreach ($opdAccounts as $acc) {
            $app = Application::where('opd', $acc['opd_query'])->first();
            User::updateOrCreate(
                ['username' => $acc['username']],
                [
                    'name'           => $acc['name'],
                    'email'          => $acc['email'],
                    'password'       => Hash::make($acc['password']),
                    'role'           => 'dinas',
                    'opd_name'       => $acc['opd_name'],
                    'application_id' => $app?->id,
                ]
            );
        }
    }
}
