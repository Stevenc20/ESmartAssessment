<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analisis_nilai', function (Blueprint $table) {
            $table->id();
            $table->foreignId('nilai_id')->constrained('nilai_siswa')->cascadeOnDelete();
            $table->text('kelebihan')->nullable();
            $table->text('kekurangan')->nullable();
            $table->text('rekomendasi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analisis_nilai');
    }
};
