import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Circle,
    Clock,
    Download,
    ExternalLink,
    FileText,
    Folder,
    HelpCircle,
    PlayCircle,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

import MateriForumChat, { type DiscussionItem } from '@/components/materi/materi-forum-chat';
import MateriPollWidget, { type PollData } from '@/components/materi/materi-poll-widget';

/* ── Types ── */
type QuizItem = {
    id: number;
    soal: string;
    gambar?: string | null;
    opsi: string[];
    jawaban_benar: string;
    urutan: number;
};

type QuizResultDetail = {
    id: number;
    soal: string;
    jawaban_benar: string;
    jawaban_user: string;
    benar: boolean;
};

type QuizResults = {
    score: number;
    correct: number;
    total: number;
    attempts: number;
    max_attempts: number;
    details: QuizResultDetail[];
};

type TugasItem = {
    id: number;
    judul: string;
    deskripsi: string | null;
    deadline: string | null;
    deadline_passed: boolean;
    bobot: number;
    max_revisi: number;
    status: 'tersedia' | 'dikirim' | 'dinilai' | 'terlewat';
    nilai: number | null;
    feedback: string | null;
    submitted_at: string | null;
    file_tugas: string | null;
    revisi_ke: number;
};

type FolderItem = {
    id: number;
    nama: string;
    file_count: number;
    total_size: number;
    download_url: string;
};

type FileItem = {
    id: number;
    nama: string;
    size: number;
    download_url: string;
};

import LiveScreenCard from '@/components/materi/live-screen-card';
import LiveScreenViewerModal from '@/components/materi/live-screen-viewer-modal';

type MateriDetail = {
    id: number;
    pertemuan_id?: number | null;
    judul: string;
    deskripsi: string | null;
    konten: string | null;
    thumbnail: string | null;
    video_url: string | null;
    video_embed_url: string | null;
    pdf_file: string | null;
    pdf_file_name: string | null;
    drive_link: string | null;
    folders: FolderItem[];
    files: FileItem[];
    created_by: string;
    progress_status: 'not_started' | 'in_progress' | 'completed';
    completed_at: string | null;
    quiz_score: number | null;
    quiz_attempts: number;
    quiz: QuizItem[];
    tugas: TugasItem[];
    poll: PollData | null;
    discussions: DiscussionItem[];
    live_session?: any;
};

/* ── Config ── */
const BRAND = {
    blue: '#436391',
    blueDeep: '#2d4a6e',
    blueLight: '#6B8ABF',
    pink: '#F2AEBC',
    pinkDeep: '#e8889a',
    surface: '#F2DCDB',
};

const progressConfig = {
    not_started: {
        icon: Circle,
        label: 'Belum Dimulai',
        color: '#94a3b8',
        bg: '#f1f5f9',
        btn: 'Mulai Belajar',
        next: 'in_progress' as const,
    },
    in_progress: {
        icon: PlayCircle,
        label: 'Sedang Dipelajari',
        color: BRAND.blue,
        bg: '#eef3f9',
        btn: 'Tandai Selesai',
        next: 'completed' as const,
    },
    completed: {
        icon: CheckCircle2,
        label: 'Selesai',
        color: '#059669',
        bg: '#ecfdf5',
        btn: null,
        next: null,
    },
};

