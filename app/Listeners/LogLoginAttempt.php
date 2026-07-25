<?php

namespace App\Listeners;

use App\Models\LoginSession;
use App\Models\UserLog;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\Fortify;

class LogLoginAttempt
{
    public function __construct(
        protected Request $request,
    ) {}

    public function handleLogin(Login $event): void
    {
        $user = $event->user;
        $ip = $this->request->ip();
        $ua = $this->request->userAgent();

        LoginSession::create([
            'user_id' => $user->id,
            'ip_address' => $ip,
            'user_agent' => $ua,
            'device_type' => $this->detectDevice($ua),
            'login_at' => now(),
            'is_active' => true,
        ]);

        UserLog::create([
            'user_id' => $user->id,
            'activity' => 'Login berhasil',
            'ip_address' => $ip,
        ]);
    }

    public function handleFailed(Failed $event): void
    {
        $ip = $this->request->ip();
        $email = $this->request->input(Fortify::username()) ?? 'unknown';

        DB::table('user_logs')->insert([
            'activity' => 'Login gagal: '.$email,
            'ip_address' => $ip,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function handleLogout(Logout $event): void
    {
        $user = $event->user;

        if ($user) {
            LoginSession::where('user_id', $user->id)
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'logout_at' => now(),
                ]);

            UserLog::create([
                'user_id' => $user->id,
                'activity' => 'Logout',
                'ip_address' => $this->request->ip(),
            ]);
        }
    }

    protected function detectDevice(?string $ua): string
    {
        if (! $ua) return 'unknown';

        if (preg_match('/Mobile|Android|iPhone|iPad/i', $ua)) return 'mobile';
        if (preg_match('/Tablet|iPad/i', $ua)) return 'tablet';
        return 'desktop';
    }
}
