<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->enum('status', ['hadir', 'terlambat', 'izin', 'sakit', 'alpa'])->default('alpa')->change();
            $table->foreignId('qr_session_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('absensi', function (Blueprint $table) {
            $table->enum('status', ['hadir', 'terlambat', 'tidak_hadir'])->default('tidak_hadir')->change();
            $table->foreignId('qr_session_id')->nullable(false)->change();
        });
    }
};