const tugasStatusConfig = {
    tersedia: { label: 'Tersedia', color: '#436391', bg: '#eef3f9' },
    dikirim: { label: 'Dikirim', color: '#d97706', bg: '#fffbeb' },
    dinilai: { label: 'Dinilai', color: '#059669', bg: '#ecfdf5' },
    terlewat: { label: 'Terlewat', color: '#dc2626', bg: '#fef2f2' },
};

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/* ── Tugas Card ── */
function TugasCard({ tugas }: { tugas: TugasItem }) {
    const { data, setData, post, processing, errors } = useForm({
        file_tugas: null as File | null,
    });
    const fileRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const cfg = tugasStatusConfig[tugas.status];

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('file_tugas', file);
        setFileName(file?.name ?? null);
    }

    function submitTugas() {
        if (!data.file_tugas) return;

        post(`/materi-saya/tugas/${tugas.id}/submit`, {
            preserveScroll: true,
            forceFormData: true,
            only: ['flash'],
            onProgress: (progress) => setUploadProgress(progress?.percentage ?? 0),
            onSuccess: () => {
                setFileName(null);
                setData('file_tugas', null);
                setUploadProgress(0);
                if (fileRef.current) fileRef.current.value = '';
            },
            onFinish: () => setUploadProgress(0),
        });
    }

    const canSubmit =
        tugas.status === 'tersedia' ||
        (tugas.status === 'dikirim' && tugas.revisi_ke < tugas.max_revisi);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                            {tugas.judul}
                        </p>
                        <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{ background: cfg.bg, color: cfg.color }}
                        >
                            {cfg.label}
                        </span>
                    </div>

                    {tugas.deskripsi && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            {tugas.deskripsi}
                        </p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-400">
                        {tugas.deadline && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Deadline: {tugas.deadline}
                            </span>
                        )}
                        <span>Bobot: {tugas.bobot}</span>
                        <span>Maks. Revisi: {tugas.max_revisi}</span>
                        {tugas.revisi_ke > 0 && (
                            <span>Revisi ke-{tugas.revisi_ke}</span>
                        )}
                    </div>
                </div>

                {tugas.nilai != null && (
                    <div className="flex shrink-0 flex-col items-center">
                        <span className="text-lg font-bold text-emerald-600">
                            {tugas.nilai}
                        </span>
                        <span className="text-[10px] text-slate-400">Nilai</span>
                    </div>
                )}
            </div>

            {tugas.feedback && (
                <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold">Feedback: </span>
                    {tugas.feedback}
                </div>
            )}

            {tugas.submitted_at && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="h-3 w-3 text-amber-500" />
                    Dikirim {tugas.submitted_at}
                    {tugas.file_tugas && (
                        <a
                            href={tugas.file_tugas}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 font-semibold text-blue-600 hover:text-blue-700"
                        >
                            (Lihat File)
                        </a>
                    )}
                </div>
            )}

            {canSubmit && (
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png"
                            onChange={handleFile}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <Upload className="h-3.5 w-3.5" />
                            {fileName ? 'Ganti File' : 'Pilih File'}
                        </button>
                        {fileName && (
                            <span className="truncate text-xs text-slate-500">
                                {fileName}
                            </span>
                        )}
                        {fileName && (
                            <button
                                onClick={() => {
                                    setFileName(null);
                                    setData('file_tugas', null);
                                    if (fileRef.current) fileRef.current.value = '';
                                }}
                                className="shrink-0 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                        {fileName && (
                            <button
                                onClick={submitTugas}
                                disabled={processing}
                                className="ml-auto min-w-[120px] rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? uploadProgress > 0
                                        ? `${uploadProgress}%`
                                        : '...'
                                    : 'Kumpulkan'}
                            </button>
                        )}
                    </div>
                    {errors.file_tugas && (
                        <p className="mt-1.5 text-xs text-red-500">
                            {errors.file_tugas}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Main Page ── */
export default function MateriSiswaDetail({
    materi,
    pertemuan,
    roadmap,
}: {
    materi: MateriDetail;
    pertemuan: string;
    roadmap: string;
}) {
    const { errors, quiz_results } = usePage().props as unknown as {
        errors: Record<string, string>;
        quiz_results?: QuizResults;
    };
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [submittingQuiz, setSubmittingQuiz] = useState(false);
    const [startQuiz, setStartQuiz] = useState(false);
    const [confirmRetake, setConfirmRetake] = useState(false);
    const [viewerModalOpen, setViewerModalOpen] = useState(false);
    const [liveSession, setLiveSession] = useState(materi.live_session ?? null);

    useEffect(() => {
        if (!materi.pertemuan_id) return;
        let cancelled = false;

        const poll = async () => {
            try {
                const res = await fetch(`/pertemuan/${materi.pertemuan_id}/live-screen/status`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (cancelled) return;
                setLiveSession(data.live_session ?? null);
            } catch {
                /* transient error; next poll retries */
            }
        };

        poll();
        const timer = window.setInterval(poll, 10000);
        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, [materi.pertemuan_id]);

    const activeLiveSession = liveSession;

    const cfg = progressConfig[materi.progress_status];
    const StatusIcon = cfg.icon;
    const hasQuiz = materi.quiz && materi.quiz.length > 0;
    const quizMaxed =
        materi.quiz_attempts >= 2 || (materi.quiz_score !== null && materi.quiz_attempts >= 2);
    const results = quiz_results as QuizResults | undefined;

    function updateProgress(status: string) {
        setLoadingProgress(true);
        router.post(
            `/materi-saya/${materi.id}/progress`,
            { status },
            {
                preserveScroll: true,
                onFinish: () => setLoadingProgress(false),
            },
        );
    }

    function submitQuiz(e: React.FormEvent) {
        e.preventDefault();
        if (!hasQuiz || submittingQuiz) return;
        setSubmittingQuiz(true);
        router.post(
            `/materi-saya/${materi.id}/quiz`,
            { answers: quizAnswers },
            {
                preserveScroll: true,
                onFinish: () => setSubmittingQuiz(false),
            },
        );
    }

    function setAnswer(quizId: number, value: string) {
        setQuizAnswers((prev) => ({ ...prev, [quizId]: value }));
    }

    const allAnswered =
        hasQuiz && materi.quiz.every((q) => quizAnswers[q.id]?.trim());

    return (
        <>
            <Head title={materi.judul} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                    {/* Back */}
                    <Link
                        href="/materi-saya"
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Materi Saya
                    </Link>

                    {/* Flash Messages */}
                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}
                    {errors.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {errors.error}
                        </div>
                    )}

                    {/* Live Screen Card Section */}
                    {materi.pertemuan_id && (
                        <LiveScreenCard
                            pertemuanId={materi.pertemuan_id}
                            isTeacher={false}
                            liveSession={activeLiveSession}
                            isBroadcasting={false}
                            isLoading={false}
                            onStartShare={() => {}}
                            onStopShare={() => {}}
                            onOpenViewer={() => setViewerModalOpen(true)}
                        />
                    )}

                    {/* Header Card */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {materi.thumbnail && (
                            <div className="w-full bg-slate-100">
                                <img
                                    src={materi.thumbnail}
                                    alt={materi.judul}
                                    className="h-auto w-full"
                                />
                            </div>
                        )}

                        <div className="p-5 md:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                                        {materi.judul}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {pertemuan}
                                        </span>
                                        <span>·</span>
                                        <span>{roadmap}</span>
                                        <span>·</span>
                                        <span>oleh {materi.created_by}</span>
                                    </div>
                                </div>

                                {/* Status + Action */}
                                <div className="flex shrink-0 items-center gap-3">
                                    <span
                                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                        style={{ background: cfg.bg, color: cfg.color }}
                                    >
                                        <StatusIcon className="h-3 w-3" />
                                        {cfg.label}
                                    </span>
                                    {cfg.btn && (
                                        <button
                                            onClick={() => updateProgress(cfg.next!)}
                                            disabled={loadingProgress}
                                            className="rounded-lg px-4 py-2 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{
                                                background: materi.progress_status === 'not_started'
                                                    ? BRAND.blue
                                                    : `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueDeep} 100%)`,
                                            }}
                                        >
                                            {loadingProgress ? '...' : cfg.btn}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {materi.deskripsi && (
                                <div className="mt-5 border-t border-slate-100 pt-5">
                                    <p className="text-sm leading-relaxed text-slate-600">
                                        {materi.deskripsi}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Konten */}
                    {materi.konten && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-5 py-3">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Materi Pembelajaran
                                </h2>
                            </div>
                            <div className="prose prose-slate max-w-none px-5 py-4 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-4 [&_img]:shadow-sm [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl [&_iframe]:my-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:p-2 [&_td]:border [&_td]:border-slate-200 [&_td]:p-2">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: materi.konten,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Video */}
                    {materi.video_embed_url && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4 text-slate-500" />
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Video Pembelajaran
                                    </h2>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="overflow-hidden rounded-lg bg-black">
                                    <iframe
                                        src={materi.video_embed_url}
                                        title={materi.judul}
                                        className="aspect-video w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Resources */}
                    {(materi.pdf_file ||
                        materi.drive_link ||
                        (materi.folders?.length ?? 0) > 0 ||
                        (materi.files?.length ?? 0) > 0) && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        File & Link
                                    </h2>
                                </div>
                            </div>
                            <div className="space-y-0 divide-y divide-slate-100">
                                {materi.pdf_file && (
                                    <a
                                        href={materi.pdf_file}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                            <Download className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Download Materi
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {materi.pdf_file_name}
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {materi.drive_link && (
                                    <a
                                        href={materi.drive_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                            <ExternalLink className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Google Drive
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Buka di Google Drive
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {materi.files?.map((f) => (
                                    <a
                                        key={f.id}
                                        href={f.download_url}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {f.nama}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {formatBytes(f.size)}
                                            </p>
                                        </div>
                                        <Download className="h-4 w-4 shrink-0 text-slate-300" />
                                    </a>
                                ))}
                                {materi.folders?.map((f) => (
                                    <a
                                        key={f.id}
                                        href={f.download_url}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                            <Folder className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Download Folder · {f.nama}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {f.file_count} file ·{' '}
                                                {formatBytes(f.total_size)} ·
                                                .zip
                                            </p>
                                        </div>
                                        <Download className="h-4 w-4 shrink-0 text-slate-300" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quiz Section */}
                    {hasQuiz && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-5 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-slate-500" />
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Quiz
                                        </h2>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {materi.quiz_attempts}/2 kali
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4 p-5">
                                {/* Quiz Results (Just submitted) */}
                                {results && (
                                    <div
                                        className={`rounded-xl border p-5 ${
                                            results.score >= 70
                                                ? 'border-emerald-200 bg-emerald-50'
                                                : 'border-amber-200 bg-amber-50'
                                        }`}
                                    >
                                        <p
                                            className={`text-lg font-bold ${
                                                results.score >= 70
                                                    ? 'text-emerald-800'
                                                    : 'text-amber-800'
                                            }`}
                                        >
                                            {results.score >= 70
                                                ? 'Selamat! Quiz Selesai'
                                                : 'Quiz Selesai'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-700">
                                            Nilai Percobaan Ini:{' '}
                                            <span className="font-bold">{results.score}</span> ({results.correct}/{results.total} benar)
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Percobaan ke-{results.attempts}/{results.max_attempts} • Nilai Akhir (Tertinggi):{' '}
                                            <span className="font-bold text-slate-800">{materi.quiz_score ?? results.score}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Previous Score Summary (on reload or completed) */}
                                {!results && (quizMaxed || materi.quiz_attempts > 0) && !startQuiz && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    Hasil Quiz Anda
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Percobaan: {materi.quiz_attempts}/2 kali
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-blue-600">
                                                    {materi.quiz_score ?? 0}
                                                </span>
                                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Nilai Tertinggi</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Retake Option Prompt */}
                                {materi.quiz_attempts === 1 && !startQuiz && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                        {!confirmRetake ? (
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-700">
                                                        Masih ada sisa 1x kesempatan pengerjaan.
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        Nilai tertinggi dari 2x percobaan akan diambil sebagai nilai akhir.
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmRetake(true)}
                                                    className="shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-700 shadow-sm"
                                                >
                                                    Mengulang Quiz (Sisa 1x)
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs">
                                                <p className="font-bold text-amber-900 text-sm">
                                                    Yakin ingin mengulang quiz sekarang?
                                                </p>
                                                <p className="text-amber-800 leading-relaxed">
                                                    Ini adalah **percobaan ke-2 (terakhir)** Anda. Nilai yang tersimpan di sistem adalah **nilai tertinggi** di antara kedua percobaan.
                                                </p>
                                                <div className="flex gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setConfirmRetake(false);
                                                            setQuizAnswers({});
                                                            setStartQuiz(true);
                                                        }}
                                                        className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white transition-colors hover:bg-amber-700 shadow-sm"
                                                    >
                                                        Ya, Mulai Percobaan 2
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmRetake(false)}
                                                        className="rounded-lg border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-800 hover:bg-amber-100"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Initial Quiz Confirmation (Before any attempt) */}
                                {materi.quiz_attempts === 0 && !startQuiz && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center space-y-4">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            <HelpCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">Yakin ingin mengerjakan quiz sekarang?</h3>
                                            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                                                Quiz ini terdiri dari <span className="font-semibold text-slate-700">{materi.quiz.length} soal</span>.
                                                Anda memiliki <span className="font-semibold text-slate-700">2 kali kesempatan</span> pengerjaan (nilai tertinggi akan diambil).
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setStartQuiz(true)}
                                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow"
                                            >
                                                Mulai Kerjakan Quiz
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Active Quiz Form */}
                                {!quizMaxed && startQuiz && (
                                    <form
                                        onSubmit={submitQuiz}
                                        className="space-y-4"
                                    >
                                        {materi.quiz.map((q, idx) => (
                                            <div
                                                key={q.id}
                                                className="rounded-lg border border-slate-200 p-4"
                                            >
                                                <p className="mb-3 text-sm font-semibold text-slate-900">
                                                    <span className="text-slate-400">
                                                        {idx + 1}.
                                                    </span>{' '}
                                                    {q.soal}
                                                </p>
                                                {q.gambar && (
                                                    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 max-w-lg">
                                                        <img
                                                            src={q.gambar}
                                                            alt={`Gambar Soal Nomor ${idx + 1}`}
                                                            className="max-h-72 w-auto object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    {q.opsi.map((o, i) => (
                                                        <label
                                                            key={i}
                                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                                                                quizAnswers[
                                                                    q.id
                                                                ] === o
                                                                    ? 'border-blue-300 bg-blue-50 text-blue-700 font-semibold'
                                                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`quiz_${q.id}`}
                                                                value={o}
                                                                disabled={submittingQuiz}
                                                                checked={
                                                                    quizAnswers[
                                                                        q.id
                                                                    ] === o
                                                                }
                                                                onChange={() =>
                                                                    setAnswer(
                                                                        q.id,
                                                                        o,
                                                                    )
                                                                }
                                                                className="h-4 w-4 text-blue-600"
                                                            />
                                                            <span>
                                                                {String.fromCharCode(
                                                                    65 + i,
                                                                )}. {o}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {errors.quiz && (
                                            <p className="text-sm text-red-500">
                                                {errors.quiz}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={
                                                !allAnswered || submittingQuiz
                                            }
                                            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submittingQuiz
                                                ? 'Mengirim Jawaban...'
                                                : 'Kumpulkan Quiz'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tugas Section */}
                    {materi.tugas.length > 0 && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 px-5 py-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Penugasan
                                    </h2>
                                </div>
                            </div>
                            <div className="space-y-3 p-4">
                                {materi.tugas.map((tugas) => (
                                    <TugasCard key={tugas.id} tugas={tugas} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Polling & Voting Section */}
                    {materi.poll && (
                        <MateriPollWidget materiId={materi.id} poll={materi.poll} />
                    )}

                    {/* Forum Diskusi Terbuka Section */}
                    <MateriForumChat materiId={materi.id} discussions={materi.discussions ?? []} />
                </div>
            </div>

            {/* Live Screen Viewer Modal */}
            <LiveScreenViewerModal
                open={viewerModalOpen}
                onClose={() => setViewerModalOpen(false)}
                roomName={activeLiveSession?.room_name ?? null}
                hostName={activeLiveSession?.host_name ?? 'Guru'}
                materiJudul={materi.judul}
                pertemuanJudul={pertemuan}
            />
        </>
    );
}

MateriSiswaDetail.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
    ],
};
