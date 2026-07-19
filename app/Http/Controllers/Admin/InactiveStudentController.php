<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InactiveStudent;
use App\Models\RecycleAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InactiveStudentController extends Controller
{
    public function index()
    {
        $items = InactiveStudent::with('siswa')->latest()->get();
        $recycled = RecycleAccount::with('siswa')->latest()->get();

        return Inertia::render('admin/inactive-students/index', [
            'items' => $items,
            'recycled' => $recycled,
        ]);
    }

    public function restore(InactiveStudent $inactiveStudent)
    {
        $user = $inactiveStudent->siswa;

        if ($user) {
            $user->update(['status' => 'active']);

            RecycleAccount::updateOrCreate(
                ['siswa_id' => $user->id],
                ['restored_at' => now(), 'archived_at' => $inactiveStudent->tanggal_nonaktif]
            );
        }

        $inactiveStudent->delete();

        return back()->with('success', 'Akun siswa berhasil diaktifkan kembali.');
    }

    public function destroy(InactiveStudent $inactiveStudent)
    {
        $inactiveStudent->delete();

        return back()->with('success', 'Data siswa nonaktif berhasil dihapus.');
    }
}
