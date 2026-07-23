<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class FortifyLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $role = $request->user()?->role?->role_name;

        if (in_array($role, ['super_admin', 'admin'])) {
            return Inertia::location('/admin/dashboard');
        }

        return Inertia::location('/dashboard');
    }
}
