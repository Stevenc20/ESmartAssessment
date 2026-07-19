<?php

namespace App\Http\Controllers;

use App\Models\Materi;
use App\Models\PengumpulanTugas;
use App\Models\PenilaianTugas;
use App\Models\Tugas;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AssessmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->load('role');

        if ($user->role?->role_name === 'siswa') {
            return $this->studentIndex($request);
        }

        return $this->teacherIndex($request);
    }

    protected function studentIndex(Request $request)
    {
        $user = $request->user();

        $tugasList = Tugas::with('materi')
            ->latest()
            ->get()
            ->map(function ($tugas) use ($user) {
                $submission = PengumpulanTugas::where('tugas_id', $tugas->id)
                    ->where('siswa_id', $user->id)
                    ->latest()
                    ->first();

                $penilaian = $submission
                    ? PenilaianTugas::where('pengumpulan_id', $submission->id)->first()
                    : null;

                $deadlinePassed = $tugas->deadline && Carbon::parse($tugas->deadline)->isPast();

                return [
                    'id' => $tugas->id,
                    'judul' => $tugas->judul,
                    'deskripsi' => $tugas->deskripsi,
                    'materi' => $tugas->materi?->judul ?? '-',
                    'deadline' => $tugas->deadline ? Carbon::parse($tugas->deadline)->format('d M Y H:i') : '-',
                    'deadline_passed' => $deadlinePassed,
                    'bobot' => $tugas->bobot,
                    'max_revisi' => $tugas->max_revisi,
                    'status' => $submission
                        ? ($penilaian ? 'dinilai' : 'dikirim')
                        : ($deadlinePassed ? 'terlewat' : 'tersedia'),
                    'nilai' => $penilaian?->nilai,
                    'submitted_at' => $submission
                        ? $submission->created_at->diffForHumans()
                        : null,
                ];
            });

        return Inertia::render('assessment/index', [
            'assessments' => $tugasList,
        ]);
    }

    protected function teacherIndex(Request $request)
    {
        $tugasList = Tugas::with('materi')
            ->withCount([
                'pengumpulan as total_submissions',
                'pengumpulan as graded_submissions' => fn ($q) => $q->whereHas('penilaian'),
                'pengumpulan as ungraded_submissions' => fn ($q) => $q->whereDoesntHave('penilaian'),
            ])
            ->latest()
            ->get()
            ->map(function ($tugas) {
                return [
                    'id' => $tugas->id,
                    'judul' => $tugas->judul,
                    'deskripsi' => $tugas->deskripsi,
                    'materi' => $tugas->materi?->judul ?? '-',
                    'deadline' => $tugas->deadline ? Carbon::parse($tugas->deadline)->format('d M Y H:i') : '-',
                    'deadline_passed' => $tugas->deadline && Carbon::parse($tugas->deadline)->isPast(),
                    'bobot' => $tugas->bobot,
                    'max_revisi' => $tugas->max_revisi,
                    'total_submissions' => $tugas->total_submissions,
                    'graded_submissions' => $tugas->graded_submissions,
                    'ungraded_submissions' => $tugas->ungraded_submissions,
                ];
            });

        $stats = [
            'total' => $tugasList->count(),
            'total_submissions' => $tugasList->sum('total_submissions'),
            'ungraded' => $tugasList->sum('ungraded_submissions'),
        ];

        return Inertia::render('assessment/manage', [
            'assessments' => $tugasList,
            'stats' => $stats,
        ]);
    }

    public function create(Request $request)
    {
        $materiList = Materi::orderBy('judul')->get(['id', 'judul']);

        return Inertia::render('assessment/create', [
            'materiList' => $materiList,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'materi_id' => 'required|exists:materi,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'deadline' => 'nullable|date',
            'bobot' => 'required|integer|min:1|max:100',
            'max_revisi' => 'required|integer|min:0',
        ]);

        Tugas::create($data);

        return redirect()->route('assessment.index')
            ->with('success', 'Assessment berhasil dibuat.');
    }

    public function edit(Tugas $assessment)
    {
        $materiList = Materi::orderBy('judul')->get(['id', 'judul']);

        return Inertia::render('assessment/edit', [
            'assessment' => [
                'id' => $assessment->id,
                'materi_id' => $assessment->materi_id,
                'judul' => $assessment->judul,
                'deskripsi' => $assessment->deskripsi,
                'deadline' => $assessment->deadline,
                'bobot' => $assessment->bobot,
                'max_revisi' => $assessment->max_revisi,
            ],
            'materiList' => $materiList,
        ]);
    }

    public function update(Request $request, Tugas $assessment)
    {
        $data = $request->validate([
            'materi_id' => 'required|exists:materi,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'deadline' => 'nullable|date',
            'bobot' => 'required|integer|min:1|max:100',
            'max_revisi' => 'required|integer|min:0',
        ]);

        $assessment->update($data);

        return redirect()->route('assessment.index')
            ->with('success', 'Assessment berhasil diperbarui.');
    }

    public function destroy(Tugas $assessment)
    {
        $assessment->delete();

        return redirect()->route('assessment.index')
            ->with('success', 'Assessment berhasil dihapus.');
    }

    public function submissions(Request $request, Tugas $assessment)
    {
        $assessment->load('materi');

        $submissions = PengumpulanTugas::where('tugas_id', $assessment->id)
            ->with(['siswa', 'penilaian'])
            ->latest()
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'siswa_id' => $s->siswa_id,
                    'siswa_nama' => $s->siswa?->name ?? '-',
                    'file_tugas' => $s->file_tugas,
                    'revisi_ke' => $s->revisi_ke,
                    'submitted_at' => $s->created_at->diffForHumans(),
                    'nilai' => $s->penilaian?->nilai,
                    'feedback' => $s->penilaian?->feedback,
                    'penilaian_id' => $s->penilaian?->id,
                ];
            });

        $siswaTotal = DB::table('siswa_kelas')
            ->join('siswa_kelas as sk2', 'siswa_kelas.kelas_id', '=', 'sk2.kelas_id')
            ->where('siswa_kelas.siswa_id', $request->user()->id)
            ->distinct('sk2.siswa_id')
            ->count();

        return Inertia::render('assessment/submissions', [
            'assessment' => [
                'id' => $assessment->id,
                'judul' => $assessment->judul,
                'materi' => $assessment->materi?->judul ?? '-',
                'deadline' => $assessment->deadline ? Carbon::parse($assessment->deadline)->format('d M Y H:i') : '-',
            ],
            'submissions' => $submissions,
            'stats' => [
                'total' => $submissions->count(),
                'dinilai' => $submissions->where('nilai', '!==', null)->count(),
                'belum_dinilai' => $submissions->where('nilai', '===', null)->count(),
            ],
        ]);
    }

    public function grade(Request $request, Tugas $assessment, PengumpulanTugas $submission)
    {
        $data = $request->validate([
            'nilai' => 'required|integer|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        PenilaianTugas::updateOrCreate(
            ['pengumpulan_id' => $submission->id],
            [
                'guru_id' => $request->user()->id,
                'nilai' => $data['nilai'],
                'feedback' => $data['feedback'] ?? null,
            ]
        );

        return redirect()->route('assessment.submissions', $assessment->id)
            ->with('success', 'Nilai berhasil disimpan.');
    }
}
