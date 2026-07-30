<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CoursePertemuan;
use App\Models\CourseSection;
use App\Models\CourseFile;
use App\Models\CourseQuiz;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        $courses = Course::with('guru')
            ->where('guru_id', auth()->id())
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'judul' => $c->judul,
                'deskripsi' => $c->deskripsi,
                'thumbnail' => $c->thumbnail ? Storage::url($c->thumbnail) : null,
                'assign_to_all' => $c->assign_to_all,
                'class_levels' => $c->class_levels,
                'pertemuan_count' => $c->pertemuan()->count(),
                'guru' => $c->guru?->name ?? '-',
                'is_active' => $c->is_active,
                'created_at' => $c->created_at->format('d M Y'),
            ]);

        $stats = [
            'total' => $courses->count(),
        ];

        return Inertia::render('course/index', [
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        $kelasOptions = Kelas::select('id', 'nama_kelas', 'tingkat')
            ->get()
            ->groupBy('tingkat')
            ->map(fn ($items, $tingkat) => [
                'tingkat' => $tingkat,
                'kelas' => $items->map(fn ($k) => ['id' => $k->id, 'nama' => $k->nama_kelas]),
            ])
            ->values();

        return Inertia::render('course/create', [
            'kelasOptions' => $kelasOptions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'assign_to_all' => 'boolean',
            'class_levels' => 'nullable|array',
            'class_levels.*' => 'string|in:10,11,12',
        ]);

        $course = new Course;
        $course->judul = $validated['judul'];
        $course->deskripsi = $validated['deskripsi'] ?? null;
        $course->assign_to_all = $validated['assign_to_all'] ?? false;
        $course->class_levels = $validated['class_levels'] ?? null;
        $course->guru_id = auth()->id();

        if ($request->hasFile('thumbnail')) {
            $course->thumbnail = $request->file('thumbnail')->store('course-thumbnails', 'public');
        }

        $course->save();

        return redirect()->route('course.index')
            ->with('success', 'Course berhasil dibuat.');
    }

    public function edit(Course $course)
    {
        $this->authorizeGuru($course);

        $kelasOptions = Kelas::select('id', 'nama_kelas', 'tingkat')
            ->get()
            ->groupBy('tingkat')
            ->map(fn ($items, $tingkat) => [
                'tingkat' => $tingkat,
                'kelas' => $items->map(fn ($k) => ['id' => $k->id, 'nama' => $k->nama_kelas]),
            ])
            ->values();

        return Inertia::render('course/edit', [
            'course' => [
                'id' => $course->id,
                'judul' => $course->judul,
                'deskripsi' => $course->deskripsi,
                'thumbnail' => $course->thumbnail ? Storage::url($course->thumbnail) : null,
                'thumbnail_raw' => $course->thumbnail,
                'assign_to_all' => $course->assign_to_all,
                'class_levels' => $course->class_levels,
            ],
            'kelasOptions' => $kelasOptions,
        ]);
    }

    public function update(Request $request, Course $course)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'assign_to_all' => 'boolean',
            'class_levels' => 'nullable|array',
            'class_levels.*' => 'string|in:10,11,12',
        ]);

        $course->judul = $validated['judul'];
        $course->deskripsi = $validated['deskripsi'] ?? null;
        $course->assign_to_all = $validated['assign_to_all'] ?? false;
        $course->class_levels = $validated['class_levels'] ?? null;

        if ($request->hasFile('thumbnail')) {
            if ($course->thumbnail) {
                Storage::disk('public')->delete($course->thumbnail);
            }
            $course->thumbnail = $request->file('thumbnail')->store('course-thumbnails', 'public');
        }

        $course->save();

        return redirect()->route('course.index')
            ->with('success', 'Course berhasil diperbarui.');
    }

    public function destroy(Course $course)
    {
        $this->authorizeGuru($course);

        if ($course->thumbnail) {
            Storage::disk('public')->delete($course->thumbnail);
        }

        $course->delete();

        return redirect()->route('course.index')
            ->with('success', 'Course berhasil dihapus.');
    }

    public function pertemuan(Course $course)
    {
        $this->authorizeGuru($course);

        $pertemuanList = $course->pertemuan()->withCount('sections', 'quiz', 'files')->get()->map(fn ($p) => [
            'id' => $p->id,
            'judul' => $p->judul,
            'deskripsi' => $p->deskripsi,
            'gambar' => $p->gambar ? Storage::url($p->gambar) : null,
            'gambar_raw' => $p->gambar,
            'urutan' => $p->urutan,
            'sections_count' => $p->sections_count,
            'quiz_count' => $p->quiz_count,
            'files_count' => $p->files_count,
        ]);

        return Inertia::render('course/pertemuan/index', [
            'course' => [
                'id' => $course->id,
                'judul' => $course->judul,
            ],
            'pertemuanList' => $pertemuanList,
        ]);
    }

    public function pertemuanCreate(Course $course)
    {
        $this->authorizeGuru($course);

        $nextUrutan = $course->pertemuan()->max('urutan') + 1;

        return Inertia::render('course/pertemuan/create', [
            'course' => ['id' => $course->id, 'judul' => $course->judul],
            'nextUrutan' => $nextUrutan,
        ]);
    }

    public function pertemuanStore(Request $request, Course $course)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'urutan' => 'required|integer|min:1',
        ]);

        $pertemuan = new CoursePertemuan;
        $pertemuan->course_id = $course->id;
        $pertemuan->judul = $validated['judul'];
        $pertemuan->deskripsi = $validated['deskripsi'] ?? null;
        $pertemuan->urutan = $validated['urutan'];

        if ($request->hasFile('gambar')) {
            $pertemuan->gambar = $request->file('gambar')->store('course-pertemuan', 'public');
        }

        $pertemuan->save();

        return redirect()->route('course.pertemuan', $course->id)
            ->with('success', 'Pertemuan berhasil ditambahkan.');
    }

    public function pertemuanEdit(Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        $sections = $pertemuan->sections()->get()->map(fn ($s) => [
            'id' => $s->id,
            'judul' => $s->judul,
            'konten' => $s->konten,
            'urutan' => $s->urutan,
        ]);

        $files = $pertemuan->files()->get()->map(fn ($f) => [
            'id' => $f->id,
            'nama_file' => $f->nama_file,
            'file_path' => Storage::url($f->file_path),
            'file_path_raw' => $f->file_path,
        ]);

        $quiz = $pertemuan->quiz()->get()->map(fn ($q) => [
            'id' => $q->id,
            'soal' => $q->soal,
            'opsi' => $q->opsi,
            'jawaban_benar' => $q->jawaban_benar,
            'urutan' => $q->urutan,
        ]);

        return Inertia::render('course/pertemuan/edit', [
            'course' => ['id' => $course->id, 'judul' => $course->judul],
            'pertemuan' => [
                'id' => $pertemuan->id,
                'judul' => $pertemuan->judul,
                'deskripsi' => $pertemuan->deskripsi,
                'gambar' => $pertemuan->gambar ? Storage::url($pertemuan->gambar) : null,
                'gambar_raw' => $pertemuan->gambar,
                'urutan' => $pertemuan->urutan,
            ],
            'sections' => $sections,
            'files' => $files,
            'quiz' => $quiz,
        ]);
    }

    public function pertemuanUpdate(Request $request, Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'urutan' => 'required|integer|min:1',
        ]);

        $pertemuan->judul = $validated['judul'];
        $pertemuan->deskripsi = $validated['deskripsi'] ?? null;
        $pertemuan->urutan = $validated['urutan'];

        if ($request->hasFile('gambar')) {
            if ($pertemuan->gambar) {
                Storage::disk('public')->delete($pertemuan->gambar);
            }
            $pertemuan->gambar = $request->file('gambar')->store('course-pertemuan', 'public');
        }

        $pertemuan->save();

        return redirect()->route('course.pertemuan', $course->id)
            ->with('success', 'Pertemuan berhasil diperbarui.');
    }

    public function pertemuanDestroy(Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        if ($pertemuan->gambar) {
            Storage::disk('public')->delete($pertemuan->gambar);
        }

        $pertemuan->delete();

        return redirect()->route('course.pertemuan', $course->id)
            ->with('success', 'Pertemuan berhasil dihapus.');
    }

    public function sectionStore(Request $request, Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'nullable|string',
        ]);

        $maxUrutan = $pertemuan->sections()->max('urutan') ?? 0;

        $section = new CourseSection;
        $section->pertemuan_id = $pertemuan->id;
        $section->judul = $validated['judul'];
        $section->konten = $validated['konten'] ?? null;
        $section->urutan = $maxUrutan + 1;
        $section->save();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'Section berhasil ditambahkan.');
    }

    public function sectionUpdate(Request $request, Course $course, CoursePertemuan $pertemuan, CourseSection $section)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'nullable|string',
        ]);

        $section->judul = $validated['judul'];
        $section->konten = $validated['konten'] ?? null;
        $section->save();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'Section berhasil diperbarui.');
    }

    public function sectionDestroy(Course $course, CoursePertemuan $pertemuan, CourseSection $section)
    {
        $this->authorizeGuru($course);

        $section->delete();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'Section berhasil dihapus.');
    }

    public function sectionReorder(Request $request, Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer|exists:course_section,id',
            'sections.*.urutan' => 'required|integer|min:1',
        ]);

        foreach ($validated['sections'] as $item) {
            CourseSection::where('id', $item['id'])
                ->where('pertemuan_id', $pertemuan->id)
                ->update(['urutan' => $item['urutan']]);
        }

        return response()->json(['success' => true]);
    }

    public function fileStore(Request $request, Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'file' => 'required|file|max:20480',
        ]);

        $fileCount = $pertemuan->files()->count();
        if ($fileCount >= 10) {
            return back()->withErrors(['file' => 'Maksimal 10 file per pertemuan.']);
        }

        $uploaded = $request->file('file');
        $path = $uploaded->store('course-files', 'public');

        $file = new CourseFile;
        $file->pertemuan_id = $pertemuan->id;
        $file->nama_file = $uploaded->getClientOriginalName();
        $file->file_path = $path;
        $file->urutan = $fileCount + 1;
        $file->save();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'File berhasil diupload.');
    }

    public function fileDestroy(Course $course, CoursePertemuan $pertemuan, CourseFile $file)
    {
        $this->authorizeGuru($course);

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'File berhasil dihapus.');
    }

    public function quizStore(Request $request, Course $course, CoursePertemuan $pertemuan)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'soal' => 'required|string',
            'opsi' => 'required|array|min:2|max:5',
            'opsi.*' => 'required|string',
            'jawaban_benar' => 'required|string',
        ]);

        $maxUrutan = $pertemuan->quiz()->max('urutan') ?? 0;

        $quiz = new CourseQuiz;
        $quiz->pertemuan_id = $pertemuan->id;
        $quiz->soal = $validated['soal'];
        $quiz->opsi = $validated['opsi'];
        $quiz->jawaban_benar = $validated['jawaban_benar'];
        $quiz->urutan = $maxUrutan + 1;
        $quiz->save();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'Soal quiz berhasil ditambahkan.');
    }

    public function quizUpdate(Request $request, Course $course, CoursePertemuan $pertemuan, CourseQuiz $quiz)
    {
        $this->authorizeGuru($course);

        $validated = $request->validate([
            'soal' => 'required|string',
            'opsi' => 'required|array|min:2|max:5',
            'opsi.*' => 'required|string',
            'jawaban_benar' => 'required|string',
        ]);

        $quiz->soal = $validated['soal'];
        $quiz->opsi = $validated['opsi'];
        $quiz->jawaban_benar = $validated['jawaban_benar'];
        $quiz->save();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'Soal quiz berhasil diperbarui.');
    }

    public function quizDestroy(Course $course, CoursePertemuan $pertemuan, CourseQuiz $quiz)
    {
        $this->authorizeGuru($course);

        $quiz->delete();

        return redirect()->route('course.pertemuan.edit', [$course->id, $pertemuan->id])
            ->with('success', 'Soal quiz berhasil dihapus.');
    }

    private function authorizeGuru(Course $course): void
    {
        if ($course->guru_id !== auth()->id() && !auth()->user()->role?->role_name === 'super_admin') {
            abort(403);
        }
    }
}
