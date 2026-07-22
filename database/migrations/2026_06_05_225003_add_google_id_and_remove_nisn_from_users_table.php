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
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('id');
        });

        if (Schema::hasIndex('users', 'users_nis_unique')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_nis_unique');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('nisn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('google_id');
            $table->string('nisn')->nullable()->unique()->after('id');
        });
    }
};
