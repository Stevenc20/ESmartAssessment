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

        $kelasLabels = ['10' => '🌱 Genesis 10', '11' => '🔥 Ascend 11'];

        $siswaByKelas = User::where('role_id', $roleSiswaId)
            ->where('status', 'active')
            ->whereNotNull('kelas')
            ->select('kelas', DB::raw('COUNT(*) as total_siswa'))
            ->groupBy('kelas')
            ->pluck('total_siswa', 'kelas');

        $hadirByKelas = DB::table('absensi')
            ->join('users', 'absensi.siswa_id', '=', 'users.id')
            ->where('absensi.status', 'hadir')
            ->where('users.role_id', $roleSiswaId)
            ->where('users.status', 'active')
            ->whereNotNull('users.kelas')
            ->select('users.kelas', DB::raw('COUNT(DISTINCT absensi.siswa_id) as hadir'))
            ->groupBy('users.kelas')
            ->pluck('hadir', 'kelas');

        $kelasAttendance = $siswaByKelas->map(fn ($total, $k) => [
            'kelas' => $kelasLabels[$k] ?? $k,
            'kehadiran' => $total > 0 ? round(($hadirByKelas->get($k, 0) / $total) * 100) : 0,
        ])->values();

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
