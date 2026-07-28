<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->string('tingkat')->nullable()->after('tahun');
        });
    }

    public function down(): void
    {
        Schema::table('roadmaps', function (Blueprint $table) {
            $table->dropColumn('tingkat');
        });
    }
};
