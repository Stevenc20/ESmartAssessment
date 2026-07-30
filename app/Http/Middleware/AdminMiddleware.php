<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowed = ! empty($roles) ? $roles : ['super_admin'];

        if (! $user || ! $user->role || ! in_array($user->role->role_name, $allowed)) {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
