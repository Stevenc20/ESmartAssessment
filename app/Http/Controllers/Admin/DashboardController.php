<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Challenge;
use App\Models\Materi;
use App\Models\User;
use App\Models\UserLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $roleSiswaId = DB::table('roles')->where('role_name', 'siswa')->value('id');
        $roleGuruId = DB::table('roles')->where('role_name', 'guru')->value('id');
        $roleSuperAdminId = DB::table('roles')->where('role_name', 'super_admin')->value('id');
        $roleAdminId = DB::table('roles')->where('role_name', 'admin')->value('id');

        $totalSiswa = $roleSiswaId ? User::where('role_id', $roleSiswaId)->where('status', 'active')->count() : 0;
        $totalGuru = $roleGuruId ? User::where('role_id', $roleGuruId)->where('status', 'active')->count() : 0;
        $totalAdmin = User::whereIn('role_id', array_filter([$roleAdminId, $roleSuperAdminId]))->count();
        $totalUser = User::count();

        $aktif = $roleSiswaId ? User::where('role_id', $roleSiswaId)->where('status', 'active')->count() : 0;
        $tidakAktif = $roleSiswaId ? User::where('role_id', $roleSiswaId)->where('status', '!=', 'active')->count() : 0;

        $totalMateri = Materi::count();
        $totalChallenge = Challenge::count();
        $totalCertificate = Certificate::count();

        $stats = [
            'totalUser' => $totalUser,
            'totalGuru' => $totalGuru,
            'totalSiswa' => $totalSiswa,
            'totalAdmin' => $totalAdmin,
            'totalMateri' => $totalMateri,
            'totalChallenge' => $totalChallenge,
            'totalCertificate' => $totalCertificate,
            'siswaAktif' => $aktif,
            'siswaTidakAktif' => $tidakAktif,
        ];

        $recentLogs = UserLog::with('user')->latest()->take(10)->get()->map(fn ($l) => [
            'id' => $l->id,
            'user_name' => $l->user?->name ?? '-',
            'activity' => $l->activity,
            'created_at' => $l->created_at->diffForHumans(),
        ]);

        $todayLogin = UserLog::whereDate('created_at', today())->count();
        $todayUpload = DB::table('pengumpulan_tugas')->whereDate('created_at', today())->count();
        $todayMateri = Materi::whereDate('created_at', today())->count();
        $todayChallenge = Challenge::whereDate('created_at', today())->count();

        $activityToday = [
            'login' => $todayLogin,
            'uploadTugas' => $todayUpload,
            'materiBaru' => $todayMateri,
            'challengeBaru' => $todayChallenge,
        ];

        $kelasWithSiswa = DB::table('kelas')
            ->leftJoin('siswa_kelas', 'kelas.id', '=', 'siswa_kelas.kelas_id')
            ->leftJoin('users', function ($q) use ($roleSiswaId) {
                $q->on('siswa_kelas.siswa_id', '=', 'users.id')
                  ->where('users.role_id', '=', $roleSiswaId)
                  ->where('users.status', '=', 'active');
            })
            ->select('kelas.id', 'kelas.nama_kelas', DB::raw('COUNT(DISTINCT users.id) as total_siswa'))
            ->groupBy('kelas.id', 'kelas.nama_kelas')
            ->get();

        $kelasIds = $kelasWithSiswa->pluck('id');

        $hadirCounts = DB::table('absensi')
            ->join('siswa_kelas', 'absensi.siswa_id', '=', 'siswa_kelas.siswa_id')
            ->where('absensi.status', 'hadir')
            ->whereIn('siswa_kelas.kelas_id', $kelasIds)
            ->select('siswa_kelas.kelas_id', DB::raw('COUNT(DISTINCT absensi.siswa_id) as hadir'))
            ->groupBy('siswa_kelas.kelas_id')
            ->pluck('hadir', 'kelas_id');

        $kelasAttendance = $kelasWithSiswa->map(fn ($k) => [
            'kelas' => $k->nama_kelas,
            'kehadiran' => $k->total_siswa > 0 ? round(($hadirCounts->get($k->id, 0) / $k->total_siswa) * 100) : 0,
        ]);

        $monthlyGrowth = DB::table('users')
            ->where('role_id', $roleSiswaId)
            ->select(DB::raw("DATE_FORMAT(created_at, '%m') as bulan"), DB::raw('count(*) as total'))
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->map(fn ($r) => [
                'bulan' => Carbon::create()->month((int) $r->bulan)->locale('id')->isoFormat('MMM'),
                'total' => $r->total,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentLogs' => $recentLogs,
            'activityToday' => $activityToday,
            'kelasAttendance' => $kelasAttendance,
            'monthlyGrowth' => $monthlyGrowth,
        ]);
    }
}
