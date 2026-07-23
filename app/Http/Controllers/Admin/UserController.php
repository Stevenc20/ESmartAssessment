<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InactiveStudent;
use App\Models\RecycleAccount;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('role')->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        $users = $query->paginate(20)->withQueryString();
        $roles = Role::all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only('search', 'role_id'),
        ]);
    }

    public function create()
    {
        $roles = Role::all();

        return Inertia::render('admin/users/create', ['roles' => $roles]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',

            'no_hp' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        $user->load('role');
        $roles = Role::all();

        return Inertia::render('admin/users/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role_id' => 'required|exists:roles,id',

            'no_hp' => 'nullable|string|max:20',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        if ($validated['password'] ?? false) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        $user->update(['status' => 'inactive']);

        if ($user->role?->role_name === 'siswa') {
            InactiveStudent::create([
                'siswa_id' => $user->id,
                'alasan' => 'Dinonaktifkan oleh admin',
                'tanggal_nonaktif' => now(),
                'status' => 'inactive',
            ]);
        }

        return back()->with('success', 'User berhasil dinonaktifkan.');
    }

    public function restore(User $user)
    {
        $user->update(['status' => 'active']);

        $inactive = InactiveStudent::where('siswa_id', $user->id)->latest()->first();
        if ($inactive) {
            RecycleAccount::updateOrCreate(
                ['siswa_id' => $user->id],
                ['restored_at' => now(), 'archived_at' => $inactive->tanggal_nonaktif]
            );
            $inactive->delete();
        }

        return back()->with('success', 'User berhasil diaktifkan kembali.');
    }

    public function forceDestroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus permanen.');
    }
}
