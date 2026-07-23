<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $existing = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($existing) {
            if (! $existing->google_id) {
                $existing->update(['google_id' => $googleUser->getId()]);
            }

            if (! $existing->email_verified_at) {
                $existing->update(['email_verified_at' => now()]);
            }

            Auth::login($existing);

        return Inertia::location('/dashboard');
        }

        $settings = Cache::get('app_settings', ['registration_open' => true]);
        if (! ($settings['registration_open'] ?? true)) {
            return redirect()->route('login')->with('status', 'Maaf, pendaftaran akun baru sedang tidak dibuka.');
        }

        Session::put('google_user', [
            'google_id' => $googleUser->getId(),
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'avatar' => $googleUser->getAvatar(),
        ]);

        return redirect()->route('register.complete');
    }

    public function showCompleteForm()
    {
        if (! Session::has('google_user')) {
            return redirect()->route('login');
        }

        $googleUser = Session::get('google_user');

        return Inertia::render('auth/complete-registration', [
            'googleUser' => $googleUser,
        ]);
    }

    public function completeRegistration(Request $request)
    {
        if (! Session::has('google_user')) {
            return redirect()->route('login');
        }

        $googleUser = Session::get('google_user');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'no_hp' => 'nullable|string|max:20',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:10240',
            'kelas' => 'required|in:10,11',
            'jurusan' => 'required|string|max:255',
        ]);

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $disk = 'public';
            $dir = 'profile-photos';
            if (! Storage::disk($disk)->exists($dir)) {
                \Storage::disk($disk)->makeDirectory($dir);
            }
            $fotoPath = $request->file('foto')->store($dir, $disk);
        }

        $siswaRole = Role::where('role_name', 'siswa')->first();

        $user = User::create([
            'google_id' => $googleUser['google_id'],
            'name' => $validated['name'],
            'email' => $googleUser['email'],
            'email_verified_at' => now(),
            'no_hp' => $validated['no_hp'] ?? null,
            'foto' => $fotoPath,
            'kelas' => $validated['kelas'],
            'jurusan' => $validated['jurusan'],
            'role_id' => $siswaRole?->id,
            'status' => 'active',
        ]);

        $kelas = Kelas::where('tingkat', $validated['kelas'])->first();
        if ($kelas) {
            DB::table('siswa_kelas')->insert([
                'siswa_id' => $user->id,
                'kelas_id' => $kelas->id,
                'tanggal_masuk' => now()->toDateString(),
            ]);
        }

        Session::forget('google_user');

        Auth::login($user);

        return Inertia::location('/dashboard');
    }
}
