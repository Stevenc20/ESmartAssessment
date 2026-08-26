<?php

namespace App\Http\Controllers;

use App\Models\Absensi;
use App\Models\Kelas;
use App\Models\Materi;
use App\Models\MateriDiscussion;
use App\Models\MateriFile;
use App\Models\MateriFolder;
use App\Models\MateriPoll;
use App\Models\MateriPollOption;
use App\Models\MateriPollVote;
use App\Models\MateriQuiz;
use App\Models\NotificationRead;
use App\Models\PengumpulanTugas;
use App\Models\Pertemuan;
use App\Models\ProgressMateri;
use App\Models\Roadmap;
use App\Models\Tugas;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use ZipArchive;

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

    private function folderData(MateriFolder $folder): array
    {
        return [
            'id' => $folder->id,
            'nama' => $folder->nama,
            'file_count' => $folder->file_count,
            'total_size' => $folder->total_size,
            'download_url' => route('materi.folder.download', $folder->id),
        ];
    }

    private function fileData(MateriFile $file): array
    {
        return [
            'id' => $file->id,
            'nama' => $file->nama,
            'size' => $file->size,
            'download_url' => route('materi.file.download', $file->id),
        ];
    }

    private function storeFolderUploads(Materi $materi, Request $request): void
    {
        foreach ($request->input('folders', []) as $idx => $folderData) {
            $files = $request->file("folders.$idx.files") ?? [];
            $names = $request->input("folders.$idx.names") ?? [];
            $nama = trim($folderData['nama'] ?? '');

            if ($nama === '' || empty($files)) {
                continue;
            }

            $folder = MateriFolder::create([
                'materi_id' => $materi->id,
                'nama' => $nama,
                'file_count' => 0,
                'total_size' => 0,
            ]);

            $totalSize = 0;
            $count = 0;

            foreach ($files as $k => $file) {
                $relative = $names[$k] ?? $file->getClientOriginalName();
                $relative = ltrim((string) str_replace(['\\', '..'], ['/', ''], $relative), '/');

                if ($relative === '') {
                    continue;
                }

                if ($file->storeAs("materi-folders/{$folder->id}", $relative, 'public')) {
                    $totalSize += $file->getSize();
                    $count++;
                }
            }

            $folder->update(['file_count' => $count, 'total_size' => $totalSize]);
        }
    }

    private function storeFileUploads(Materi $materi, Request $request): void
    {
        foreach ($request->file('files', []) as $file) {
            $nama = $file->getClientOriginalName();

            if ($nama === '') {
                continue;
            }

            $path = $file->storeAs("materi-files/{$materi->id}/".Str::uuid(), $nama, 'public');

            if ($path) {
                MateriFile::create([
                    'materi_id' => $materi->id,
                    'nama' => $nama,
                    'path' => $path,
                    'size' => $file->getSize(),
                ]);
            }
        }
    }

    private function sanitizeZipName(string $name): string
    {
        $clean = preg_replace('/[\\\\\/:*?"<>|]+/', '-', $name);

        return trim($clean, " \t\n\r\0\x0B.");
    }

    public function index()
    {
        $liveMeetingIds = \App\Models\LiveSession::where('status', 'live')->pluck('pertemuan_id')->toArray();

        $materiList = Materi::with([
            'pertemuan.roadmap',
            'creator',
            'folders',
            'files',
            'linkedMateri.pertemuan.roadmap',
            'linkedMateri.creator',
            'linkedMateri.folders',
            'linkedMateri.files',
        ])
            ->orderBy('created_at')
            ->get()
            ->map(function ($m) use ($liveMeetingIds) {
                $src = $m->source();

                return [
                    'id' => $m->id,
                    'judul' => $m->judul,
                    'deskripsi' => $src->deskripsi,
                    'thumbnail' => $src->thumbnail ? Storage::url($src->thumbnail) : null,
                    'video_url' => $src->video_url,
                    'video_embed_url' => $this->getYoutubeEmbedUrl($src->video_url),
                    'pdf_file' => $src->pdf_file ? Storage::url($src->pdf_file) : null,
                    'pdf_file_name' => $src->pdf_file ? basename($src->pdf_file) : null,
                    'drive_link' => $src->drive_link,
                    'folders' => $src->folders->map(fn ($f) => $this->folderData($f))->values(),
                    'folder_count' => $src->folders->count(),
                    'files' => $src->files->map(fn ($f) => $this->fileData($f))->values(),
                    'file_count' => $src->files->count(),
                    'pertemuan' => $m->pertemuan?->judul ?? '-',
                    'roadmap' => $m->pertemuan?->roadmap?->judul ?? '-',
                    'created_by' => $m->creator?->name ?? '-',
                    'created_at' => $m->created_at->format('d M Y'),
                    'has_quiz' => $src->quiz()->exists(),
                    'linked_to' => $m->isLink() ? [
                        'id' => $src->id,
                        'judul' => $src->judul,
                        'pertemuan' => $src->pertemuan?->judul ?? '-',
                        'roadmap' => $src->pertemuan?->roadmap?->judul ?? '-',
                    ] : null,
                    'is_live' => $m->pertemuan_id ? in_array($m->pertemuan_id, $liveMeetingIds) : false,
                ];
            });

        $stats = ['total' => $materiList->count()];

        return Inertia::render('materi/index', [
            'materiList' => $materiList,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, Materi $materi)
    {
        $materi->load([
            'pertemuan.roadmap',
            'creator',
            'folders',
            'files',
            'discussions.user',
            'discussions.replies.user',
            'linkedMateri.pertemuan.roadmap',
            'linkedMateri.creator',
            'linkedMateri.folders',
            'linkedMateri.files',
            'linkedMateri.discussions.user',
            'linkedMateri.discussions.replies.user',
        ]);

        $src = $materi->source();

        $activeSession = $materi->pertemuan_id
            ? \App\Models\LiveSession::where('pertemuan_id', $materi->pertemuan_id)->where('status', 'live')->with('host')->first()
            : null;

        $liveSessionData = $activeSession ? [
            'id' => $activeSession->id,
            'room_name' => $activeSession->room_name,
            'meet_url' => $activeSession->meet_url,
            'host_id' => $activeSession->host_id,
            'host_name' => $activeSession->host?->name ?? 'Guru',
            'status' => $activeSession->status,
            'started_at' => $activeSession->started_at?->toIso8601String(),
        ] : null;

        return Inertia::render('materi/show', [
            'materi' => [
                'id' => $materi->id,
                'pertemuan_id' => $materi->pertemuan_id,
                'judul' => $materi->judul,
                'deskripsi' => $src->deskripsi,
                'thumbnail' => $src->thumbnail ? Storage::url($src->thumbnail) : null,
                'video_url' => $src->video_url,
                'video_embed_url' => $this->getYoutubeEmbedUrl($src->video_url),
                'pdf_file' => $src->pdf_file ? Storage::url($src->pdf_file) : null,
                'pdf_file_name' => $src->pdf_file ? basename($src->pdf_file) : null,
                'drive_link' => $src->drive_link,
                'folders' => $src->folders->map(fn ($f) => $this->folderData($f))->values(),
                'files' => $src->files->map(fn ($f) => $this->fileData($f))->values(),
                'pertemuan' => $materi->pertemuan?->judul ?? '-',
                'roadmap' => $materi->pertemuan?->roadmap?->judul ?? '-',
                'created_by' => $materi->creator?->name ?? '-',
                'created_at' => $materi->created_at->format('d M Y'),
                'linked_to' => $materi->isLink() ? [
                    'id' => $src->id,
                    'judul' => $src->judul,
                    'pertemuan' => $src->pertemuan?->judul ?? '-',
                    'roadmap' => $src->pertemuan?->roadmap?->judul ?? '-',
                ] : null,
                'discussions' => $this->discussionData($src, $request->user()),
                'live_session' => $liveSessionData,
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

        $materiList = Materi::with('pertemuan.roadmap')
            ->whereNull('linked_materi_id')
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'judul' => $m->judul,
                'pertemuan' => $m->pertemuan?->judul ?? '-',
                'roadmap' => $m->pertemuan?->roadmap?->judul ?? '-',
                'tingkat' => $m->tingkat,
            ]);

        return Inertia::render('materi/create', [
            'pertemuanList' => $pertemuanList,
            'materiList' => $materiList,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->has('tingkat') && $request->tingkat === '') {
            $request->merge(['tingkat' => null]);
        }

        $data = $request->validate([
            'pertemuan_id' => 'nullable|integer|exists:pertemuan,id',
            'linked_materi_id' => 'nullable|integer|exists:materi,id',
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:102400',
            'pdf_file' => 'nullable|file|mimes:pdf,doc,docx,ppt,pptx,xls,xlsx|max:102400',
            'video_url' => 'nullable|string|max:255',
            'drive_link' => 'nullable|string|max:255',
            'tingkat' => 'nullable|string|in:10,11',
            'folders' => 'nullable|array',
            'folders.*.nama' => 'required|string|max:255',
            'folders.*.files' => 'required|array|max:200',
            'folders.*.files.*' => 'file|max:51200',
            'folders.*.names' => 'nullable|array',
            'folders.*.names.*' => 'nullable|string|max:1024',
            'files' => 'nullable|array|max:20',
            'files.*' => 'file|max:51200',
        ]);

        $data['tingkat'] = $data['tingkat'] ?? null;
        if (empty($data['pertemuan_id'])) {
            $data['pertemuan_id'] = null;
        }

        if (! empty($data['linked_materi_id'])) {
            $source = Materi::with(['folders', 'files', 'quiz', 'tugas', 'poll.options'])->findOrFail($data['linked_materi_id']);

            if ($source->isLink()) {
                return back()->withErrors([
                    'linked_materi_id' => 'Materi sumber tidak dapat berupa materi yang sudah menautkan materi lain.',
                ])->withInput();
            }

            if (! $data['pertemuan_id']) {
                return back()->withErrors([
                    'pertemuan_id' => 'Pilih pertemuan untuk materi tautan.',
                ])->withInput();
            }

            $cloneMode = $request->input('clone_mode') == '1';

            if ($cloneMode) {
                // Copy Materi Data
                $materi = Materi::create([
                    'pertemuan_id' => $data['pertemuan_id'],
                    'linked_materi_id' => null, // Standalone clone
                    'judul' => $data['judul'],
                    'deskripsi' => $source->deskripsi,
                    'konten' => $source->konten,
                    'video_url' => $source->video_url,
                    'video_embed_url' => $source->video_embed_url,
                    'drive_link' => $source->drive_link,
                    'tingkat' => $data['tingkat'] ?? $source->tingkat,
                    'created_by' => $request->user()->id,
                ]);

                // Copy files in storage
                if ($source->thumbnail && \Illuminate\Support\Facades\Storage::disk('public')->exists($source->thumbnail)) {
                    $ext = pathinfo($source->thumbnail, PATHINFO_EXTENSION);
                    $newThumb = 'thumbnails/' . \Illuminate\Support\Str::random(40) . '.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->copy($source->thumbnail, $newThumb);
                    $materi->update(['thumbnail' => $newThumb]);
                }

                if ($source->pdf_file && \Illuminate\Support\Facades\Storage::disk('public')->exists($source->pdf_file)) {
                    $ext = pathinfo($source->pdf_file, PATHINFO_EXTENSION);
                    $newPdf = 'materi-files/' . \Illuminate\Support\Str::random(40) . '.' . $ext;
                    \Illuminate\Support\Facades\Storage::disk('public')->copy($source->pdf_file, $newPdf);
                    $materi->update(['pdf_file' => $newPdf]);
                }

                // Copy single files (MateriFile)
                foreach ($source->files as $file) {
                    $newPath = "materi-files/{$materi->id}/" . \Illuminate\Support\Str::uuid() . '/' . basename($file->path);
                    if (\Illuminate\Support\Facades\Storage::disk('public')->exists($file->path)) {
                        \Illuminate\Support\Facades\Storage::disk('public')->copy($file->path, $newPath);
                    }
                    \App\Models\MateriFile::create([
                        'materi_id' => $materi->id,
                        'nama' => $file->nama,
                        'path' => $newPath,
                        'size' => $file->size,
                    ]);
                }

                // Copy folders
                foreach ($source->folders as $folder) {
                    $newFolder = \App\Models\MateriFolder::create([
                        'materi_id' => $materi->id,
                        'nama' => $folder->nama,
                        'file_count' => $folder->file_count,
                        'total_size' => $folder->total_size,
                    ]);
                    
                    $oldPath = "materi-folders/{$folder->id}";
                    $newPath = "materi-folders/{$newFolder->id}";
                    
                    if (\Illuminate\Support\Facades\Storage::disk('public')->exists($oldPath)) {
                        \Illuminate\Support\Facades\File::copyDirectory(
                            \Illuminate\Support\Facades\Storage::disk('public')->path($oldPath),
                            \Illuminate\Support\Facades\Storage::disk('public')->path($newPath)
                        );
                    }
                }

                // Copy Poll
                if ($source->poll) {
                    $poll = \App\Models\MateriPoll::create([
                        'materi_id' => $materi->id,
                        'pertanyaan' => $source->poll->pertanyaan,
                        'is_active' => $source->poll->is_active,
                    ]);
                    foreach ($source->poll->options as $option) {
                        \App\Models\MateriPollOption::create([
                            'poll_id' => $poll->id,
                            'opsi_text' => $option->opsi_text,
                            'urutan' => $option->urutan,
                        ]);
                    }
                }

                // Copy Quiz
                if ($request->input('include_quiz') == '1') {
                    foreach ($source->quiz as $quiz) {
                        $newQuizGambar = null;
                        if ($quiz->gambar && \Illuminate\Support\Facades\Storage::disk('public')->exists($quiz->gambar)) {
                            $ext = pathinfo($quiz->gambar, PATHINFO_EXTENSION);
                            $newQuizGambar = 'quiz-images/' . \Illuminate\Support\Str::random(40) . '.' . $ext;
                            \Illuminate\Support\Facades\Storage::disk('public')->copy($quiz->gambar, $newQuizGambar);
                        }

                        \App\Models\MateriQuiz::create([
                            'materi_id' => $materi->id,
                            'soal' => $quiz->soal,
                            'gambar' => $newQuizGambar,
                            'opsi' => $quiz->opsi,
                            'jawaban_benar' => $quiz->jawaban_benar,
                            'urutan' => $quiz->urutan,
                        ]);
                    }
                }

                // Copy Tugas
                if ($request->input('include_tugas') == '1') {
                    foreach ($source->tugas as $tugas) {
                        \App\Models\Tugas::create([
                            'materi_id' => $materi->id,
                            'judul' => $tugas->judul,
                            'deskripsi' => $tugas->deskripsi,
                            'deadline' => null, // Reset deadline for new task
                            'bobot' => $tugas->bobot,
                            'max_revisi' => $tugas->max_revisi,
                            'is_active' => $tugas->is_active,
                        ]);
                    }
                }

                return redirect()->route('materi.index')
                    ->with('success', 'Materi berhasil disalin/diduplikasi.');
            }

            // Fallback: Default Link Mode
            Materi::create([
                'pertemuan_id' => $data['pertemuan_id'],
                'linked_materi_id' => $source->id,
                'judul' => $data['judul'],
                'tingkat' => $data['tingkat'] ?? $source->tingkat,
                'created_by' => $request->user()->id,
            ]);

            return redirect()->route('materi.index')
                ->with('success', 'Materi berhasil ditautkan.');
        }

        $data['linked_materi_id'] = null;

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        if ($request->hasFile('pdf_file')) {
            $data['pdf_file'] = $request->file('pdf_file')->store('materi-files', 'public');
        }

        $data['created_by'] = $request->user()->id;

        $materi = Materi::create($data);

        $this->storeFolderUploads($materi, $request);
        $this->storeFileUploads($materi, $request);

        if ($request->filled('poll_pertanyaan') && is_array($request->input('poll_opsi'))) {
            $poll = MateriPoll::create([
                'materi_id' => $materi->id,
                'pertanyaan' => $request->input('poll_pertanyaan'),
                'is_active' => true,
            ]);

            foreach ($request->input('poll_opsi') as $idx => $opsiText) {
                if (! empty(trim($opsiText))) {
                    MateriPollOption::create([
                        'poll_id' => $poll->id,
                        'opsi_text' => trim($opsiText),
                        'urutan' => $idx + 1,
                    ]);
                }
            }
        }

        return redirect()->route('materi.index')
            ->with('success', 'Materi berhasil dibuat.');
    }

    public function edit(Materi $materi)
    {
        if ($materi->isLink()) {
            return redirect()->route('materi.index')
                ->with('error', 'Materi ini menautkan materi lain. Ubah konten pada materi sumber.');
        }

        $materi->load(['poll.options', 'folders', 'files']);

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
            'gambar' => $q->gambar ? Storage::url($q->gambar) : null,
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
                'folders' => $materi->folders->map(fn ($f) => $this->folderData($f))->values(),
                'files' => $materi->files->map(fn ($f) => $this->fileData($f))->values(),
                'poll_pertanyaan' => $materi->poll?->pertanyaan ?? '',
                'poll_opsi' => $materi->poll ? $materi->poll->options->pluck('opsi_text')->toArray() : ['', ''],
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
            'folders' => 'nullable|array',
            'folders.*.nama' => 'required|string|max:255',
            'folders.*.files' => 'required|array|max:200',
            'folders.*.files.*' => 'file|max:51200',
            'folders.*.names' => 'nullable|array',
            'folders.*.names.*' => 'nullable|string|max:1024',
            'files' => 'nullable|array|max:20',
            'files.*' => 'file|max:51200',
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

        $this->storeFolderUploads($materi, $request);
        $this->storeFileUploads($materi, $request);

        if ($request->filled('poll_pertanyaan') && is_array($request->input('poll_opsi'))) {
            $poll = MateriPoll::updateOrCreate(
                ['materi_id' => $materi->id],
                ['pertanyaan' => $request->input('poll_pertanyaan'), 'is_active' => true]
            );

            $poll->options()->delete();
            foreach ($request->input('poll_opsi') as $idx => $opsiText) {
                if (! empty(trim($opsiText))) {
                    MateriPollOption::create([
                        'poll_id' => $poll->id,
                        'opsi_text' => trim($opsiText),
                        'urutan' => $idx + 1,
                    ]);
                }
            }
        }

        return redirect()->route('materi.index')
            ->with('success', 'Materi berhasil diperbarui.');
    }

    public function downloadFolder(MateriFolder $folder)
    {
        $disk = Storage::disk('public');
        $base = "materi-folders/{$folder->id}";
        $files = $disk->allFiles($base);

        if (empty($files)) {
            return back()->with('error', 'Folder ini kosong atau tidak ditemukan.');
        }

        $zipName = $this->sanitizeZipName($folder->nama).'.zip';
        $prefix = $folder->nama.'/';

        return response()->streamDownload(function () use ($disk, $files, $base, $prefix) {
            $zip = new ZipArchive;
            $zip->open('php://output', ZipArchive::CREATE);

            foreach ($files as $file) {
                $relative = substr($file, strlen($base) + 1);
                $zip->addFromString($prefix.$relative, $disk->get($file));
            }

            $zip->close();
        }, $zipName, ['Content-Type' => 'application/zip']);
    }

    public function deleteFolder(MateriFolder $folder)
    {
        Storage::disk('public')->deleteDirectory("materi-folders/{$folder->id}");
        $folder->delete();

        return back()->with('success', 'Folder berhasil dihapus.');
    }

    public function downloadFile(MateriFile $file)
    {
        $disk = Storage::disk('public');

        if (! $disk->exists($file->path)) {
            return back()->with('error', 'File tidak ditemukan.');
        }

        return $disk->download($file->path, $file->nama);
    }

    public function deleteFile(MateriFile $file)
    {
        Storage::disk('public')->delete($file->path);
        $file->delete();

        return back()->with('success', 'File berhasil dihapus.');
    }

    public function quizStore(Request $request, Materi $materi)
    {
        $validated = $request->validate([
            'soal' => 'required|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'opsi' => 'required|array|min:2|max:5',
            'opsi.*' => 'required|string',
            'jawaban_benar' => 'required|string',
        ]);

        $maxUrutan = $materi->quiz()->max('urutan') ?? 0;

        $gambarPath = null;
        if ($request->hasFile('gambar')) {
            $gambarPath = $request->file('gambar')->store('quiz-images', 'public');
        }

        MateriQuiz::create([
            'materi_id' => $materi->id,
            'soal' => $validated['soal'],
            'gambar' => $gambarPath,
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
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'opsi' => 'required|array|min:2|max:5',
            'opsi.*' => 'required|string',
            'jawaban_benar' => 'required|string',
            'remove_gambar' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_gambar') && $quiz->gambar) {
            Storage::disk('public')->delete($quiz->gambar);
            $validated['gambar'] = null;
        } elseif ($request->hasFile('gambar')) {
            if ($quiz->gambar) {
                Storage::disk('public')->delete($quiz->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('quiz-images', 'public');
        } else {
            unset($validated['gambar']);
        }

        $quiz->update($validated);

        return redirect()->route('materi.edit', $materi->id)
            ->with('success', 'Soal quiz berhasil diperbarui.');
    }

    public function quizDestroy(Materi $materi, MateriQuiz $quiz)
    {
        if ($quiz->gambar) {
            Storage::disk('public')->delete($quiz->gambar);
        }
        $quiz->delete();

        return redirect()->route('materi.edit', $materi->id)
            ->with('success', 'Soal quiz berhasil dihapus.');
    }

    public function batchStoreQuiz(Request $request, Materi $materi)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.soal' => 'required|string',
            'items.*.opsi' => 'required|array|min:2|max:5',
            'items.*.opsi.*' => 'required|string',
            'items.*.jawaban_benar' => 'required|string',
        ]);

        $maxUrutan = $materi->quiz()->max('urutan') ?? 0;

        foreach ($validated['items'] as $idx => $item) {
            MateriQuiz::create([
                'materi_id' => $materi->id,
                'soal' => $item['soal'],
                'opsi' => $item['opsi'],
                'jawaban_benar' => $item['jawaban_benar'],
                'urutan' => $maxUrutan + $idx + 1,
            ]);
        }

        return redirect()->route('materi.edit', $materi->id)
            ->with('success', count($validated['items']).' soal quiz berhasil diimpor.');
    }

    public function siswa(Request $request)
    {
        $user = $request->user();

        $tingkat = $user->kelas()
            ->whereNull('siswa_kelas.tanggal_keluar')
            ->first()?->tingkat
            ?? $user->kelas()->first()?->tingkat;

        $roadmaps = Roadmap::with(['pertemuan' => function ($query) {
            $query->whereIn('status', ['published', 'completed'])->orderBy('urutan');
        }, 'pertemuan.materi' => function ($query) use ($tingkat) {
            if ($tingkat) {
                $query->where('tingkat', $tingkat)->orWhereNull('tingkat');
            }
        }, 'pertemuan.materi.folders', 'pertemuan.materi.files', 'pertemuan.materi.tugas.pengumpulan' => function ($q) use ($user) {
            $q->where('siswa_id', $user->id);
        }, 'pertemuan.materi.tugas.pengumpulan.penilaian', 'pertemuan.materi.linkedMateri.folders', 'pertemuan.materi.linkedMateri.files', 'pertemuan.materi.linkedMateri.tugas.pengumpulan' => function ($q) use ($user) {
            $q->where('siswa_id', $user->id);
        }, 'pertemuan.materi.linkedMateri.tugas.pengumpulan.penilaian'])
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
                        $src = $m->source();
                        $progress = $m->progress->firstWhere('siswa_id', $user->id);
                        $tugasList = $src->tugas->map(function ($t) use ($user) {
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
                            'deskripsi' => $src->deskripsi,
                            'thumbnail' => $src->thumbnail ? Storage::url($src->thumbnail) : null,
                            'video_url' => $src->video_url,
                            'video_embed_url' => $this->getYoutubeEmbedUrl($src->video_url),
                            'pdf_file' => $src->pdf_file ? Storage::url($src->pdf_file) : null,
                            'pdf_file_name' => $src->pdf_file ? basename($src->pdf_file) : null,
                            'drive_link' => $src->drive_link,
                            'folders' => $src->folders->map(fn ($f) => $this->folderData($f))->values(),
                            'files' => $src->files->map(fn ($f) => $this->fileData($f))->values(),
                            'created_by' => $src->creator?->name ?? '-',
                            'progress_status' => $progress?->status ?? 'not_started',
                            'completed_at' => $progress?->completed_at,
                            'has_quiz' => $src->quiz()->exists(),
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

        $pertemuanIds = Pertemuan::whereIn('roadmap_id', $tingkatRoadmapIds)
            ->whereIn('status', ['published', 'completed'])
            ->pluck('id');
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

        $materi->load([
            'pertemuan.roadmap',
            'creator',
            'tugas.pengumpulan.penilaian',
            'progress',
            'quiz',
            'folders',
            'files',
            'linkedMateri.tugas.pengumpulan.penilaian',
            'linkedMateri.quiz',
            'linkedMateri.folders',
            'linkedMateri.files',
        ]);

        $src = $materi->source();

        $progress = $materi->progress->firstWhere('siswa_id', $user->id);

        $tugasList = $src->tugas->map(function ($t) use ($user) {
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

        $quizList = $src->quiz->map(fn ($q) => [
            'id' => $q->id,
            'soal' => $q->soal,
            'gambar' => $q->gambar ? Storage::url($q->gambar) : null,
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

        $src->load(['poll.options.votes', 'discussions.user', 'discussions.replies.user']);

        $pollData = null;
        if ($src->poll) {
            $poll = $src->poll;
            $totalVotes = $poll->votes()->count();
            $myVoteOptionId = $poll->votes()->where('siswa_id', $user->id)->first()?->option_id;

            $optionsData = $poll->options->map(function ($opt) use ($totalVotes) {
                $count = $opt->votes->count();
                $percentage = $totalVotes > 0 ? round(($count / $totalVotes) * 100, 1) : 0;

                return [
                    'id' => $opt->id,
                    'opsi_text' => $opt->opsi_text,
                    'vote_count' => $count,
                    'percentage' => $percentage,
                ];
            });

            $pollData = [
                'id' => $poll->id,
                'pertanyaan' => $poll->pertanyaan,
                'is_active' => (bool) $poll->is_active,
                'options' => $optionsData,
                'total_votes' => $totalVotes,
                'my_vote_option_id' => $myVoteOptionId,
            ];
        }

        $discussionsData = $this->discussionData($src, $user);

        $activeSession = $materi->pertemuan_id
            ? \App\Models\LiveSession::where('pertemuan_id', $materi->pertemuan_id)->where('status', 'live')->with('host')->first()
            : null;

        $liveSessionData = $activeSession ? [
            'id' => $activeSession->id,
            'room_name' => $activeSession->room_name,
            'meet_url' => $activeSession->meet_url,
            'host_id' => $activeSession->host_id,
            'host_name' => $activeSession->host?->name ?? 'Guru',
            'status' => $activeSession->status,
            'started_at' => $activeSession->started_at?->toIso8601String(),
        ] : null;

        return Inertia::render('materi/siswa-detail', [
            'materi' => [
                'id' => $materi->id,
                'pertemuan_id' => $materi->pertemuan_id,
                'judul' => $materi->judul,
                'deskripsi' => $src->deskripsi,
                'konten' => $src->konten,
                'thumbnail' => $src->thumbnail ? Storage::url($src->thumbnail) : null,
                'video_url' => $src->video_url,
                'video_embed_url' => $this->getYoutubeEmbedUrl($src->video_url),
                'pdf_file' => $src->pdf_file ? Storage::url($src->pdf_file) : null,
                'pdf_file_name' => $src->pdf_file ? basename($src->pdf_file) : null,
                'drive_link' => $src->drive_link,
                'folders' => $src->folders->map(fn ($f) => $this->folderData($f))->values(),
                'files' => $src->files->map(fn ($f) => $this->fileData($f))->values(),
                'created_by' => $src->creator?->name ?? '-',
                'progress_status' => $progress?->status ?? 'not_started',
                'completed_at' => $progress?->completed_at,
                'quiz_score' => $progress?->quiz_score,
                'quiz_attempts' => $progress?->quiz_attempts ?? 0,
                'tugas' => $tugasList,
                'quiz' => $quizList,
                'poll' => $pollData,
                'discussions' => $discussionsData,
                'live_session' => $liveSessionData,
                'linked_to' => $materi->isLink() ? [
                    'id' => $src->id,
                    'judul' => $src->judul,
                    'pertemuan' => $src->pertemuan?->judul ?? '-',
                    'roadmap' => $src->pertemuan?->roadmap?->judul ?? '-',
                ] : null,
            ],
            'pertemuan' => $materi->pertemuan?->judul ?? '-',
            'roadmap' => $materi->pertemuan?->roadmap?->judul ?? '-',
        ]);
    }

    public function votePoll(Request $request, Materi $materi)
    {
        $user = $request->user();
        $poll = $materi->source()->poll;

        if (! $poll || ! $poll->is_active) {
            return back()->with('error', 'Polling tidak aktif.');
        }

        $validated = $request->validate([
            'option_id' => 'required|exists:materi_poll_options,id',
        ]);

        MateriPollVote::updateOrCreate(
            ['poll_id' => $poll->id, 'siswa_id' => $user->id],
            ['option_id' => $validated['option_id']]
        );

        return back()->with('success', 'Vote Anda berhasil dikirim.');
    }

    public function storeDiscussion(Request $request, Materi $materi)
    {
        $user = $request->user();

        $validated = $request->validate([
            'pesan' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:materi_discussions,id',
        ]);

        MateriDiscussion::create([
            'materi_id' => $materi->source()->id,
            'user_id' => $user->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'pesan' => $validated['pesan'],
        ]);

        return back()->with('success', 'Pesan diskusi berhasil dikirim.');
    }

    public function deleteDiscussion(MateriDiscussion $discussion)
    {
        $user = auth()->user();

        if ($discussion->user_id !== $user->id && $user->role?->role_name === 'siswa') {
            abort(403, 'Unauthorized action.');
        }

        $discussion->delete();

        return back()->with('success', 'Pesan diskusi berhasil dihapus.');
    }

    private function discussionData(Materi $materi, $user)
    {
        return $materi->discussions->map(function ($d) use ($user) {
            return [
                'id' => $d->id,
                'user_id' => $d->user_id,
                'user_name' => $d->user?->name ?? 'User',
                'user_role' => $d->user?->role?->role_name ?? 'siswa',
                'user_avatar' => $d->user?->avatar,
                'pesan' => $d->pesan,
                'created_at' => $d->created_at->diffForHumans(),
                'is_mine' => $d->user_id === $user->id,
                'replies' => $d->replies->map(fn ($r) => [
                    'id' => $r->id,
                    'user_id' => $r->user_id,
                    'user_name' => $r->user?->name ?? 'User',
                    'user_role' => $r->user?->role?->role_name ?? 'siswa',
                    'user_avatar' => $r->user?->avatar,
                    'pesan' => $r->pesan,
                    'created_at' => $r->created_at->diffForHumans(),
                    'is_mine' => $r->user_id === $user->id,
                ]),
            ];
        });
    }

    public function quizSubmit(Request $request, Materi $materi)
    {
        $user = $request->user();
        $quizQuestions = $materi->source()->quiz()->get();

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

        if (! $progress->status || $progress->status === 'not_started') {
            $progress->status = 'in_progress';
        }

        $correct = 0;
        $total = $quizQuestions->count();
        $results = [];

        foreach ($quizQuestions as $q) {
            $userAnswer = $validated['answers'][$q->id] ?? '';
            $isCorrect = $userAnswer === $q->jawaban_benar;
            if ($isCorrect) {
                $correct++;
            }
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

        $newBadges = app(\App\Services\BadgeService::class)->evaluateForStudent($user);
        if (! empty($newBadges)) {
            session()->flash('new_badges', $newBadges);
        }

        return back()->with([
            'quiz_results' => [
                'score' => $score,
                'highest_score' => $progress->quiz_score,
                'correct' => $correct,
                'total' => $total,
                'attempts' => $progress->quiz_attempts,
                'max_attempts' => 2,
            ],
            'success' => 'Quiz selesai! Nilai pengerjaan ini: '.$score.' (Nilai Tertinggi: '.$progress->quiz_score.')',
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
            ->orderByDesc('revisi_ke')
            ->first();

        $revisiKe = $lastSubmission ? $lastSubmission->revisi_ke + 1 : 1;

        if ($tugas->max_revisi > 0 && $revisiKe > $tugas->max_revisi + 1) {
            return back()->with('error', 'Batas maksimum pengiriman/revisi tugas sudah tercapai.');
        }

        $path = $request->file('file_tugas')->store('tugas-submissions', 'public');

        PengumpulanTugas::create([
            'tugas_id' => $tugas->id,
            'siswa_id' => $user->id,
            'file_tugas' => $path,
            'revisi_ke' => $revisiKe,
            'submitted_at' => now(),
        ]);

        $newBadges = app(\App\Services\BadgeService::class)->evaluateForStudent($user);
        if (! empty($newBadges)) {
            session()->flash('new_badges', $newBadges);
        }

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

        $newBadges = app(\App\Services\BadgeService::class)->evaluateForStudent($request->user());
        if (! empty($newBadges)) {
            session()->flash('new_badges', $newBadges);
        }

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

    public function penilaianIndex(Request $request)
    {
        $pertemuanList = Pertemuan::with(['roadmap', 'materi.quiz', 'materi.tugas', 'materi.linkedMateri.quiz', 'materi.linkedMateri.tugas'])
            ->get()
            ->sortBy(function ($p) {
                return sprintf('%04d-%02d-%04d', $p->roadmap->tahun ?? 0, $p->roadmap->bulan ?? 0, $p->urutan);
            })
            ->values();

        $query = User::whereHas('role', function ($q) {
            $q->where('role_name', 'siswa');
        })->with(['progressMateri', 'pengumpulanTugas.penilaian']);

        if ($request->filled('kelas_id')) {
            $kelasFilter = $request->kelas_id;
            $query->where(function ($q) use ($kelasFilter) {
                $q->where('kelas', $kelasFilter)
                    ->orWhereHas('kelas', function ($k) use ($kelasFilter) {
                        $k->where('kelas.id', $kelasFilter);
                    });
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('jurusan', 'like', "%{$search}%");
            });
        }

        $students = $query->get();

        $matrix = $students->map(function ($siswa) use ($pertemuanList) {
            $kelasObj = $siswa->kelas()
                ->whereNull('siswa_kelas.tanggal_keluar')
                ->first() ?? $siswa->kelas()->latest('siswa_kelas.tanggal_masuk')->first();
            $kelasId = $kelasObj?->id;
            $namaKelas = $kelasObj?->nama_kelas;
            if (! $namaKelas && is_string($siswa->kelas) && ! empty($siswa->kelas)) {
                $namaKelas = $siswa->kelas;
            }

            $jurusan = $siswa->jurusan ?? '-';

            $pertemuanScores = [];
            $totalScoreSum = 0;
            $countEvaluated = 0;

            foreach ($pertemuanList as $p) {
                $materiList = $p->materi;
                $materiIds = $materiList->pluck('id');
                $srcMateri = $materiList->map(fn ($m) => $m->source());

                $quizScores = ProgressMateri::where('siswa_id', $siswa->id)
                    ->whereIn('materi_id', $materiIds)
                    ->whereNotNull('quiz_score')
                    ->pluck('quiz_score');

                $maxQuizScore = $quizScores->isNotEmpty() ? round($quizScores->max(), 2) : null;

                $tugasIds = $srcMateri->flatMap(fn ($m) => $m->tugas)->pluck('id');
                $tugasNilai = PengumpulanTugas::where('siswa_id', $siswa->id)
                    ->whereIn('tugas_id', $tugasIds)
                    ->whereHas('penilaian')
                    ->get()
                    ->map(fn ($ts) => $ts->penilaian?->nilai)
                    ->filter(fn ($v) => $v !== null);

                $avgTugasScore = $tugasNilai->isNotEmpty() ? round($tugasNilai->avg(), 2) : null;

                $combinedScore = null;
                if ($maxQuizScore !== null && $avgTugasScore !== null) {
                    $combinedScore = round(($maxQuizScore + $avgTugasScore) / 2, 2);
                } elseif ($maxQuizScore !== null) {
                    $combinedScore = $maxQuizScore;
                } elseif ($avgTugasScore !== null) {
                    $combinedScore = $avgTugasScore;
                }

                if ($combinedScore !== null) {
                    $totalScoreSum += $combinedScore;
                    $countEvaluated++;
                }

                $pertemuanScores[$p->id] = [
                    'pertemuan_id' => $p->id,
                    'pertemuan_judul' => $p->judul,
                    'quiz_score' => $maxQuizScore,
                    'tugas_score' => $avgTugasScore,
                    'combined_score' => $combinedScore,
                ];
            }

            $overallAvg = $countEvaluated > 0 ? round($totalScoreSum / $countEvaluated, 2) : 0;

            return [
                'id' => $siswa->id,
                'nama' => $siswa->name,
                'email' => $siswa->email,
                'no_hp' => $siswa->no_hp ?? '-',
                'foto' => $siswa->foto ? Storage::url($siswa->foto) : null,
                'kelas' => $namaKelas,
                'kelas_id' => $kelasId,
                'jurusan' => $jurusan,
                'status' => $siswa->status ?? 'active',
                'created_at' => $siswa->created_at ? $siswa->created_at->format('d M Y H:i') : '-',
                'pertemuan_scores' => $pertemuanScores,
                'rata_rata' => $overallAvg,
            ];
        });

        $kelasList = Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas']);

        return Inertia::render('materi/penilaian', [
            'pertemuanList' => $pertemuanList->map(fn ($p) => [
                'id' => $p->id,
                'judul' => $p->judul,
                'urutan' => $p->urutan,
                'roadmap_judul' => $p->roadmap->judul ?? '',
                'roadmap_bulan' => $p->roadmap->bulan ?? null,
                'roadmap_tahun' => $p->roadmap->tahun ?? null,
            ]),
            'students' => $matrix,
            'kelasList' => $kelasList,
            'filters' => $request->only(['kelas_id', 'search']),
        ]);
    }

    public function updateSiswaBiodata(Request $request, User $siswa)
    {
        abort_unless(in_array($request->user()->role?->role_name, ['guru', 'admin'], true), 403);

        $validated = $request->validate([
            'kelas_id' => 'required|integer|exists:kelas,id',
            'jurusan' => 'required|string|max:255',
        ]);

        $kelas = Kelas::find($validated['kelas_id']);

        $siswa->update([
            'kelas' => $kelas->tingkat,
            'jurusan' => $validated['jurusan'],
        ]);

        $active = $siswa->kelas()
            ->whereNull('siswa_kelas.tanggal_keluar')
            ->first();

        if ($active) {
            if ($active->id !== $kelas->id) {
                $siswa->kelas()->updateExistingPivot($active->id, ['tanggal_keluar' => now()->toDateString()]);
                $siswa->kelas()->attach($kelas->id, ['tanggal_masuk' => now()->toDateString()]);
            }
        } else {
            $siswa->kelas()->attach($kelas->id, ['tanggal_masuk' => now()->toDateString()]);
        }

        return back()->with('success', 'Biodata '.$siswa->name.' berhasil diperbarui.');
    }

    public function penilaianExport(Request $request)
    {
        $pertemuanList = Pertemuan::with(['roadmap', 'materi.tugas', 'materi.linkedMateri.tugas'])
            ->get()
            ->sortBy(function ($p) {
                return sprintf('%04d-%02d-%04d', $p->roadmap->tahun ?? 0, $p->roadmap->bulan ?? 0, $p->urutan);
            })
            ->values();

        $query = User::whereHas('role', function ($q) {
            $q->where('role_name', 'siswa');
        })->with(['progressMateri', 'pengumpulanTugas.penilaian']);

        if ($request->filled('kelas_id')) {
            $kelasFilter = $request->kelas_id;
            $query->where(function ($q) use ($kelasFilter) {
                $q->where('kelas', $kelasFilter)
                    ->orWhereHas('kelas', function ($k) use ($kelasFilter) {
                        $k->where('kelas.id', $kelasFilter);
                    });
            });
        }

        $students = $query->get();

        $filename = 'rekap_penilaian_siswa_'.date('Y-m-d_H-i-s').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ];

        $callback = function () use ($students, $pertemuanList) {
            $file = fopen('php://output', 'w');

            fwrite($file, "\xEF\xBB\xBF");

            $columns = ['No', 'Nama Siswa', 'Email', 'No. HP', 'Kelas', 'Jurusan'];
            foreach ($pertemuanList as $p) {
                $roadmapStr = $p->roadmap ? $p->roadmap->judul.' ' : '';
                $columns[] = $roadmapStr . 'P' . $p->urutan . ' (Quiz)';
                $columns[] = $roadmapStr . 'P' . $p->urutan . ' (Tugas)';
                $columns[] = $roadmapStr . 'P' . $p->urutan . ' (Akhir)';
            }
            $columns[] = 'Rata-Rata Akhir';

            fputcsv($file, $columns);

            $no = 1;
            foreach ($students as $siswa) {
                $namaKelas = '-';
                if (is_string($siswa->kelas) && ! empty($siswa->kelas)) {
                    $namaKelas = $siswa->kelas;
                } elseif (method_exists($siswa, 'kelas')) {
                    $kelasObj = $siswa->kelas()->first();
                    if ($kelasObj) {
                        $namaKelas = $kelasObj->nama_kelas;
                    }
                }

                $jurusan = $siswa->jurusan ?? '-';
                $noHp = $siswa->no_hp ?? '-';

                $row = [$no++, $siswa->name, $siswa->email, $noHp, $namaKelas, $jurusan];
                $totalScoreSum = 0;
                $countEvaluated = 0;

                foreach ($pertemuanList as $p) {
                    $materiList = $p->materi;
                    $materiIds = $materiList->pluck('id');
                    $srcMateri = $materiList->map(fn ($m) => $m->source());

                    $quizScores = ProgressMateri::where('siswa_id', $siswa->id)
                        ->whereIn('materi_id', $materiIds)
                        ->whereNotNull('quiz_score')
                        ->pluck('quiz_score');

                    $maxQuizScore = $quizScores->isNotEmpty() ? round($quizScores->max(), 2) : '-';

                    $tugasIds = $srcMateri->flatMap(fn ($m) => $m->tugas)->pluck('id');
                    $tugasNilai = PengumpulanTugas::where('siswa_id', $siswa->id)
                        ->whereIn('tugas_id', $tugasIds)
                        ->whereHas('penilaian')
                        ->get()
                        ->map(fn ($ts) => $ts->penilaian?->nilai)
                        ->filter(fn ($v) => $v !== null);

                    $avgTugasScore = $tugasNilai->isNotEmpty() ? round($tugasNilai->avg(), 2) : '-';

                    $combinedScore = '-';
                    $numericQuiz = is_numeric($maxQuizScore) ? (float) $maxQuizScore : null;
                    $numericTugas = is_numeric($avgTugasScore) ? (float) $avgTugasScore : null;

                    if ($numericQuiz !== null && $numericTugas !== null) {
                        $combinedScore = round(($numericQuiz + $numericTugas) / 2, 2);
                    } elseif ($numericQuiz !== null) {
                        $combinedScore = $numericQuiz;
                    } elseif ($numericTugas !== null) {
                        $combinedScore = $numericTugas;
                    }

                    if (is_numeric($combinedScore)) {
                        $totalScoreSum += (float) $combinedScore;
                        $countEvaluated++;
                    }

                    $row[] = $maxQuizScore;
                    $row[] = $avgTugasScore;
                    $row[] = $combinedScore;
                }

                $row[] = $countEvaluated > 0 ? round($totalScoreSum / $countEvaluated, 2) : '0';

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function nilaiSiswaIndex(Request $request)
    {
        $siswa = $request->user();
        $siswaId = $siswa->id;

        $pertemuanList = Pertemuan::whereIn('status', ['published', 'completed'])
            ->with(['roadmap', 'materi.quiz', 'materi.tugas', 'materi.linkedMateri.quiz', 'materi.linkedMateri.tugas'])
            ->orderBy('urutan')
            ->get();

        $absensiRecords = Absensi::where('siswa_id', $siswaId)->get()->keyBy('pertemuan_id');

        $pertemuanProgress = [];
        $totalScoreSum = 0;
        $countEvaluated = 0;
        $completedQuizzesCount = 0;
        $submittedTasksCount = 0;

        foreach ($pertemuanList as $p) {
            $materiList = $p->materi;
            $materiIds = $materiList->pluck('id');
            $srcMateri = $materiList->map(fn ($m) => $m->source());

            $progressRecords = ProgressMateri::where('siswa_id', $siswaId)
                ->whereIn('materi_id', $materiIds)
                ->get();

            $quizScores = $progressRecords->pluck('quiz_score')->filter(fn ($v) => $v !== null);
            $maxQuizScore = $quizScores->isNotEmpty() ? round($quizScores->max(), 2) : null;
            $totalAttempts = $progressRecords->sum('quiz_attempts');

            if ($maxQuizScore !== null) {
                $completedQuizzesCount++;
            }

            $tugasIds = $srcMateri->flatMap(fn ($m) => $m->tugas)->pluck('id');
            $pengumpulanList = PengumpulanTugas::where('siswa_id', $siswaId)
                ->whereIn('tugas_id', $tugasIds)
                ->with('penilaian')
                ->get();

            $tugasNilai = $pengumpulanList->map(fn ($ts) => $ts->penilaian?->nilai)->filter(fn ($v) => $v !== null);
            $avgTugasScore = $tugasNilai->isNotEmpty() ? round($tugasNilai->avg(), 2) : null;

            if ($pengumpulanList->isNotEmpty()) {
                $submittedTasksCount++;
            }

            $combinedScore = null;
            if ($maxQuizScore !== null && $avgTugasScore !== null) {
                $combinedScore = round(($maxQuizScore + $avgTugasScore) / 2, 2);
            } elseif ($maxQuizScore !== null) {
                $combinedScore = $maxQuizScore;
            } elseif ($avgTugasScore !== null) {
                $combinedScore = $avgTugasScore;
            }

            if ($combinedScore !== null) {
                $totalScoreSum += $combinedScore;
                $countEvaluated++;
            }

            $abs = $absensiRecords->get($p->id);
            $absStatus = $abs ? $abs->status : 'alpa';

            $pertemuanProgress[] = [
                'pertemuan_id' => $p->id,
                'pertemuan_judul' => $p->judul,
                'roadmap_judul' => $p->roadmap?->judul ?? '-',
                'absensi_status' => $absStatus,
                'quiz_score' => $maxQuizScore,
                'quiz_attempts' => $totalAttempts,
                'tugas_score' => $avgTugasScore,
                'tugas_submitted' => $pengumpulanList->isNotEmpty(),
                'combined_score' => $combinedScore,
            ];
        }

        $overallAvg = $countEvaluated > 0 ? round($totalScoreSum / $countEvaluated, 2) : 0;

        return Inertia::render('materi/nilai-saya', [
            'stats' => [
                'overall_avg' => $overallAvg,
                'total_pertemuan' => $pertemuanList->count(),
                'completed_quizzes' => $completedQuizzesCount,
                'submitted_tasks' => $submittedTasksCount,
            ],
            'pertemuanProgress' => $pertemuanProgress,
        ]);
    }

    public function destroy(Materi $materi)
    {
        $linkedCount = Materi::where('linked_materi_id', $materi->id)->count();

        if ($linkedCount > 0) {
            return redirect()->route('materi.index')
                ->with('error', "Materi ini ditautkan oleh {$linkedCount} materi lain. Putuskan tautan terlebih dahulu.");
        }

        if ($materi->thumbnail) {
            Storage::disk('public')->delete($materi->thumbnail);
        }

        if ($materi->pdf_file) {
            Storage::disk('public')->delete($materi->pdf_file);
        }

        foreach ($materi->folders as $folder) {
            Storage::disk('public')->deleteDirectory("materi-folders/{$folder->id}");
        }

        foreach ($materi->files as $file) {
            Storage::disk('public')->delete($file->path);
        }

        $materi->delete();

        return redirect()->route('materi.index')
            ->with('success', 'Materi berhasil dihapus.');
    }
}
