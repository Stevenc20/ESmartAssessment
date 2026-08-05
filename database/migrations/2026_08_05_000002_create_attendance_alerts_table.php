<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('roadmap_id')->constrained('roadmaps')->cascadeOnDelete();
            $table->decimal('persentase', 5, 2);
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->unique(['siswa_id', 'roadmap_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_alerts');
    }
};
