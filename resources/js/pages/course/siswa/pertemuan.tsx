import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Download,
    FileText,
    GraduationCap,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type CourseData = { id: number; judul: string };

type PertemuanData = {
    id: number;
    judul: string;
    deskripsi: string | null;
    urutan: number;
};

type SectionData = {
    id: number;
    judul: string;
    konten: string | null;
    urutan: number;
};

type QuizData = {
    id: number;
    soal: string;
    opsi: string[];
    jawaban_benar: string;
    urutan: number;
};

type FileData = {
    id: number;
    nama_file: string;
    file_path: string;
};

type ProgressData = {
    completed_at: string | null;
    quiz_score: number | null;
    quiz_attempts: number;
} | null;

type QuizResults = {
    score: number;
    correct: number;
    total: number;
    attempts: number;
    max_attempts: number;
    details: {
        id: number;
        soal: string;
        jawaban_benar: string;
        jawaban_user: string;
        benar: boolean;
    }[];
};

const BRAND = {
    blue: '#436391',
    blueDeep: '#2d4a6e',
    pink: '#F2AEBC',
};

export default function PertemuanSiswa({
    course,
    pertemuan,
    sections,
    quiz,
    files,
    progress,
}: {
    course: CourseData;
    pertemuan: PertemuanData;
    sections: SectionData[];
    quiz: QuizData[];
    files: FileData[];
    progress: ProgressData;
}) {
    const { errors, quiz_results } = usePage<{
        errors: Record<string, string>;
        quiz_results?: QuizResults;
    }>().props;

    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [showQuiz, setShowQuiz] = useState(false);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [completing, setCompleting] = useState(false);

    const hasSections = sections.length > 0;
    const currentSection = hasSections ? sections[currentSectionIdx] : null;
    const isLastSection = currentSectionIdx === sections.length - 1;

    const isCompleted = progress?.completed_at !== null;

    const allQuizAnswered = quiz.every((q) => answers[q.id]);

    const OPSI_LABEL = ['A', 'B', 'C', 'D', 'E'];

    function goToSection(idx: number) {
        setCurrentSectionIdx(idx);
        setShowQuiz(false);
    }

    function handleQuizSubmit() {
        if (!allQuizAnswered || submittingQuiz) return;
        setSubmittingQuiz(true);

        router.post(
            `/materi-saya/${course.id}/${pertemuan.id}/quiz`,
            { answers },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowResults(true);
                },
                onFinish: () => setSubmittingQuiz(false),
            },
        );
    }

    function handleMarkComplete() {
        setCompleting(true);
        router.post(
            `/materi-saya/${course.id}/${pertemuan.id}/selesai`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['progress'] });
                },
                onFinish: () => setCompleting(false),
            },
        );
    }

    const results = (quiz_results || progress) as QuizResults | ProgressData;

    return (
        <>
            <Head title={`${pertemuan.judul} - ${course.judul}`} />

            <div className="flex h-full flex-1 flex-col p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
                    {/* Top nav */}
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/materi-saya/${course.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {course.judul}
                        </Link>
                        {isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Selesai
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">
                            Pertemuan {pertemuan.urutan}: {pertemuan.judul}
                        </h1>
                        {pertemuan.deskripsi && (
                            <p className="mt-1 text-sm text-slate-500">{pertemuan.deskripsi}</p>
                        )}
                    </div>

                    {/* Section indicator */}
                    {hasSections && !showQuiz && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>
                                Section {currentSectionIdx + 1} dari {sections.length}
                            </span>
                            <Select
                                value={String(currentSectionIdx)}
                                onValueChange={(v) => goToSection(Number(v))}
                            >
                                <SelectTrigger className="h-7 w-auto border-0 bg-transparent p-0 text-xs font-semibold text-blue-600 shadow-none hover:underline">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((s, i) => (
                                        <SelectItem key={s.id} value={String(i)}>
                                            {s.judul}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* Content */}
                    {!showQuiz ? (
                        <div className="flex flex-col gap-6">
                            {/* Section content */}
                            {currentSection && (
                                <div className="rounded-xl border border-slate-200 bg-white p-6">
                                    <h2 className="mb-4 text-lg font-bold text-slate-900">
                                        {currentSection.judul}
                                    </h2>
                                    <div
                                        className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-blue-600 prose-img:rounded-lg prose-img:my-2 prose-img:max-w-full"
                                        dangerouslySetInnerHTML={{
                                            __html: currentSection.konten ?? '',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Files */}
                            {files.length > 0 && (
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                    <h3 className="mb-3 text-sm font-bold text-slate-700">
                                        File Lampiran
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {files.map((f) => (
                                            <a
                                                key={f.id}
                                                href={f.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                                {f.nama_file}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section nav + Quiz / Complete */}
                            <div className="flex items-center justify-between">
                                <div>
                                    {currentSectionIdx > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => goToSection(currentSectionIdx - 1)}
                                            className="inline-flex items-center gap-1"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Sebelumnya
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {isLastSection ? (
                                        quiz.length > 0 ? (
                                            <Button
                                                onClick={() => setShowQuiz(true)}
                                                className="bg-purple-600 text-white hover:bg-purple-700"
                                            >
                                                Kerjakan Quiz
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            !isCompleted && (
                                                <Button
                                                    onClick={handleMarkComplete}
                                                    disabled={completing}
                                                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {completing ? 'Menyimpan...' : 'Tandai Selesai'}
                                                </Button>
                                            )
                                        )
                                    ) : (
                                        <Button
                                            onClick={() => goToSection(currentSectionIdx + 1)}
                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Quiz Section ── */
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowQuiz(false)}
                                >
                                    <ChevronLeft className="h-4 w-4" /> Kembali
                                </Button>
                                <h2 className="text-lg font-bold text-slate-900">Quiz</h2>
                            </div>

                            {/* Quiz Results Dialog */}
                            <Dialog
                                open={showResults}
                                onOpenChange={(o) => {
                                    if (!o) setShowResults(false);
                                }}
                            >
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Hasil Quiz</DialogTitle>
                                        <DialogDescription>
                                            {results && 'score' in results
                                                ? `Nilai: ${results.score} (${results.correct}/${results.total} benar)`
                                                : ''}
                                        </DialogDescription>
                                    </DialogHeader>
                                    {'details' in (results || {}) && (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {(results as QuizResults).details.map((d) => (
                                                <div
                                                    key={d.id}
                                                    className={`rounded-lg border p-3 text-sm ${
                                                        d.benar
                                                            ? 'border-emerald-200 bg-emerald-50'
                                                            : 'border-red-200 bg-red-50'
                                                    }`}
                                                >
                                                    <p className="font-semibold text-slate-900">
                                                        {d.soal}
                                                    </p>
                                                    <p className="mt-1 text-slate-600">
                                                        Jawabanmu:{' '}
                                                        <span
                                                            className={
                                                                d.benar
                                                                    ? 'text-emerald-700 font-semibold'
                                                                    : 'text-red-700 font-semibold'
                                                            }
                                                        >
                                                            {d.jawaban_user}
                                                        </span>
                                                    </p>
                                                    {!d.benar && (
                                                        <p className="text-emerald-700">
                                                            Jawaban benar: {d.jawaban_benar}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => {
                                                setShowResults(false);
                                                setShowQuiz(false);
                                                router.reload({ only: ['progress', 'quiz_results'] });
                                            }}
                                        >
                                            Tutup
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Attempt info */}
                            {(results && 'attempts' in results) || progress ? (
                                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                                    {(results && 'score' in results
                                        ? (results as QuizResults).attempts
                                        : progress?.quiz_attempts ?? 0) > 0 && (
                                        <p>
                                            Kamu sudah mengerjakan quiz ini{' '}
                                            {(results && 'score' in results
                                                ? (results as QuizResults).attempts
                                                : progress?.quiz_attempts ?? 0)}{' '}
                                            kali (maksimal 2x).
                                            {'score' in (results || {})
                                                ? ` Nilai terakhir: ${(results as QuizResults).score}`
                                                : progress?.quiz_score !== null
                                                  ? ` Nilai: ${progress?.quiz_score}`
                                                  : ''}
                                        </p>
                                    )}
                                </div>
                            ) : null}

                            {(!progress ||
                                (progress.quiz_attempts < 2 && !isCompleted)) && (
                                <div className="space-y-6">
                                    {quiz.map((q, idx) => (
                                        <div
                                            key={q.id}
                                            className="rounded-xl border border-slate-200 bg-white p-5"
                                        >
                                            <p className="mb-3 text-sm font-semibold text-slate-900">
                                                {idx + 1}. {q.soal}
                                            </p>
                                            <div className="space-y-2">
                                                {q.opsi.map((o, oi) => {
                                                    const label = OPSI_LABEL[oi];
                                                    return (
                                                        <label
                                                            key={oi}
                                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                                                answers[q.id] === label
                                                                    ? 'border-blue-300 bg-blue-50'
                                                                    : 'border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q_${q.id}`}
                                                                value={label}
                                                                checked={answers[q.id] === label}
                                                                onChange={() =>
                                                                    setAnswers((prev) => ({
                                                                        ...prev,
                                                                        [q.id]: label,
                                                                    }))
                                                                }
                                                                className="h-4 w-4 text-blue-600"
                                                            />
                                                            <span className="text-sm text-slate-700">
                                                                {label}. {o}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            {Object.keys(answers).length} dari {quiz.length} soal
                                            terjawab
                                        </span>
                                        <Button
                                            onClick={handleQuizSubmit}
                                            disabled={!allQuizAnswered || submittingQuiz}
                                            className="bg-purple-600 text-white hover:bg-purple-700"
                                        >
                                            {submittingQuiz ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!showResults &&
                                progress &&
                                (progress.quiz_attempts >= 2 || isCompleted) && (
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleMarkComplete}
                                            disabled={completing || isCompleted}
                                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {isCompleted
                                                ? 'Selesai'
                                                : completing
                                                  ? 'Menyimpan...'
                                                  : 'Tandai Selesai'}
                                        </Button>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PertemuanSiswa.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
        { title: 'Belajar', href: '#' },
    ],
};
