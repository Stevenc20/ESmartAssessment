<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\InactiveStudent;

class UndoMassDeactivate extends Command
{
    protected $signature = "student:undo-mass-deactivate";
    protected $description = "Memulihkan siswa yang salah dinonaktifkan massal karena batas aman 75%";

    public function handle()
    {
        // Cari siswa yang dinonaktifkan dengan alasan "Kehadiran di bawah batas aman"
        $inactives = InactiveStudent::where("alasan", "like", "%Kehadiran di bawah batas aman%")->get();
        $count = 0;

        foreach ($inactives as $inactive) {
            $user = User::find($inactive->siswa_id);
            if ($user && $user->status === "inactive") {
                $user->update(["status" => "active"]);
                $count++;
            }
            $inactive->delete(); // Hapus log inactivenya agar bersih
        }

        $this->info("Berhasil memulihkan $count siswa yang salah dinonaktifkan.");
        
        // Jalankan ulang auto-deactivate yang sudah diperbaiki
        $this->info("Menjalankan ulang pengecekan auto-deactivate yang benar...");
        \Illuminate\Support\Facades\Artisan::call("student:auto-deactivate");
        $this->info(\Illuminate\Support\Facades\Artisan::output());
    }
}
