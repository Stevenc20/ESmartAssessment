<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = UserLog::with('user');

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('activity', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($userId = $request->user_id) {
            $query->where('user_id', $userId);
        }

        $logs = $query->latest()->paginate(50);

        return Inertia::render('admin/logs/index', ['logs' => $logs]);
    }
}
