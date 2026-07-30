<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('materi_polls')->onDelete('cascade');
            $table->foreignId('option_id')->constrained('materi_poll_options')->onDelete('cascade');
            $table->foreignId('siswa_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['poll_id', 'siswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_poll_votes');
    }
};
