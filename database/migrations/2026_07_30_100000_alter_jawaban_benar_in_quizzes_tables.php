<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('materi_quiz')) {
            Schema::table('materi_quiz', function (Blueprint $table) {
                $table->text('jawaban_benar')->change();
            });
        }

        if (Schema::hasTable('course_quiz')) {
            Schema::table('course_quiz', function (Blueprint $table) {
                $table->text('jawaban_benar')->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('materi_quiz')) {
            Schema::table('materi_quiz', function (Blueprint $table) {
                $table->string('jawaban_benar', 10)->change();
            });
        }

        if (Schema::hasTable('course_quiz')) {
            Schema::table('course_quiz', function (Blueprint $table) {
                $table->string('jawaban_benar', 10)->change();
            });
        }
    }
};
