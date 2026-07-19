<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('auth')->name('auth.')->group(function () {
    Route::get('google', [App\Http\Controllers\Auth\GoogleController::class, 'redirect'])->name('google.redirect');
    Route::get('google/callback', [App\Http\Controllers\Auth\GoogleController::class, 'callback'])->name('google.callback');
});

Route::middleware(['guest'])->group(function () {
    Route::get('register/complete', [App\Http\Controllers\Auth\GoogleController::class, 'showCompleteForm'])->name('register.complete');
    Route::post('register/complete', [App\Http\Controllers\Auth\GoogleController::class, 'completeRegistration'])->name('register.complete.store');

    Route::inertia('admin/login', 'auth/admin-login')->name('admin.login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('materi', App\Http\Controllers\MateriController::class)->except('show');

    Route::get('pengumuman', [App\Http\Controllers\PengumumanController::class, 'index'])->name('pengumuman.index');

    Route::prefix('materi-saya')->name('materi.siswa.')->group(function () {
        Route::get('/', [App\Http\Controllers\MateriController::class, 'siswa'])->name('index');
        Route::post('/{materi}/progress', [App\Http\Controllers\MateriController::class, 'updateProgress'])->name('progress');
        Route::post('/tugas/{tugas}/submit', [App\Http\Controllers\MateriController::class, 'submitTugas'])->name('tugas.submit');
    });

    Route::prefix('assessment')->name('assessment.')->group(function () {
        Route::get('/', [App\Http\Controllers\AssessmentController::class, 'index'])->name('index');
        Route::get('/create', [App\Http\Controllers\AssessmentController::class, 'create'])->name('create');
        Route::post('/', [App\Http\Controllers\AssessmentController::class, 'store'])->name('store');
        Route::get('/{assessment}/edit', [App\Http\Controllers\AssessmentController::class, 'edit'])->name('edit');
        Route::put('/{assessment}', [App\Http\Controllers\AssessmentController::class, 'update'])->name('update');
        Route::delete('/{assessment}', [App\Http\Controllers\AssessmentController::class, 'destroy'])->name('destroy');
        Route::get('/{assessment}/submissions', [App\Http\Controllers\AssessmentController::class, 'submissions'])->name('submissions');
        Route::post('/{assessment}/submissions/{submission}/grade', [App\Http\Controllers\AssessmentController::class, 'grade'])->name('grade');
    });

    Route::prefix('pertemuan')->name('pertemuan.')->group(function () {
        Route::get('/', [App\Http\Controllers\PertemuanController::class, 'index'])->name('index');
        Route::post('/roadmap', [App\Http\Controllers\PertemuanController::class, 'storeRoadmap'])->name('roadmap.store');
        Route::post('/generate/{roadmap}', [App\Http\Controllers\PertemuanController::class, 'generate'])->name('generate');
        Route::put('/{pertemuan}', [App\Http\Controllers\PertemuanController::class, 'update'])->name('update');
        Route::post('/{pertemuan}/absen/buka', [App\Http\Controllers\AbsenController::class, 'buka'])->name('absen.buka');
        Route::post('/{pertemuan}/absen/tutup', [App\Http\Controllers\AbsenController::class, 'tutup'])->name('absen.tutup');
        Route::get('/{pertemuan}/absen/status', [App\Http\Controllers\AbsenController::class, 'status'])->name('absen.status');
    });

    Route::get('/absen', [App\Http\Controllers\AbsenController::class, 'siswaIndex'])->name('absen.siswa.index');
    Route::get('/absen/sesi-aktif', [App\Http\Controllers\AbsenController::class, 'sesiAktif'])->name('absen.sesi-aktif');
    Route::get('/absen/{token}', [App\Http\Controllers\AbsenController::class, 'scan'])->name('absen.scan');

    Route::get('/laporan/absensi', [App\Http\Controllers\LaporanController::class, 'absensi'])->name('laporan.absensi');
});

require __DIR__.'/settings.php';
