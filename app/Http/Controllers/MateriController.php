<?php

namespace App\Http\Controllers;

use App\Models\Materi;
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
            ->latest()
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
            ]);

        $stats = [
            'total' => $materiList->count(),
        ];

        return Inertia::render('materi/index', [
            'materiList' => $materiList,
            'stats' => $stats,
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
            ]);

        return Inertia::render('materi/create', [
            'pertemuanList' => $pertemuanList,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pertemuan_id' => 'nullable|integer|exists:pertemuan,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:102400',
            'video_url' => 'nullable|string|max:255',
            'drive_link' => 'nullable|string|max:255',
        ]);

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
            ]);

        return Inertia::render('materi/edit', [
            'materi' => [
                'id' => $materi->id,
                'pertemuan_id' => $materi->pertemuan_id,
                'judul' => $materi->judul,
                'deskripsi' => $materi->deskripsi,
                'thumbnail' => $materi->thumbnail ? Storage::url($materi->thumbnail) : null,
                'video_url' => $materi->video_url,
                'pdf_file' => $materi->pdf_file ? Storage::url($materi->pdf_file) : null,
                'pdf_file_name' => $materi->pdf_file ? basename($materi->pdf_file) : null,
                'drive_link' => $materi->drive_link,
            ],
            'pertemuanList' => $pertemuanList,
        ]);
    }

    public function update(Request $request, Materi $materi)
    {
        $data = $request->validate([
            'pertemuan_id' => 'nullable|integer|exists:pertemuan,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:102400',
            'video_url' => 'nullable|string|max:255',
            'drive_link' => 'nullable|string|max:255',
        ]);

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

    public function siswa(Request $request)
    {
        $user = $request->user();

        $roadmaps = Roadmap::with(['pertemuan' => function ($query) {
            $query->where('status', 'published')->orderBy('urutan');
        }, 'pertemuan.materi.tugas.pengumpulan' => function ($q) use ($user) {
            $q->where('siswa_id', $user->id);
        }, 'pertemuan.materi.tugas.pengumpulan.penilaian'])
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
                            'tugas' => $tugasList,
                        ];
                    }),
                ]),
            ]);

        $stats = [
            'total' => Materi::count(),
            'completed' => ProgressMateri::where('siswa_id', $user->id)->where('status', 'completed')->count(),
            'in_progress' => ProgressMateri::where('siswa_id', $user->id)->where('status', 'in_progress')->count(),
        ];

        return Inertia::render('materi/siswa', [
            'roadmaps' => $roadmaps,
            'stats' => $stats,
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
