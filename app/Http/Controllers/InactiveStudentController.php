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
}
