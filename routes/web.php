<?php

use App\Http\Controllers\AbsenController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\BadgeController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseSiswaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\MateriController;
use App\Http\Controllers\PengumumanController;
use App\Http\Controllers\PertemuanController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('google', [GoogleController::class, 'redirect'])->name('google.redirect');
    Route::get('google/callback', [GoogleController::class, 'callback'])->name('google.callback');
});

Route::middleware(['guest'])->group(function () {
    Route::get('register/complete', [GoogleController::class, 'showCompleteForm'])->name('register.complete');
    Route::post('register/complete', [GoogleController::class, 'completeRegistration'])->name('register.complete.store');

    Route::get('admin/login', function () {
        return redirect('/');
    })->name('admin.login');
    Route::post('admin/login', [AdminLoginController::class, 'login'])->middleware('throttle:admin-login')->name('admin.login.store');
    Route::get('s/c', [AdminLoginController::class, 'showForm'])->name('staff.login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('penilaian-materi', [MateriController::class, 'penilaianIndex'])->name('materi.penilaian.index');
    Route::get('penilaian-materi/export', [MateriController::class, 'penilaianExport'])->name('materi.penilaian.export');

    Route::resource('materi', MateriController::class);

    Route::post('/materi/{materi}/quiz', [MateriController::class, 'quizStore'])->name('materi.quiz.store');
    Route::put('/materi/{materi}/quiz/{quiz}', [MateriController::class, 'quizUpdate'])->name('materi.quiz.update');
    Route::delete('/materi/{materi}/quiz/{quiz}', [MateriController::class, 'quizDestroy'])->name('materi.quiz.destroy');
    Route::post('/materi/{materi}/upload-image', [MateriController::class, 'uploadImage'])->name('materi.upload-image');

    Route::get('pengumuman', [PengumumanController::class, 'index'])->name('pengumuman.index');

    Route::get('/nilai-saya', [MateriController::class, 'nilaiSiswaIndex'])->name('materi.siswa.nilai');

    Route::prefix('materi-saya')->name('materi.siswa.')->group(function () {
        Route::get('/', [MateriController::class, 'siswa'])->name('index');
        Route::get('/{materi}', [MateriController::class, 'showSiswa'])->name('show');
        Route::post('/{materi}/progress', [MateriController::class, 'updateProgress'])->name('progress');
        Route::post('/tugas/{tugas}/submit', [MateriController::class, 'submitTugas'])->name('tugas.submit');
        Route::post('/{materi}/quiz', [MateriController::class, 'quizSubmit'])->name('quiz.submit');
        Route::post('/{materi}/poll/vote', [MateriController::class, 'votePoll'])->name('poll.vote');
        Route::post('/{materi}/discussion', [MateriController::class, 'storeDiscussion'])->name('discussion.store');
        Route::delete('/discussion/{discussion}', [MateriController::class, 'deleteDiscussion'])->name('discussion.destroy');
    });

    Route::prefix('course')->name('course.')->group(function () {
        Route::get('/', [CourseController::class, 'index'])->name('index');
        Route::get('/create', [CourseController::class, 'create'])->name('create');
        Route::post('/', [CourseController::class, 'store'])->name('store');
        Route::get('/{course}/edit', [CourseController::class, 'edit'])->name('edit');
        Route::put('/{course}', [CourseController::class, 'update'])->name('update');
        Route::delete('/{course}', [CourseController::class, 'destroy'])->name('destroy');
        Route::get('/{course}/pertemuan', [CourseController::class, 'pertemuan'])->name('pertemuan');
        Route::get('/{course}/pertemuan/create', [CourseController::class, 'pertemuanCreate'])->name('pertemuan.create');
        Route::post('/{course}/pertemuan', [CourseController::class, 'pertemuanStore'])->name('pertemuan.store');
        Route::get('/{course}/pertemuan/{pertemuan}/edit', [CourseController::class, 'pertemuanEdit'])->name('pertemuan.edit');
        Route::put('/{course}/pertemuan/{pertemuan}', [CourseController::class, 'pertemuanUpdate'])->name('pertemuan.update');
        Route::delete('/{course}/pertemuan/{pertemuan}', [CourseController::class, 'pertemuanDestroy'])->name('pertemuan.destroy');
        Route::post('/{course}/pertemuan/{pertemuan}/section', [CourseController::class, 'sectionStore'])->name('section.store');
        Route::put('/{course}/pertemuan/{pertemuan}/section/{section}', [CourseController::class, 'sectionUpdate'])->name('section.update');
        Route::delete('/{course}/pertemuan/{pertemuan}/section/{section}', [CourseController::class, 'sectionDestroy'])->name('section.destroy');
        Route::post('/{course}/pertemuan/{pertemuan}/section/reorder', [CourseController::class, 'sectionReorder'])->name('section.reorder');
        Route::post('/{course}/pertemuan/{pertemuan}/file', [CourseController::class, 'fileStore'])->name('file.store');
        Route::delete('/{course}/pertemuan/{pertemuan}/file/{file}', [CourseController::class, 'fileDestroy'])->name('file.destroy');
        Route::post('/{course}/pertemuan/{pertemuan}/quiz', [CourseController::class, 'quizStore'])->name('quiz.store');
        Route::put('/{course}/pertemuan/{pertemuan}/quiz/{quiz}', [CourseController::class, 'quizUpdate'])->name('quiz.update');
        Route::delete('/{course}/pertemuan/{pertemuan}/quiz/{quiz}', [CourseController::class, 'quizDestroy'])->name('quiz.destroy');
    });

    Route::prefix('course-saya')->name('course.siswa.')->group(function () {
        Route::get('/', [CourseSiswaController::class, 'index'])->name('index');
        Route::get('/{course}', [CourseSiswaController::class, 'show'])->name('show');
        Route::get('/{course}/{pertemuan}', [CourseSiswaController::class, 'pertemuan'])->name('pertemuan');
        Route::post('/{course}/{pertemuan}/quiz', [CourseSiswaController::class, 'quizSubmit'])->name('quiz.submit');
        Route::post('/{course}/{pertemuan}/selesai', [CourseSiswaController::class, 'markComplete'])->name('selesai');
    });

    Route::prefix('assessment')->name('assessment.')->group(function () {
        Route::get('/', [AssessmentController::class, 'index'])->name('index');
        Route::get('/create', [AssessmentController::class, 'create'])->name('create');
        Route::post('/', [AssessmentController::class, 'store'])->name('store');
        Route::get('/{assessment}/edit', [AssessmentController::class, 'edit'])->name('edit');
        Route::put('/{assessment}', [AssessmentController::class, 'update'])->name('update');
        Route::delete('/{assessment}', [AssessmentController::class, 'destroy'])->name('destroy');
        Route::get('/{assessment}/submissions', [AssessmentController::class, 'submissions'])->name('submissions');
        Route::post('/{assessment}/submissions/{submission}/grade', [AssessmentController::class, 'grade'])->name('grade');
    });

    Route::prefix('pertemuan')->name('pertemuan.')->group(function () {
        Route::get('/', [PertemuanController::class, 'index'])->name('index');
        Route::post('/roadmap', [PertemuanController::class, 'storeRoadmap'])->name('roadmap.store');
        Route::put('/roadmap/{roadmap}', [PertemuanController::class, 'updateRoadmap'])->name('roadmap.update');
        Route::post('/generate/{roadmap}', [PertemuanController::class, 'generate'])->name('generate');
        Route::put('/{pertemuan}', [PertemuanController::class, 'update'])->name('update');
        Route::post('/{pertemuan}/absen/buka', [AbsenController::class, 'buka'])->name('absen.buka');
        Route::post('/{pertemuan}/absen/tutup', [AbsenController::class, 'tutup'])->name('absen.tutup');
        Route::get('/{pertemuan}/absen/status', [AbsenController::class, 'status'])->name('absen.status');
    });

    Route::get('/absen', [AbsenController::class, 'siswaIndex'])->name('absen.siswa.index');
    Route::get('/absen/sesi-aktif', [AbsenController::class, 'sesiAktif'])->name('absen.sesi-aktif');
    Route::get('/absen/{token}', [AbsenController::class, 'scan'])->name('absen.scan');

    Route::get('/laporan/absensi', [LaporanController::class, 'absensi'])->name('laporan.absensi');

    Route::get('/badge', [BadgeController::class, 'index'])->name('badge.index');
});

require __DIR__.'/settings.php';

Route::fallback(function () {
    return redirect('/');
});
