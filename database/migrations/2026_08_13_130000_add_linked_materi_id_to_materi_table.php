<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materi', function (Blueprint $table) {
            $table->foreignId('linked_materi_id')
                ->nullable()
                ->after('pertemuan_id')
                ->constrained('materi')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('materi', function (Blueprint $table) {
            $table->dropConstrainedForeignId('linked_materi_id');
        });
    }
};
