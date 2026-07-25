<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AdminLoginController extends Controller
{
    public function showForm()
    {
        return Inertia::render('auth/admin-login', [
            'recaptcha_site_key' => config('captcha.sitekey'),
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'g-recaptcha-response' => 'required|string',
        ]);

        if (! $this->verifyRecaptcha($request->input('g-recaptcha-response'), $request->ip())) {
            throw ValidationException::withMessages([
                'email' => ['Verifikasi keamanan gagal. Silakan coba lagi.'],
            ]);
        }

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember');

        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $user = $request->user();

            if (! $user->role || ! in_array($user->role->role_name, ['super_admin', 'admin', 'guru'])) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                throw ValidationException::withMessages([
                    'email' => ['Akun ini tidak memiliki akses ke halaman ini.'],
                ]);
            }

            return redirect()->intended('/admin/dashboard');
        }

        throw ValidationException::withMessages([
            'email' => ['Email atau password salah.'],
        ]);
    }

    protected function verifyRecaptcha(string $token, string $ip): bool
    {
        $secret = config('captcha.secret');

        if (! $secret) {
            return true;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip,
        ]);

        $result = $response->json();

        return $result['success'] ?? false;
    }
}
