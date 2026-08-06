<?php

use App\Http\Controllers\Api\AnnouncementController;
use Illuminate\Support\Facades\Route;

Route::get('/announcements', [AnnouncementController::class, 'index'])->middleware('auth');
Route::get('/announcements/stream', [AnnouncementController::class, 'stream'])->middleware('auth');
Route::get('/unread-counts', [AnnouncementController::class, 'unreadCounts'])->middleware('auth');
