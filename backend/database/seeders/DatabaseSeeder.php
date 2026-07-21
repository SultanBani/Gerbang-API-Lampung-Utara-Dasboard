<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Admin User ──────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@diskominfo.go.id'],
            [
                'name'     => 'Admin Diskominfo',
                'password' => bcrypt('password'),
            ]
        );

        // ── Gateway Data: Applications, Endpoints, Keys, ACL, Logs ──
        $this->call(GatewaySeeder::class);
    }
}
