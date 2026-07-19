<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Cache::get('app_settings', [
            'app_name' => config('app.name'),
            'registration_open' => true,
            'maintenance_mode' => false,
            'max_login_attempts' => 5,
            'session_timeout' => 120,
        ]);

        return Inertia::render('admin/settings/index', ['settings' => $settings]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'app_name' => 'required|string|max:255',
            'registration_open' => 'boolean',
            'maintenance_mode' => 'boolean',
            'max_login_attempts' => 'required|integer|min:1|max:20',
            'session_timeout' => 'required|integer|min:15|max:480',
        ]);

        Cache::forever('app_settings', $validated);

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
