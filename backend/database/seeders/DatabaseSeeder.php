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
        User::firstOrCreate(
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

        $bappedaApp  = Application::where('opd', 'Bappeda')->first();
        $dukcapilApp = Application::where('opd', 'Disdukcapil')->first();
        $bkdApp      = Application::where('opd', 'BKPSDM')->first();

        User::firstOrCreate(
            ['username' => 'bappeda'],
            [
                'name'           => 'Dinas Perencanaan (Bappeda)',
                'email'          => 'bappeda@lampungutarakab.go.id',
                'password'       => Hash::make('DinasPerencanaan2026!'),
                'role'           => 'dinas',
                'opd_name'       => 'Badan Perencanaan Pembangunan Daerah',
                'application_id' => $bappedaApp?->id,
            ]
        );

        User::firstOrCreate(
            ['username' => 'disdukcapil'],
            [
                'name'           => 'Dinas Kependudukan & Capil',
                'email'          => 'disdukcapil@lampungutarakab.go.id',
                'password'       => Hash::make('Disdukcapil2026!'),
                'role'           => 'dinas',
                'opd_name'       => 'Dinas Kependudukan dan Pencatatan Sipil',
                'application_id' => $dukcapilApp?->id,
            ]
        );

        User::firstOrCreate(
            ['username' => 'bkd'],
            [
                'name'           => 'Badan Kepegawaian Daerah',
                'email'          => 'bkd@lampungutarakab.go.id',
                'password'       => Hash::make('BkdLampura2026!'),
                'role'           => 'dinas',
                'opd_name'       => 'Badan Kepegawaian Daerah',
                'application_id' => $bkdApp?->id,
            ]
        );
    }
}

