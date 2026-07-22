<?php

use App\Http\Controllers\AbsenController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\Auth\GoogleController;
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

    Route::inertia('admin/login', 'auth/admin-login')->name('admin.login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('materi', MateriController::class)->except('show');

    Route::get('pengumuman', [PengumumanController::class, 'index'])->name('pengumuman.index');

    Route::prefix('materi-saya')->name('materi.siswa.')->group(function () {
        Route::get('/', [MateriController::class, 'siswa'])->name('index');
        Route::post('/{materi}/progress', [MateriController::class, 'updateProgress'])->name('progress');
        Route::post('/tugas/{tugas}/submit', [MateriController::class, 'submitTugas'])->name('tugas.submit');
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
});

require __DIR__.'/settings.php';
