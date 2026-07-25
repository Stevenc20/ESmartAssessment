<?php

namespace App\Providers;

use App\Listeners\LogLoginAttempt;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [
            LogLoginAttempt::class,
        ],
        Failed::class => [
            LogLoginAttempt::class,
        ],
        Logout::class => [
            LogLoginAttempt::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
