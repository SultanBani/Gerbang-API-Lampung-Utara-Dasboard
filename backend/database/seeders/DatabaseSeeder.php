<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Application;
use App\Models\Endpoint;
use App\Models\ApiKey;
use App\Models\AccessControl;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Applications (OPD Apps)
        $appBappeda = Application::create([
            'name'        => 'SIM-PERENCANAAN (E-PLANNING)',
            'opd'         => 'Badan Perencanaan Pembangunan Daerah',
            'pic_name'    => 'Ir. H. Ahmad Fauzi, M.T.',
            'pic_phone'   => '081277889900',
            'description' => 'Aplikasi Perencanaan Pembangunan Daerah Kabupaten Lampung Utara',
            'status'      => 'active',
        ]);

        $appDukcapil = Application::create([
            'name'        => 'SIAK-INTEGRASI DUKCAPIL',
            'opd'         => 'Dinas Kependudukan dan Pencatatan Sipil',
            'pic_name'    => 'Drs. Hendra Saputra',
            'pic_phone'   => '081366554433',
            'description' => 'Sistem Informasi Administrasi Kependudukan Lampung Utara',
            'status'      => 'active',
        ]);

        $appBkd = Application::create([
            'name'        => 'SIMPEG KABUPATEN LAMPUNG UTARA',
            'opd'         => 'Badan Kepegawaian Daerah',
            'pic_name'    => 'Rina Rahmawati, S.STP.',
            'pic_phone'   => '085211223344',
            'description' => 'Sistem Informasi Manajemen Kepegawaian Daerah',
            'status'      => 'active',
        ]);

        $appBpkad = Application::create([
            'name'        => 'SIPKD KEUANGAN DAERAH',
            'opd'         => 'Badan Pengelola Keuangan dan Aset Daerah',
            'pic_name'    => 'Bambang Irawan, S.E., M.Si.',
            'pic_phone'   => '081988776655',
            'description' => 'Sistem Pengelolaan Keuangan dan Anggaran Daerah',
            'status'      => 'active',
        ]);

        // 2. Seed API Keys per Application
        $keyBappeda = ApiKey::create([
            'application_id' => $appBappeda->id,
            'key'            => 'gkp_bappeda_key_2026_x89a',
            'status'         => 'active',
        ]);

        $keyDukcapil = ApiKey::create([
            'application_id' => $appDukcapil->id,
            'key'            => 'gkp_dukcapil_key_2026_m31z',
            'status'         => 'active',
        ]);

        $keyBkd = ApiKey::create([
            'application_id' => $appBkd->id,
            'key'            => 'gkp_bkd_key_2026_p44q',
            'status'         => 'active',
        ]);

        $keyBpkad = ApiKey::create([
            'application_id' => $appBpkad->id,
            'key'            => 'gkp_bpkad_key_2026_w12r',
            'status'         => 'active',
        ]);

        // 3. Seed Endpoints Gateway
        $ep1 = Endpoint::create([
            'method'           => 'GET',
            'url'              => 'perencanaan/program',
            'description'      => 'Mendapatkan daftar program kerja & kegiatan RKPD',
            'tag'              => 'Perencanaan',
            'is_auth_required' => true,
            'rate_limit'       => 60,
        ]);

        $ep2 = Endpoint::create([
            'method'           => 'GET',
            'url'              => 'dukcapil/penduduk',
            'description'      => 'Validasi data kependudukan berdasarkan NIK',
            'tag'              => 'Kependudukan',
            'is_auth_required' => true,
            'rate_limit'       => 100,
        ]);

        $ep3 = Endpoint::create([
            'method'           => 'GET',
            'url'              => 'kepegawaian/v1/data',
            'description'      => 'Mendapatkan data profil & jabatan ASN berdasarkan NIP',
            'tag'              => 'Kepegawaian',
            'is_auth_required' => true,
            'rate_limit'       => 60,
        ]);

        $ep4 = Endpoint::create([
            'method'           => 'GET',
            'url'              => 'keuangan/apbd',
            'description'      => 'Mendapatkan data realisasi anggaran APBD Kabupaten',
            'tag'              => 'Keuangan',
            'is_auth_required' => true,
            'rate_limit'       => 30,
        ]);

        // 4. Seed Access Controls Matrix (Hak Akses)
        AccessControl::create(['application_id' => $appBappeda->id,  'endpoint_id' => $ep1->id, 'is_allowed' => true]);
        AccessControl::create(['application_id' => $appBappeda->id,  'endpoint_id' => $ep2->id, 'is_allowed' => true]);
        AccessControl::create(['application_id' => $appBappeda->id,  'endpoint_id' => $ep4->id, 'is_allowed' => true]);

        AccessControl::create(['application_id' => $appDukcapil->id, 'endpoint_id' => $ep2->id, 'is_allowed' => true]);

        AccessControl::create(['application_id' => $appBkd->id,      'endpoint_id' => $ep3->id, 'is_allowed' => true]);
        AccessControl::create(['application_id' => $appBkd->id,      'endpoint_id' => $ep2->id, 'is_allowed' => true]);

        AccessControl::create(['application_id' => $appBpkad->id,    'endpoint_id' => $ep4->id, 'is_allowed' => true]);
        AccessControl::create(['application_id' => $appBpkad->id,    'endpoint_id' => $ep1->id, 'is_allowed' => true]);

        // 5. Seed Users (Super Admin Diskominfo & Akun Per-Dinas)
        // Super Admin Diskominfo
        User::create([
            'name'           => 'Admin Super Diskominfo',
            'username'       => 'admin',
            'email'          => 'admin@lampungutarakab.go.id',
            'password'       => Hash::make('AdminPassword2026!'),
            'role'           => 'admin',
            'opd_name'       => 'Dinas Komunikasi dan Informatika',
            'application_id' => null,
        ]);

        // Dinas Perencanaan (Bappeda)
        User::create([
            'name'           => 'Dinas Perencanaan (Bappeda)',
            'username'       => 'bappeda',
            'email'          => 'bappeda@lampungutarakab.go.id',
            'password'       => Hash::make('DinasPerencanaan2026!'),
            'role'           => 'dinas',
            'opd_name'       => 'Badan Perencanaan Pembangunan Daerah',
            'application_id' => $appBappeda->id,
        ]);

        // Disdukcapil
        User::create([
            'name'           => 'Dinas Kependudukan & Capil',
            'username'       => 'disdukcapil',
            'email'          => 'disdukcapil@lampungutarakab.go.id',
            'password'       => Hash::make('Disdukcapil2026!'),
            'role'           => 'dinas',
            'opd_name'       => 'Dinas Kependudukan dan Pencatatan Sipil',
            'application_id' => $appDukcapil->id,
        ]);

        // BKD (Kepegawaian)
        User::create([
            'name'           => 'Badan Kepegawaian Daerah',
            'username'       => 'bkd',
            'email'          => 'bkd@lampungutarakab.go.id',
            'password'       => Hash::make('BkdLampura2026!'),
            'role'           => 'dinas',
            'opd_name'       => 'Badan Kepegawaian Daerah',
            'application_id' => $appBkd->id,
        ]);

        // BPKAD (Keuangan)
        User::create([
            'name'           => 'Badan Pengelola Keuangan Daerah',
            'username'       => 'bpkad',
            'email'          => 'bpkad@lampungutarakab.go.id',
            'password'       => Hash::make('BpkadLampura2026!'),
            'role'           => 'dinas',
            'opd_name'       => 'Badan Pengelola Keuangan dan Aset Daerah',
            'application_id' => $appBpkad->id,
        ]);
    }
}
