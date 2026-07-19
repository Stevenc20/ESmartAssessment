<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/permissions/index', [
            'permissions' => Permission::all()->groupBy('module'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'permission_name' => 'required|string|max:100|unique:permissions,permission_name',
            'module' => 'required|string|max:50',
        ]);

        Permission::create($validated);

        return back()->with('success', 'Permission berhasil ditambahkan.');
    }

    public function destroy(Permission $permission)
    {
        $permission->roles()->detach();
        $permission->delete();

        return back()->with('success', 'Permission berhasil dihapus.');
    }
}
