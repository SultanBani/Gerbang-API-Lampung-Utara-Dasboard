<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Opd;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. Import Data dari Dump SQL Resmi (gerbang_api_lampung_utara.sql) ──
        $this->call(SqlDumpSeeder::class);

        // ── 2. Seed Data OPD & Endpoints ────────────────────────────────────────
        $this->call([
            OpdSeeder::class,
            EndpointSeeder::class,
        ]);

        // ── 3. Users (Super Admin Diskominfo & Akun Per-Dinas OPD) ──────────────
        $adminOpd = Opd::where('code', 'diskominfo')->first();
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name'           => 'Admin Super Diskominfo',
                'email'          => 'admin@lampungutarakab.go.id',
                'password'       => Hash::make('AdminPassword2026!'),
                'role'           => 'admin',
                'opd_id'         => $adminOpd?->id,
            ]
        );

        $opdAccounts = [
            [
                'username'  => 'disdukcapil',
                'name'      => 'Dinas Kependudukan & Capil',
                'email'     => 'disdukcapil@lampungutarakab.go.id',
                'password'  => 'Disdukcapil2026!',
                'opd_code'  => 'disdukcapil',
            ],
            [
                'username'  => 'bkd',
                'name'      => 'Badan Kepegawaian Daerah',
                'email'     => 'bkd@lampungutarakab.go.id',
                'password'  => 'BkdLampura2026!',
                'opd_code'  => 'bkd',
            ],
            [
                'username'  => 'bappeda',
                'name'      => 'Dinas Perencanaan (Bappeda)',
                'email'     => 'bappeda@lampungutarakab.go.id',
                'password'  => 'DinasPerencanaan2026!',
                'opd_code'  => 'bappeda',
            ],
            [
                'username'  => 'bpkad',
                'name'      => 'Badan Pengelola Keuangan Daerah',
                'email'     => 'bpkad@lampungutarakab.go.id',
                'password'  => 'BpkadLampura2026!',
                'opd_code'  => 'bpkad',
            ],
            [
                'username'  => 'dinkes',
                'name'      => 'Dinas Kesehatan Lampung Utara',
                'email'     => 'dinkes@lampungutarakab.go.id',
                'password'  => 'DinkesLampura2026!',
                'opd_code'  => 'dinkes',
            ],
            [
                'username'  => 'disdik',
                'name'      => 'Dinas Pendidikan & Kebudayaan',
                'email'     => 'disdik@lampungutarakab.go.id',
                'password'  => 'DisdikLampura2026!',
                'opd_code'  => 'disdik',
            ],
            [
                'username'  => 'dinsos',
                'name'      => 'Dinas Sosial Lampung Utara',
                'email'     => 'dinsos@lampungutarakab.go.id',
                'password'  => 'DinsosLampura2026!',
                'opd_code'  => 'dinsos',
            ],
        ];

        foreach ($opdAccounts as $acc) {
            $opd = Opd::where('code', $acc['opd_code'])->first();
            User::updateOrCreate(
                ['username' => $acc['username']],
                [
                    'name'           => $acc['name'],
                    'email'          => $acc['email'],
                    'password'       => Hash::make($acc['password']),
                    'role'           => 'opd',
                    'opd_id'         => $opd?->id,
                ]
            );
        }
    }
}
