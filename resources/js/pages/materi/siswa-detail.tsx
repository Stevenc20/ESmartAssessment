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
    PlayCircle,
    Upload,
    X,
} from 'lucide-react';
import { useRef, useState } from 'react';

/* ── Types ── */
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

type MateriDetail = {
    id: number;
    judul: string;
    deskripsi: string | null;
    thumbnail: string | null;
    video_url: string | null;
    video_embed_url: string | null;
    pdf_file: string | null;
    pdf_file_name: string | null;
    drive_link: string | null;
    created_by: string;
    progress_status: 'not_started' | 'in_progress' | 'completed';
    completed_at: string | null;
    tugas: TugasItem[];
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
            onProgress: (progress) => setUploadProgress(progress.percentage),
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
                                className="ml-auto rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 min-w-[120px]"
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
    const { errors } = usePage().props;
    const [loadingProgress, setLoadingProgress] = useState(false);

    const cfg = progressConfig[materi.progress_status];
    const StatusIcon = cfg.icon;

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

                    {/* Header Card */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {materi.thumbnail && (
                            <div className="aspect-video w-full overflow-hidden bg-slate-100">
                                <img
                                    src={materi.thumbnail}
                                    alt={materi.judul}
                                    className="h-full w-full object-cover"
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
                    {(materi.pdf_file || materi.drive_link) && (
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
                </div>
            </div>
        </>
    );
}

MateriSiswaDetail.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
    ],
};
