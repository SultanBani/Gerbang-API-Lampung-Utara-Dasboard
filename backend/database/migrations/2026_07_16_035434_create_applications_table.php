<?php

use Illuminate\Database\Migrations\Migration;

/**
 * DEPRECATED: This migration is no longer used.
 * The 'applications' table has been replaced by 'opds' in the multi-tenant architecture.
 * See: 2026_07_27_010000_create_opds_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        // Intentionally empty — replaced by opds table
    }

    public function down(): void
    {
        // Intentionally empty
    }
};
