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
        Schema::create('access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('endpoint_id')->constrained('endpoints')->onDelete('cascade');
            $table->foreignId('requestor_opd_id')->constrained('opds')->onDelete('cascade');
            $table->json('requested_methods'); // e.g. ["GET", "POST"]
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('api_key')->unique()->nullable(); // Generated ONLY upon approval
            $table->datetime('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('access_requests');
    }
};
