<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Certificate;
use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\Kelas;
use App\Models\PengumpulanTugas;
use App\Models\Portfolio;
use App\Models\ProgressMateri;
use App\Models\StudentPoint;
use App\Models\Tugas;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load('role');

        $roleSiswaId = DB::table('roles')->where('role_name', 'siswa')->value('id');
        $roleGuruId = DB::table('roles')->where('role_name', 'guru')->value('id');
        $roleAdminIds = DB::table('roles')->whereIn('role_name', ['admin', 'super_admin'])->pluck('id');

        $stats = [
            'totalSiswa' => $roleSiswaId ? User::where('role_id', $roleSiswaId)->count() : 0,
            'totalGuru' => $roleGuruId ? User::where('role_id', $roleGuruId)->count() : 0,
            'totalAdmin' => $roleAdminIds->isNotEmpty() ? User::whereIn('role_id', $roleAdminIds)->count() : 0,
            'totalSiswaWithKelas' => DB::table('siswa_kelas')->distinct('siswa_id')->count('siswa_id'),
            'totalKelas' => Kelas::count(),
            'totalAssessment' => Tugas::count(),
            'totalChallenge' => Challenge::count(),
            'totalUsers' => User::count(),
        ];

        $recentUsers = User::with('role')->latest()->take(5)->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role_name' => $u->role?->role_name ?? '-',
            'created_at' => $u->created_at->diffForHumans(),
        ]);

        $recentLogs = DB::table('user_logs')
            ->join('users', 'user_logs.user_id', '=', 'users.id')
            ->select('user_logs.*', 'users.name as user_name')
            ->latest('user_logs.created_at')
            ->take(10)
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'user_name' => $l->user_name,
                'activity' => $l->activity ?? '-',
                'created_at' => Carbon::parse($l->created_at)->diffForHumans(),
            ]);

        $studentDashboard = null;
        if ($user->role?->role_name === 'siswa') {
            $siswaId = $user->id;

            $assessmentSelesai = PengumpulanTugas::where('siswa_id', $siswaId)
                ->whereHas('penilaian')
                ->count();

            $rataNilai = PengumpulanTugas::where('siswa_id', $siswaId)
                ->whereHas('penilaian')
                ->with('penilaian')
                ->get()
                ->avg(fn ($p) => $p->penilaian->nilai);

            $rataNilai = $rataNilai ? round($rataNilai, 2) : null;

            $badgeCount = DB::table('badges')->count();

            $totalPoints = StudentPoint::where('siswa_id', $siswaId)->sum('point');

            $rataRataSemua = PengumpulanTugas::whereHas('penilaian')
                ->with('penilaian')
                ->get()
                ->groupBy('siswa_id')
                ->map(fn ($items) => round($items->avg(fn ($p) => $p->penilaian->nilai), 2))
                ->sortDesc();

            $ranking = null;
            $totalSiswaRanked = 0;

            if ($rataRataSemua->isNotEmpty()) {
                $rankedIds = $rataRataSemua->keys()->values();
                $pos = $rankedIds->search(fn ($id) => (int) $id === $siswaId);
                if ($pos !== false) {
                    $ranking = $pos + 1;
                }
                $totalSiswaRanked = $rataRataSemua->count();
            }

            $totalMateri = ProgressMateri::where('siswa_id', $siswaId)->count();
            $completedMateri = ProgressMateri::where('siswa_id', $siswaId)
                ->where('status', 'completed')
                ->count();

            $totalPertemuan = Absensi::where('siswa_id', $siswaId)->count();
            $hadir = Absensi::where('siswa_id', $siswaId)->where('status', 'hadir')->count();
            $kehadiran = $totalPertemuan > 0 ? round(($hadir / $totalPertemuan) * 100) : 0;

            $certificateCount = Certificate::where('siswa_id', $siswaId)->count();

            $recentActivity = collect()
                ->merge(
                    PengumpulanTugas::where('siswa_id', $siswaId)
                        ->with('tugas')
                        ->latest()
                        ->take(5)
                        ->get()
                        ->map(fn ($p) => [
                            'id' => 't-'.$p->id,
                            'type' => 'assessment',
                            'description' => 'Menyelesaikan '.($p->tugas?->judul ?? 'Tugas'),
                            'time' => $p->created_at->diffForHumans(),
                            'sort_time' => $p->created_at->timestamp,
                        ])
                )
                ->merge(
                    Portfolio::where('siswa_id', $siswaId)
                        ->latest()
                        ->take(5)
                        ->get()
                        ->map(fn ($p) => [
                            'id' => 'p-'.$p->id,
                            'type' => 'portfolio',
                            'description' => 'Mengirim portfolio: '.$p->judul,
                            'time' => $p->created_at->diffForHumans(),
                            'sort_time' => $p->created_at->timestamp,
                        ])
                )
                ->merge(
                    ChallengeSubmission::where('siswa_id', $siswaId)
                        ->with('challenge')
                        ->latest()
                        ->take(5)
                        ->get()
                        ->map(fn ($c) => [
                            'id' => 'c-'.$c->id,
                            'type' => 'challenge',
                            'description' => 'Mengikuti challenge: '.($c->challenge?->judul ?? 'Challenge'),
                            'time' => $c->created_at->diffForHumans(),
                            'sort_time' => $c->created_at->timestamp,
                        ])
                )
                ->sortByDesc('sort_time')
                ->take(5)
                ->values()
                ->map(fn ($item) => collect($item)->except('sort_time')->toArray());

            $grade = $rataNilai !== null
                ? ($rataNilai >= 90 ? 'A' : ($rataNilai >= 80 ? 'B' : ($rataNilai >= 70 ? 'C' : ($rataNilai >= 60 ? 'D' : 'E'))))
                : null;

            $studentDashboard = [
                'assessmentSelesai' => $assessmentSelesai,
                'rataNilai' => $rataNilai,
                'grade' => $grade,
                'badgeCount' => $badgeCount,
                'ranking' => $ranking,
                'totalPoints' => $totalPoints,
                'totalSiswa' => $totalSiswaRanked,
                'progressMateri' => [
                    'total' => $totalMateri,
                    'completed' => $completedMateri,
                    'persen' => $totalMateri > 0 ? round(($completedMateri / $totalMateri) * 100) : 0,
                ],
                'kehadiran' => $kehadiran,
                'certificateCount' => $certificateCount,
                'recentActivity' => $recentActivity,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentLogs' => $recentLogs,
            'studentDashboard' => $studentDashboard,
        ]);
    }
}
