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
        Schema::create('endpoints', function (Blueprint $table) {
            $table->id();
            $table->string('method'); // GET, POST, PUT, DELETE
            $table->string('url'); // e.g. /api/pegawai
            $table->text('description')->nullable();
            $table->string('tag')->nullable(); // e.g. Pegawai, Auth
            $table->boolean('is_auth_required')->default(true);
            $table->integer('rate_limit')->default(60); // requests per minute
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('endpoints');
    }
};
