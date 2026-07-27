<?php

use Illuminate\Database\Migrations\Migration;

/**
 * DEPRECATED: This migration is no longer used.
 * API keys are now generated within the 'access_requests' table upon approval.
 * See: 2026_07_27_010200_create_access_requests_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        // Intentionally empty — api_key is now a column in access_requests
    }

    public function down(): void
    {
        // Intentionally empty
    }
};
