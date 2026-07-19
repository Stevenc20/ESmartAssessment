<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->integer('total_users')->default(0);
            $table->integer('total_siswa')->default(0);
            $table->integer('total_guru')->default(0);
            $table->integer('total_admin')->default(0);
            $table->integer('total_materi')->default(0);
            $table->integer('total_challenge')->default(0);
            $table->integer('total_certificate')->default(0);
            $table->integer('total_login')->default(0);
            $table->integer('total_upload_tugas')->default(0);
            $table->integer('total_materi_baru')->default(0);
            $table->integer('total_challenge_baru')->default(0);
            $table->json('attendance_by_kelas')->nullable();
            $table->json('additional_stats')->nullable();
            $table->timestamps();

            $table->unique('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_analytics');
    }
};
