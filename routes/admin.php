<?php

use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BackupController;
use App\Http\Controllers\Admin\CertificateTemplateController;
use App\Http\Controllers\Admin\ContentManagementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FeatureController;
use App\Http\Controllers\Admin\GlobalAnnouncementController;
use App\Http\Controllers\Admin\InactiveStudentController;
use App\Http\Controllers\Admin\KelasController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\MonitoringController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\TahunAjaranController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    // ── Dashboard ──
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── User Management ──
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');
    Route::delete('/users/{user}/force', [UserController::class, 'forceDestroy'])->name('users.force-destroy');

    // ── Role & Permission ──
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    Route::put('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.permissions');

    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    Route::post('/permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    // ── Feature Management ──
    Route::get('/features', [FeatureController::class, 'index'])->name('features.index');
    Route::put('/features/{feature}', [FeatureController::class, 'toggle'])->name('features.toggle');

    // ── Academic Management ──
    Route::get('/tahun-ajaran', [TahunAjaranController::class, 'index'])->name('tahun-ajaran.index');
    Route::post('/tahun-ajaran', [TahunAjaranController::class, 'store'])->name('tahun-ajaran.store');
    Route::put('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'update'])->name('tahun-ajaran.update');
    Route::delete('/tahun-ajaran/{tahunAjaran}', [TahunAjaranController::class, 'destroy'])->name('tahun-ajaran.destroy');

    Route::get('/kelas', [KelasController::class, 'index'])->name('kelas.index');
    Route::post('/kelas', [KelasController::class, 'store'])->name('kelas.store');
    Route::put('/kelas/{kelas}', [KelasController::class, 'update'])->name('kelas.update');
    Route::delete('/kelas/{kelas}', [KelasController::class, 'destroy'])->name('kelas.destroy');

    // ── Content Management ──
    Route::get('/content-management', [ContentManagementController::class, 'index'])->name('content-management.index');
    Route::post('/content-management/badges', [ContentManagementController::class, 'storeBadge'])->name('content-management.badges.store');
    Route::put('/content-management/badges/{badge}', [ContentManagementController::class, 'updateBadge'])->name('content-management.badges.update');
    Route::delete('/content-management/badges/{badge}', [ContentManagementController::class, 'destroyBadge'])->name('content-management.badges.destroy');

    // ── Announcements ──
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    // ── Global Announcements (Super Admin only) ──
    Route::get('/global-announcements', [GlobalAnnouncementController::class, 'index'])->name('global-announcements.index');
    Route::post('/global-announcements', [GlobalAnnouncementController::class, 'store'])->name('global-announcements.store');
    Route::put('/global-announcements/{globalAnnouncement}', [GlobalAnnouncementController::class, 'update'])->name('global-announcements.update');
    Route::delete('/global-announcements/{globalAnnouncement}', [GlobalAnnouncementController::class, 'destroy'])->name('global-announcements.destroy');
    Route::put('/global-announcements/{globalAnnouncement}/toggle', [GlobalAnnouncementController::class, 'toggle'])->name('global-announcements.toggle');

    // ── Monitoring Center ──
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('monitoring.index');

    // ── Audit Log ──
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // ── Activity Log (existing, for backward compat) ──
    Route::get('/logs', [LogController::class, 'index'])->name('logs.index');

    // ── Settings ──
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');

    // ── Backup ──
    Route::get('/backup', [BackupController::class, 'index'])->name('backup.index');
    Route::post('/backup', [BackupController::class, 'generate'])->name('backup.generate');
    Route::get('/backup/{filename}/download', [BackupController::class, 'download'])->name('backup.download');

    // ── Inactive Students ──
    Route::get('/inactive-students', [InactiveStudentController::class, 'index'])->name('inactive-students.index');
    Route::post('/inactive-students/{inactiveStudent}/restore', [InactiveStudentController::class, 'restore'])->name('inactive-students.restore');
    Route::delete('/inactive-students/{inactiveStudent}', [InactiveStudentController::class, 'destroy'])->name('inactive-students.destroy');

    // ── Certificate Templates ──
    Route::get('/certificate-templates', [CertificateTemplateController::class, 'index'])->name('certificate-templates.index');
    Route::post('/certificate-templates', [CertificateTemplateController::class, 'store'])->name('certificate-templates.store');
    Route::put('/certificate-templates/{certificateTemplate}', [CertificateTemplateController::class, 'update'])->name('certificate-templates.update');
    Route::delete('/certificate-templates/{certificateTemplate}', [CertificateTemplateController::class, 'destroy'])->name('certificate-templates.destroy');
    Route::put('/certificate-templates/{certificateTemplate}/set-default', [CertificateTemplateController::class, 'setDefault'])->name('certificate-templates.set-default');
});
