<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nis')->nullable()->after('id')->unique();
            $table->string('nama')->nullable()->after('nis');
            $table->string('username')->nullable()->after('nama')->unique();
            $table->foreignId('role_id')->nullable()->after('username')->constrained()->nullOnDelete();
            $table->string('foto')->nullable()->after('role_id');
            $table->string('no_hp')->nullable()->after('foto');
            $table->text('alamat')->nullable()->after('no_hp');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active')->after('alamat');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nis', 'nama', 'username', 'role_id', 'foto', 'no_hp', 'alamat', 'status']);
        });
    }
};
