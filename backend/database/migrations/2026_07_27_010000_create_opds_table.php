<?php

use Illuminate\Database\Migrations\Migration;

/**
 * MOVED: This migration has been relocated to 0001_01_00_000000_create_opds_table.php
 * to ensure the opds table is created before the users table (which references it via foreign key).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Intentionally empty — see 0001_01_00_000000_create_opds_table.php
    }

    public function down(): void
    {
        // Intentionally empty
    }
};
