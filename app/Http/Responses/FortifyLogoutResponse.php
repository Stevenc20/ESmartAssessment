<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;

class FortifyLogoutResponse implements LogoutResponseContract
{
    public function toResponse($request)
    {
        return Inertia::location('/login');
    }
}
