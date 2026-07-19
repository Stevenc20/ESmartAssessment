<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materi', function (Blueprint $table) {
            $table->dropForeign(['pertemuan_id']);
            $table->foreignId('pertemuan_id')->nullable()->change();
            $table->foreign('pertemuan_id')->references('id')->on('pertemuan')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('materi', function (Blueprint $table) {
            $table->dropForeign(['pertemuan_id']);
            DB::statement('ALTER TABLE materi MODIFY pertemuan_id BIGINT UNSIGNED NOT NULL');
            $table->foreign('pertemuan_id')->references('id')->on('pertemuan')->cascadeOnDelete();
        });
    }
};
