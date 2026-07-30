<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->string('thumbnail')->nullable();
            $table->boolean('assign_to_all')->default(false);
            $table->json('class_levels')->nullable();
            $table->foreignId('guru_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('course_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['course_id', 'kelas_id']);
        });

        Schema::create('course_pertemuan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->string('gambar')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::create('course_section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pertemuan_id')->constrained('course_pertemuan')->onDelete('cascade');
            $table->string('judul');
            $table->longText('konten')->nullable();
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::create('course_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pertemuan_id')->constrained('course_pertemuan')->onDelete('cascade');
            $table->string('nama_file');
            $table->string('file_path');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::create('course_quiz', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pertemuan_id')->constrained('course_pertemuan')->onDelete('cascade');
            $table->text('soal');
            $table->json('opsi');
            $table->text('jawaban_benar');
            $table->integer('urutan')->default(0);
            $table->timestamps();
        });

        Schema::create('course_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('pertemuan_id')->constrained('course_pertemuan')->onDelete('cascade');
            $table->timestamp('completed_at')->nullable();
            $table->decimal('quiz_score', 5, 2)->nullable();
            $table->integer('quiz_attempts')->default(0);
            $table->timestamps();

            $table->unique(['siswa_id', 'pertemuan_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_progress');
        Schema::dropIfExists('course_quiz');
        Schema::dropIfExists('course_files');
        Schema::dropIfExists('course_section');
        Schema::dropIfExists('course_pertemuan');
        Schema::dropIfExists('course_assignments');
        Schema::dropIfExists('courses');
    }
};
