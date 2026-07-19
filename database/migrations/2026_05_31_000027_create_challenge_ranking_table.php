<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenge_ranking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('users')->cascadeOnDelete();
            $table->integer('ranking');
            $table->timestamps();

            $table->unique(['challenge_id', 'siswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_ranking');
    }
};
