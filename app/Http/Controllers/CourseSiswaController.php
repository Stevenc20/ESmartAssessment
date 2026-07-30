<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CoursePertemuan;
use App\Models\CourseProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CourseSiswaController extends Controller
{
    public function index()
    {
        $siswa = auth()->user();
        $kelasSiswa = $siswa->kelas()->first();

        $courses = Course::with('guru')
            ->where('is_active', true)
            ->get()
            ->filter(function ($course) use ($kelasSiswa) {
                if ($course->assign_to_all) return true;
                if (!$kelasSiswa) return false;
                $levels = $course->class_levels ?? [];
                return in_array($kelasSiswa->tingkat, $levels);
            })
            ->values()
            ->map(fn ($c) => [
                'id' => $c->id,
                'judul' => $c->judul,
                'deskripsi' => $c->deskripsi,
                'thumbnail' => $c->thumbnail ? Storage::url($c->thumbnail) : null,
                'guru' => $c->guru?->name ?? '-',
                'pertemuan_count' => $c->pertemuan()->count(),
                'created_at' => $c->created_at->format('d M Y'),
            ]);

        $stats = [
            'total' => $courses->count(),
        ];

        return Inertia::render('course/siswa/index', [
            'courses' => $courses,
            'stats' => $stats,
        ]);
    }

    public function show(Course $course)
    {
        if (!$course->is_active) {
            abort(404);
        }

        $siswa = auth()->user();
        $this->authorizeAccess($course, $siswa);

        $pertemuanList = $course->pertemuan()->withCount('sections', 'quiz')->get()->map(function ($p) use ($siswa) {
            $progress = CourseProgress::where('siswa_id', $siswa->id)
                ->where('pertemuan_id', $p->id)
                ->first();

            return [
                'id' => $p->id,
                'judul' => $p->judul,
                'deskripsi' => $p->deskripsi,
                'gambar' => $p->gambar ? Storage::url($p->gambar) : null,
                'urutan' => $p->urutan,
                'sections_count' => $p->sections_count,
                'quiz_count' => $p->quiz_count,
                'completed' => $progress?->completed_at !== null,
                'quiz_score' => $progress?->quiz_score,
                'quiz_attempts' => $progress?->quiz_attempts ?? 0,
            ];
        });

        $progress = CourseProgress::where('siswa_id', $siswa->id)
            ->whereIn('pertemuan_id', $course->pertemuan()->pluck('id'))
            ->get();

        $stats = [
            'total' => $pertemuanList->count(),
            'completed' => $progress->where('completed_at', '!==', null)->count(),
        ];

        return Inertia::render('course/siswa/show', [
            'course' => [
                'id' => $course->id,
                'judul' => $course->judul,
                'deskripsi' => $course->deskripsi,
                'thumbnail' => $course->thumbnail ? Storage::url($course->thumbnail) : null,
            ],
            'pertemuanList' => $pertemuanList,
            'stats' => $stats,
        ]);
    }

    public function pertemuan(Course $course, CoursePertemuan $pertemuan)
    {
        if (!$course->is_active) {
            abort(404);
        }

        $siswa = auth()->user();
        $this->authorizeAccess($course, $siswa);

        if ($pertemuan->course_id !== $course->id) {
            abort(404);
        }

        $sections = $pertemuan->sections()->get()->map(fn ($s) => [
            'id' => $s->id,
            'judul' => $s->judul,
            'konten' => $s->konten,
            'urutan' => $s->urutan,
        ]);

        $quiz = $pertemuan->quiz()->get()->map(fn ($q) => [
            'id' => $q->id,
            'soal' => $q->soal,
            'opsi' => $q->opsi,
            'jawaban_benar' => $q->jawaban_benar,
            'urutan' => $q->urutan,
        ]);

        $files = $pertemuan->files()->get()->map(fn ($f) => [
            'id' => $f->id,
            'nama_file' => $f->nama_file,
            'file_path' => Storage::url($f->file_path),
        ]);

        $progress = CourseProgress::where('siswa_id', $siswa->id)
            ->where('pertemuan_id', $pertemuan->id)
            ->first();

        return Inertia::render('course/siswa/pertemuan', [
            'course' => [
                'id' => $course->id,
                'judul' => $course->judul,
            ],
            'pertemuan' => [
                'id' => $pertemuan->id,
                'judul' => $pertemuan->judul,
                'deskripsi' => $pertemuan->deskripsi,
                'urutan' => $pertemuan->urutan,
            ],
            'sections' => $sections,
            'quiz' => $quiz,
            'files' => $files,
            'progress' => $progress ? [
                'completed_at' => $progress->completed_at,
                'quiz_score' => $progress->quiz_score,
                'quiz_attempts' => $progress->quiz_attempts,
            ] : null,
        ]);
    }

    public function quizSubmit(Request $request, Course $course, CoursePertemuan $pertemuan)
    {
        if (!$course->is_active) {
            abort(404);
        }

        $siswa = auth()->user();
        $this->authorizeAccess($course, $siswa);

        if ($pertemuan->course_id !== $course->id) {
            abort(404);
        }

        $quizQuestions = $pertemuan->quiz()->get();

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'required|string',
        ]);

        $progress = CourseProgress::firstOrNew([
            'siswa_id' => $siswa->id,
            'pertemuan_id' => $pertemuan->id,
        ]);

        if ($progress->quiz_attempts >= 2) {
            return back()->withErrors(['quiz' => 'Kesempatan mengerjakan quiz sudah habis (maksimal 2x).']);
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
        $progress->quiz_score = $score;
        $progress->save();

        return back()->with([
            'quiz_results' => [
                'score' => $score,
                'correct' => $correct,
                'total' => $total,
                'attempts' => $progress->quiz_attempts,
                'max_attempts' => 2,
                'details' => $results,
            ],
            'success' => 'Quiz selesai! Nilai: ' . $score,
        ]);
    }

    public function markComplete(Course $course, CoursePertemuan $pertemuan)
    {
        if (!$course->is_active) {
            abort(404);
        }

        $siswa = auth()->user();
        $this->authorizeAccess($course, $siswa);

        if ($pertemuan->course_id !== $course->id) {
            abort(404);
        }

        $progress = CourseProgress::firstOrNew([
            'siswa_id' => $siswa->id,
            'pertemuan_id' => $pertemuan->id,
        ]);

        $progress->completed_at = now();
        $progress->save();

        return back()->with('success', 'Pertemuan selesai!');
    }

    private function authorizeAccess(Course $course, $siswa): void
    {
        $kelasSiswa = $siswa->kelas()->first();

        if ($course->assign_to_all) return;
        if (!$kelasSiswa) abort(403);

        $levels = $course->class_levels ?? [];
        if (!in_array($kelasSiswa->tingkat, $levels)) {
            abort(403);
        }
    }
}
