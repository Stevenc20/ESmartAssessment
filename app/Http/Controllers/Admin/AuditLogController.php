<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user');

        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($action = $request->action) {
            $query->where('action', $action);
        }

        $logs = $query->latest()->paginate(50);

        $actions = AuditLog::select('action')->distinct()->pluck('action');

        return Inertia::render('admin/audit-logs/index', [
            'logs' => $logs,
            'actions' => $actions,
        ]);
    }
}
