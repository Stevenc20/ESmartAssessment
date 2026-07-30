<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('materi', function (Blueprint $table) {
            $table->longText('konten')->nullable()->after('deskripsi');
        });

        Schema::create('materi_quiz', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materi_id')->constrained('materi')->onDelete('cascade');
            $table->text('soal');
            $table->json('opsi');
            $table->string('jawaban_benar', 10);
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::table('progress_materi', function (Blueprint $table) {
            $table->decimal('quiz_score', 5, 2)->nullable()->after('completed_at');
            $table->integer('quiz_attempts')->default(0)->after('quiz_score');
        });
    }

    public function down(): void
    {
        Schema::table('progress_materi', function (Blueprint $table) {
            $table->dropColumn(['quiz_score', 'quiz_attempts']);
        });
        Schema::dropIfExists('materi_quiz');
        Schema::table('materi', function (Blueprint $table) {
            $table->dropColumn('konten');
        });
    }
};
