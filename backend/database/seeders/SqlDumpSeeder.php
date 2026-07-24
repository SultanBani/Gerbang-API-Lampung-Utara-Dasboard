<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SqlDumpSeeder extends Seeder
{
    public function run(): void
    {
        $sqlPath = base_path('../gerbang_api_lampung_utara.sql');
        if (!file_exists($sqlPath)) {
            $sqlPath = base_path('database/gerbang_api_lampung_utara.sql');
        }

        if (file_exists($sqlPath)) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            $content = file_get_contents($sqlPath);

            // Match all INSERT INTO statements from the SQL dump
            preg_match_all('/INSERT INTO\s+`[^`]+`[^;]+;/is', $content, $matches);

            if (!empty($matches[0])) {
                foreach ($matches[0] as $query) {
                    try {
                        DB::unprepared($query);
                    } catch (\Throwable $e) {
                        // Continue if query encounters warning
                    }
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }
}
