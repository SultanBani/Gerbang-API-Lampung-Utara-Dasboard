<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('request_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('access_request_id')->nullable()->constrained('access_requests')->onDelete('set null');
            $table->foreignId('endpoint_id')->nullable()->constrained('endpoints')->onDelete('set null');
            $table->foreignId('opd_id')->nullable()->constrained('opds')->onDelete('set null');
            $table->string('method');
            $table->string('url');
            $table->integer('status_code');
            $table->integer('response_time_ms');
            $table->string('ip_address')->nullable();
            $table->text('request_payload')->nullable();
            $table->text('response_payload')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_logs');
    }
};
