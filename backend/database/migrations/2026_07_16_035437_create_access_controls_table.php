<?php

use Illuminate\Database\Migrations\Migration;

/**
 * DEPRECATED: This migration is no longer used.
 * Access control is now handled by the 'access_requests' table with approval workflow.
 * See: 2026_07_27_010200_create_access_requests_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        // Intentionally empty — replaced by access_requests table
    }

    public function down(): void
    {
        // Intentionally empty
    }
};
