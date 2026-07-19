<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::withCount('users')->with('permissions')->get();
        $permissions = Permission::all()->groupBy('module');

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'role_name' => 'required|string|max:50|unique:roles,role_name',
            'description' => 'nullable|string|max:255',
        ]);

        Role::create($validated);

        return back()->with('success', 'Role berhasil ditambahkan.');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'role_name' => ['required', 'string', 'max:50', Rule::unique('roles', 'role_name')->ignore($role->id)],
            'description' => 'nullable|string|max:255',
        ]);

        $role->update($validated);

        return back()->with('success', 'Role berhasil diperbarui.');
    }

    public function destroy(Role $role)
    {
        if ($role->users()->count() > 0) {
            return back()->with('error', 'Tidak dapat menghapus role yang masih memiliki user.');
        }

        if (in_array($role->role_name, ['super_admin', 'admin', 'guru', 'siswa'])) {
            return back()->with('error', 'Tidak dapat menghapus role default sistem.');
        }

        $role->permissions()->detach();
        $role->delete();

        return back()->with('success', 'Role berhasil dihapus.');
    }

    public function syncPermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->permissions()->sync($request->permissions ?? []);

        return back()->with('success', 'Hak akses role berhasil diperbarui.');
    }
}
