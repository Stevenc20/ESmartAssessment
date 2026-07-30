<?php

namespace App\Http\Controllers;

use App\Models\Materi;
use App\Models\MateriQuiz;
use App\Models\NotificationRead;
use App\Models\PengumpulanTugas;
use App\Models\Pertemuan;
use App\Models\ProgressMateri;
use App\Models\Roadmap;
use App\Models\Tugas;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MateriController extends Controller
{
    private function getYoutubeEmbedUrl(?string $url): ?string
    {
        if (! $url) {
            return null;
        }
        preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/', $url, $match);

        return $match ? 'https://www.youtube.com/embed/'.$match[1] : null;
    }

    public function index()
    {
        $materiList = Materi::with(['pertemuan.roadmap', 'creator'])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'judul' => $m->judul,
                'deskripsi' => $m->deskripsi,
                'thumbnail' => $m->thumbnail ? Storage::url($m->thumbnail) : null,
                'video_url' => $m->video_url,
                'video_embed_url' => $this->getYoutubeEmbedUrl($m->video_url),
                'pdf_file' => $m->pdf_file ? Storage::url($m->pdf_file) : null,
                'pdf_file_name' => $m->pdf_file ? basename($m->pdf_file) : null,
                'drive_link' => $m->drive_link,
                'pertemuan' => $m->pertemuan?->judul ?? '-',
                'roadmap' => $m->pertemuan?->roadmap?->judul ?? '-',
                'created_by' => $m->creator?->name ?? '-',
                'created_at' => $m->created_at->format('d M Y'),
                'has_quiz' => $m->quiz()->exists(),
            ]);

        $stats = ['total' => $materiList->count()];

        return Inertia::render('materi/index', [
            'materiList' => $materiList,
            'stats' => $stats,
        ]);
    }

    public function show(Materi $materi)
    {
        $materi->load(['pertemuan.roadmap', 'creator']);

        return Inertia::render('materi/show', [
            'materi' => [
                'id' => $materi->id,
                'judul' => $materi->judul,
                'deskripsi' => $materi->deskripsi,
                'thumbnail' => $materi->thumbnail ? Storage::url($materi->thumbnail) : null,
                'video_url' => $materi->video_url,
                'video_embed_url' => $this->getYoutubeEmbedUrl($materi->video_url),
                'pdf_file' => $materi->pdf_file ? Storage::url($materi->pdf_file) : null,
                'pdf_file_name' => $materi->pdf_file ? basename($materi->pdf_file) : null,
                'drive_link' => $materi->drive_link,
                'pertemuan' => $materi->pertemuan?->judul ?? '-',
                'roadmap' => $materi->pertemuan?->roadmap?->judul ?? '-',
                'created_by' => $materi->creator?->name ?? '-',
                'created_at' => $materi->created_at->format('d M Y'),
            ],
        ]);
    }

    public function create()
    {
        $pertemuanList = Pertemuan::with('roadmap')
            ->orderBy('judul')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'judul' => $p->judul.($p->roadmap ? ' ('.$p->roadmap->judul.')' : ''),
                'tingkat' => $p->roadmap?->tingkat,
            ]);

        return Inertia::render('materi/create', [
            'pertemuanList' => $pertemuanList,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->has('tingkat') && $request->tingkat === '') {
            $request->merge(['tingkat' => null]);
        }

        $data = $request->validate([
            'pertemuan_id' => 'nullable|integer|exists:pertemuan,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:102400',
            'video_url' => 'nullable|string|max:255',
            'drive_link' => 'nullable|string|max:255',
            'tingkat' => 'nullable|string|in:10,11',
        ]);

        $data['tingkat'] = $data['tingkat'] ?? null;
        if (empty($data['pertemuan_id'])) {
            $data['pertemuan_id'] = null;
        }

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        if ($request->hasFile('pdf_file')) {
            $data['pdf_file'] = $request->file('pdf_file')->store('materi-files', 'public');
        }

        $data['created_by'] = $request->user()->id;

        Materi::create($data);

        return redirect()->route('materi.index')
            ->with('success', 'Materi berhasil dibuat.');
    }

    public function edit(Materi $materi)
    {
        $pertemuanList = Pertemuan::with('roadmap')
            ->orderBy('judul')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'judul' => $p->judul.($p->roadmap ? ' ('.$p->roadmap->judul.')' : ''),
                'tingkat' => $p->roadmap?->tingkat,
            ]);

        $quiz = $materi->quiz()->get()->map(fn ($q) => [
            'id' => $q->id,
            'soal' => $q->soal,
            'opsi' => $q->opsi,
            'jawaban_benar' => $q->jawaban_benar,
            'urutan' => $q->urutan,
        ]);

        return Inertia::render('materi/edit', [
            'materi' => [
                'id' => $materi->id,
                'pertemuan_id' => $materi->pertemuan_id,
                'judul' => $materi->judul,
                'deskripsi' => $materi->deskripsi,
                'konten' => $materi->konten,
                'thumbnail' => $materi->thumbnail ? Storage::url($materi->thumbnail) : null,
                'video_url' => $materi->video_url,
                'pdf_file' => $materi->pdf_file ? Storage::url($materi->pdf_file) : null,
                'pdf_file_name' => $materi->pdf_file ? basename($materi->pdf_file) : null,
                'drive_link' => $materi->drive_link,
                'tingkat' => $materi->tingkat,
            ],
            'pertemuanList' => $pertemuanList,
            'quiz' => $quiz,
        ]);
    }

    public function update(Request $request, Materi $materi)
    {
        if ($request->has('tingkat') && $request->tingkat === '') {
            $request->merge(['tingkat' => null]);
        }

        $data = $request->validate([
            'pertemuan_id' => 'nullable|integer|exists:pertemuan,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'konten' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:102400',
            'video_url' => 'nullable|string|max:255',
            'drive_link' => 'nullable|string|max:255',
            'tingkat' => 'nullable|string|in:10,11',
        ]);

        $data['tingkat'] = $data['tingkat'] ?? null;
        if (empty($data['pertemuan_id'])) {
            $data['pertemuan_id'] = null;
        }

        if ($request->hasFile('thumbnail')) {
            if ($materi->thumbnail) {
                Storage::disk('public')->delete($materi->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        } else {
            unset($data['thumbnail']);
        }

        if ($request->hasFile('pdf_file')) {
            if ($materi->pdf_file) {
                Storage::disk('public')->delete($materi->pdf_file);
            }
            $data['pdf_file'] = $request->file('pdf_file')->store('materi-files', 'public');
        } else {
            unset($data['pdf_file']);
        }

        $materi->update($data);

        return redirect()->route('materi.index')
            ->with('success', 'Materi berhasil diperbarui.');
    }

    public function quizStore(Request $request, Materi $materi)
    {
        $validated = $request->validate([
            'soal' => 'required|string',
            'opsi' => 'required|array|min:2|max:5',
            'opsi.*' => 'required|string',
            'jawaban_benar' => 'required|string',
        ]);

        $maxUrutan = $materi->quiz()->max('urutan') ?? 0;

        MateriQuiz::create([
            'materi_id' => $materi->id,
            'soal' => $validated['soal'],
            'opsi' => $validated['opsi'],
            'jawaban_benar' => $validated['jawaban_benar'],
            'urutan' => $maxUrutan + 1,
        ]);

        return redirect()->route('materi.edit', $materi->id)
            ->with('success', 'Soal quiz berhasil ditambahkan.');
    }

    public function quizUpdate(Request $request, Materi $materi, MateriQuiz $quiz)
    {
        $validated = $request->validate([
            'soal' => 'required|string',
            'opsi' => 'required|array|min:2|max:5',
            'opsi.*' => 'required|string',
            'jawaban_benar' => 'required|string',
        ]);

        $quiz->update($validated);

        return redirect()->route('materi.edit', $materi->id)
            ->with('success', 'Soal quiz berhasil diperbarui.');
    }

    public function quizDestroy(Materi $materi, MateriQuiz $quiz)
    {
        $quiz->delete();

        return redirect()->route('materi.edit', $materi->id)
            ->with('success', 'Soal quiz berhasil dihapus.');
    }

    public function siswa(Request $request)
    {
        $user = $request->user();

        $tingkat = $user->kelas()
            ->whereNull('siswa_kelas.tanggal_keluar')
            ->first()?->tingkat
            ?? $user->kelas()->first()?->tingkat;

        $roadmaps = Roadmap::with(['pertemuan' => function ($query) {
            $query->where('status', 'published')->orderBy('urutan');
        }, 'pertemuan.materi' => function ($query) use ($tingkat) {
            if ($tingkat) {
                $query->where('tingkat', $tingkat)->orWhereNull('tingkat');
            }
        }, 'pertemuan.materi.tugas.pengumpulan' => function ($q) use ($user) {
            $q->where('siswa_id', $user->id);
        }, 'pertemuan.materi.tugas.pengumpulan.penilaian'])
            ->where(function ($q) use ($tingkat) {
                if ($tingkat) {
                    $q->where('tingkat', $tingkat)->orWhereNull('tingkat');
                }
            })
            ->orderBy('tahun', 'desc')
            ->orderBy('bulan', 'desc')
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'judul' => $r->judul,
                'bulan' => $r->bulan,
                'tahun' => $r->tahun,
                'pertemuan' => $r->pertemuan->map(fn ($p) => [
                    'id' => $p->id,
                    'judul' => $p->judul,
                    'urutan' => $p->urutan,
                    'materi' => $p->materi->map(function ($m) use ($user) {
                        $progress = $m->progress->firstWhere('siswa_id', $user->id);
                        $tugasList = $m->tugas->map(function ($t) use ($user) {
                            $submission = $t->pengumpulan
                                ->where('siswa_id', $user->id)
                                ->sortByDesc('created_at')
                                ->first();

                            $penilaian = $submission?->penilaian;
                            $deadlinePassed = $t->deadline && Carbon::parse($t->deadline)->isPast();

                            return [
                                'id' => $t->id,
                                'judul' => $t->judul,
                                'deskripsi' => $t->deskripsi,
                                'deadline' => $t->deadline ? Carbon::parse($t->deadline)->format('d M Y H:i') : null,
                                'deadline_passed' => $deadlinePassed,
                                'bobot' => $t->bobot,
                                'max_revisi' => $t->max_revisi,
                                'status' => $submission
                                    ? ($penilaian ? 'dinilai' : 'dikirim')
                                    : ($deadlinePassed ? 'terlewat' : 'tersedia'),
                                'nilai' => $penilaian?->nilai,
                                'feedback' => $penilaian?->feedback,
                                'submitted_at' => $submission?->created_at?->diffForHumans(),
                                'file_tugas' => $submission?->file_tugas ? Storage::url($submission->file_tugas) : null,
                                'revisi_ke' => $submission?->revisi_ke ?? 0,
                            ];
                        });

                        return [
                            'id' => $m->id,
                            'judul' => $m->judul,
                            'deskripsi' => $m->deskripsi,
                            'thumbnail' => $m->thumbnail ? Storage::url($m->thumbnail) : null,
                            'video_url' => $m->video_url,
                            'video_embed_url' => $this->getYoutubeEmbedUrl($m->video_url),
                            'pdf_file' => $m->pdf_file ? Storage::url($m->pdf_file) : null,
                            'pdf_file_name' => $m->pdf_file ? basename($m->pdf_file) : null,
                            'drive_link' => $m->drive_link,
                            'created_by' => $m->creator?->name ?? '-',
                            'progress_status' => $progress?->status ?? 'not_started',
                            'completed_at' => $progress?->completed_at,
                            'has_quiz' => $m->quiz()->exists(),
                            'quiz_score' => $progress?->quiz_score,
                            'quiz_attempts' => $progress?->quiz_attempts ?? 0,
                            'tugas' => $tugasList,
                        ];
                    }),
                ]),
            ]);

        $tingkatRoadmapIds = Roadmap::where(function ($q) use ($tingkat) {
            if ($tingkat) {
                $q->where('tingkat', $tingkat)->orWhereNull('tingkat');
            }
        })->pluck('id');

        $pertemuanIds = Pertemuan::whereIn('roadmap_id', $tingkatRoadmapIds)->pluck('id');
        $materiIdsByTingkat = Materi::whereIn('pertemuan_id', $pertemuanIds)
            ->where(function ($q) use ($tingkat) {
                if ($tingkat) {
                    $q->where('tingkat', $tingkat)->orWhereNull('tingkat');
                }
            })
            ->pluck('id');

        $stats = [
            'total' => $materiIdsByTingkat->count(),
            'completed' => ProgressMateri::where('siswa_id', $user->id)
                ->where('status', 'completed')
                ->whereIn('materi_id', $materiIdsByTingkat)
                ->count(),
            'in_progress' => ProgressMateri::where('siswa_id', $user->id)
                ->where('status', 'in_progress')
                ->whereIn('materi_id', $materiIdsByTingkat)
                ->count(),
        ];

        return Inertia::render('materi/siswa', [
            'roadmaps' => $roadmaps,
            'stats' => $stats,
        ]);
    }

    public function showSiswa(Materi $materi, Request $request)
    {
        $user = $request->user();

        $materi->load(['pertemuan.roadmap', 'creator', 'tugas.pengumpulan.penilaian', 'progress', 'quiz']);

        $progress = $materi->progress->firstWhere('siswa_id', $user->id);

        $tugasList = $materi->tugas->map(function ($t) use ($user) {
            $submission = $t->pengumpulan
                ->where('siswa_id', $user->id)
                ->sortByDesc('created_at')
                ->first();

            $penilaian = $submission?->penilaian;
            $deadlinePassed = $t->deadline && Carbon::parse($t->deadline)->isPast();

            return [
                'id' => $t->id,
                'judul' => $t->judul,
                'deskripsi' => $t->deskripsi,
                'deadline' => $t->deadline ? Carbon::parse($t->deadline)->format('d M Y H:i') : null,
                'deadline_passed' => $deadlinePassed,
                'bobot' => $t->bobot,
                'max_revisi' => $t->max_revisi,
                'status' => $submission
                    ? ($penilaian ? 'dinilai' : 'dikirim')
                    : ($deadlinePassed ? 'terlewat' : 'tersedia'),
                'nilai' => $penilaian?->nilai,
                'feedback' => $penilaian?->feedback,
                'submitted_at' => $submission?->created_at?->diffForHumans(),
                'file_tugas' => $submission?->file_tugas ? Storage::url($submission->file_tugas) : null,
                'revisi_ke' => $submission?->revisi_ke ?? 0,
            ];
        });

        $quizList = $materi->quiz->map(fn ($q) => [
            'id' => $q->id,
            'soal' => $q->soal,
            'opsi' => $q->opsi,
            'jawaban_benar' => $q->jawaban_benar,
            'urutan' => $q->urutan,
        ]);

        NotificationRead::updateOrCreate(
            [
                'user_id' => $user->id,
                'notifiable_type' => Materi::class,
                'notifiable_id' => $materi->id,
            ],
            ['read_at' => now()]
        );

        return Inertia::render('materi/siswa-detail', [
            'materi' => [
                'id' => $materi->id,
                'judul' => $materi->judul,
                'deskripsi' => $materi->deskripsi,
                'konten' => $materi->konten,
                'thumbnail' => $materi->thumbnail ? Storage::url($materi->thumbnail) : null,
                'video_url' => $materi->video_url,
                'video_embed_url' => $this->getYoutubeEmbedUrl($materi->video_url),
                'pdf_file' => $materi->pdf_file ? Storage::url($materi->pdf_file) : null,
                'pdf_file_name' => $materi->pdf_file ? basename($materi->pdf_file) : null,
                'drive_link' => $materi->drive_link,
                'created_by' => $materi->creator?->name ?? '-',
                'progress_status' => $progress?->status ?? 'not_started',
                'completed_at' => $progress?->completed_at,
                'quiz_score' => $progress?->quiz_score,
                'quiz_attempts' => $progress?->quiz_attempts ?? 0,
                'tugas' => $tugasList,
                'quiz' => $quizList,
            ],
            'pertemuan' => $materi->pertemuan?->judul ?? '-',
            'roadmap' => $materi->pertemuan?->roadmap?->judul ?? '-',
        ]);
    }

    public function quizSubmit(Request $request, Materi $materi)
    {
        $user = $request->user();
        $quizQuestions = $materi->quiz()->get();

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|string',
        ]);

        $progress = ProgressMateri::firstOrNew([
            'siswa_id' => $user->id,
            'materi_id' => $materi->id,
        ]);

        if ($progress->quiz_attempts >= 2) {
            return back()->withErrors(['quiz' => 'Kesempatan mengerjakan quiz sudah habis (maksimal 2x).']);
        }

        if (!$progress->status || $progress->status === 'not_started') {
            $progress->status = 'in_progress';
        }

        $correct = 0;
        $total = $quizQuestions->count();
        $results = [];

        foreach ($quizQuestions as $q) {
            $userAnswer = $validated['answers'][$q->id] ?? '';
            $isCorrect = $userAnswer === $q->jawaban_benar;
            if ($isCorrect) $correct++;
            $results[] = [
                'id' => $q->id,
                'soal' => $q->soal,
                'jawaban_benar' => $q->jawaban_benar,
                'jawaban_user' => $userAnswer,
                'benar' => $isCorrect,
            ];
        }

        $score = $total > 0 ? round(($correct / $total) * 100, 2) : 0;

        $progress->quiz_attempts += 1;
        $progress->quiz_score = max($progress->quiz_score ?? 0, $score);
        $progress->save();

        return back()->with([
            'quiz_results' => [
                'score' => $score,
                'highest_score' => $progress->quiz_score,
                'correct' => $correct,
                'total' => $total,
                'attempts' => $progress->quiz_attempts,
                'max_attempts' => 2,
            ],
            'success' => 'Quiz selesai! Nilai pengerjaan ini: ' . $score . ' (Nilai Tertinggi: ' . $progress->quiz_score . ')',
        ]);
    }

    public function submitTugas(Request $request, Tugas $tugas)
    {
        $user = $request->user();

        $request->validate([
            'file_tugas' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,rar,jpg,jpeg,png|max:102400',
        ]);

        $lastSubmission = PengumpulanTugas::where('tugas_id', $tugas->id)
            ->where('siswa_id', $user->id)
            ->latest()
            ->first();

        $revisiKe = $lastSubmission ? $lastSubmission->revisi_ke + 1 : 1;

        if ($lastSubmission && $revisiKe > ($tugas->max_revisi + 1)) {
            return back()->with('error', 'Batas revisi tugas telah habis.');
        }

        $path = $request->file('file_tugas')->store('tugas-submissions', 'public');

        PengumpulanTugas::create([
            'tugas_id' => $tugas->id,
            'siswa_id' => $user->id,
            'file_tugas' => $path,
            'revisi_ke' => $revisiKe,
            'submitted_at' => now(),
        ]);

        return back()->with('success', 'Tugas berhasil dikumpulkan.');
    }

    public function updateProgress(Request $request, Materi $materi)
    {
        $data = $request->validate([
            'status' => 'required|in:not_started,in_progress,completed',
        ]);

        ProgressMateri::updateOrCreate(
            ['siswa_id' => $request->user()->id, 'materi_id' => $materi->id],
            [
                'status' => $data['status'],
                'completed_at' => $data['status'] === 'completed' ? now() : null,
            ]
        );

        return back()->with('success', 'Progress berhasil diperbarui.');
    }

    public function uploadImage(Request $request, Materi $materi)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $path = $request->file('image')->store('konten-images', 'public');

        return response()->json(['url' => Storage::url($path)]);
    }

    public function destroy(Materi $materi)
    {
        if ($materi->thumbnail) {
            Storage::disk('public')->delete($materi->thumbnail);
        }

        if ($materi->pdf_file) {
            Storage::disk('public')->delete($materi->pdf_file);
        }

        $materi->delete();

        return redirect()->route('materi.index')
            ->with('success', 'Materi berhasil dihapus.');
    }
}
