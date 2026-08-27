<?php

namespace App\Http\Controllers;

use App\Models\InactiveStudent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InactiveStudentController extends Controller
{
    public function index()
    {
        $students = InactiveStudent::with("siswa")
            ->where("status", "inactive")
            ->where("alasan", "like", "Otomatis oleh sistem%")
            ->orderBy("created_at", "desc")
            ->get()
            ->map(function ($item) {
                return [
                    "id" => $item->id,
                    "siswa_id" => $item->siswa_id,
                    "name" => $item->siswa?->name,
                    "kelas" => $item->siswa?->kelas,
                    "tanggal_nonaktif" => $item->tanggal_nonaktif,
                    "alasan" => $item->alasan,
                    "status" => $item->status,
                ];
            });

        return Inertia::render("teacher/inactive-students/index", [
            "inactiveStudents" => $students
        ]);
    }

    public function restore(Request $request, $id)
    {
        $inactive = InactiveStudent::findOrFail($id);
        
        if ($inactive->siswa_id) {
            $user = \App\Models\User::find($inactive->siswa_id);
            if ($user) {
                $user->update(['status' => 'active']);
            }
        }
        
        $inactive->update(['status' => 'restored']);
        
        return redirect()->back()->with('success', 'Siswa berhasil diaktifkan kembali. Sistem tidak akan menonaktifkannya otomatis selama 14 hari ke depan.');
    }

    public function deactivate(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);
        
        $user->update(['status' => 'inactive']);
        
        InactiveStudent::updateOrCreate(
            ['siswa_id' => $user->id],
            [
                'alasan' => 'Otomatis oleh sistem: Dinonaktifkan manual oleh guru dari dashboard (kehadiran rendah)',
                'tanggal_nonaktif' => now()->toDateString(),
                'status' => 'inactive'
            ]
        );
        
        return redirect()->back()->with('success', 'Siswa berhasil dinonaktifkan.');
    }
}
