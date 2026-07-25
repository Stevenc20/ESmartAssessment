<?php

namespace App\Providers;

use App\Listeners\LogLoginAttempt;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        Event::listen(Login::class, [LogLoginAttempt::class, 'handleLogin']);
        Event::listen(Failed::class, [LogLoginAttempt::class, 'handleFailed']);
        Event::listen(Logout::class, [LogLoginAttempt::class, 'handleLogout']);
    }
}
