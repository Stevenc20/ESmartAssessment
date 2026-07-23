import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Clock,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Library,
    PlayCircle,
    Sparkles,
    Upload,
    X,
} from 'lucide-react';
import { useState, useMemo, useRef } from 'react';

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

type MateriItem = {
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

type PertemuanItem = {
    id: number;
    judul: string;
    urutan: number;
    materi: MateriItem[];
};

type RoadmapItem = {
    id: number;
    judul: string;
    bulan: number;
    tahun: number;
    pertemuan: PertemuanItem[];
};

type Stats = { total: number; completed: number; in_progress: number };

type FilterType = 'all' | 'not_started' | 'in_progress' | 'completed';

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

const bulanNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'not_started', label: 'Belum Dimulai' },
    { key: 'in_progress', label: 'Sedang Dipelajari' },
    { key: 'completed', label: 'Selesai' },
];

/* ── Tugas Status Config ── */
const tugasStatusConfig = {
    tersedia: { label: 'Tersedia', color: '#436391', bg: '#eef3f9' },
    dikirim: { label: 'Dikirim', color: '#d97706', bg: '#fffbeb' },
    dinilai: { label: 'Dinilai', color: '#059669', bg: '#ecfdf5' },
    terlewat: { label: 'Terlewat', color: '#dc2626', bg: '#fef2f2' },
};

/* ── Tugas Card Component ── */
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
        if (!data.file_tugas) {
            return;
        }

        post(`/materi-saya/tugas/${tugas.id}/submit`, {
            preserveScroll: true,
            only: ['flash'],
            onProgress: (progress) => setUploadProgress(progress.percentage),
            onSuccess: () => {
                setFileName(null);
                setData('file_tugas', null);
                setUploadProgress(0);

                if (fileRef.current) {
                    fileRef.current.value = '';
                }
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
                        <span className="text-[10px] text-slate-400">
                            Nilai
                        </span>
                    </div>
                )}
            </div>

            {/* Feedback */}
            {tugas.feedback && (
                <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold">Feedback: </span>
                    {tugas.feedback}
                </div>
            )}

            {/* Submission Info */}
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

            {/* Upload Form */}
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

                                    if (fileRef.current) {
                                        fileRef.current.value = '';
                                    }
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

/* ── Materi Card Component ── */
function MateriCard({
    materi,
    index,
    isOpen,
    onToggle,
    isLoading,
    onUpdateProgress,
}: {
    materi: MateriItem;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
    isLoading: boolean;
    onUpdateProgress: (id: number, status: string) => void;
}) {
    const cfg = progressConfig[materi.progress_status];
    const StatusIcon = cfg.icon;
    const hasContent =
        materi.video_embed_url ||
        materi.pdf_file ||
        materi.drive_link ||
        materi.deskripsi ||
        materi.tugas.length > 0;

    return (
        <div
            className="group overflow-hidden rounded-xl border bg-white transition-all duration-200"
            style={{
                borderColor: isOpen ? BRAND.pink : '#e9edf3',
                boxShadow: isOpen
                    ? `0 4px 20px rgba(67,99,145,0.08), 0 0 0 1px ${BRAND.pink}40`
                    : '0 1px 3px rgba(0,0,0,0.04)',
            }}
        >
            {/* Header Row */}
            <button
                onClick={hasContent ? onToggle : undefined}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors md:px-5"
                style={{ cursor: hasContent ? 'pointer' : 'default' }}
            >
                {/* Number Badge */}
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{
                        background:
                            materi.progress_status === 'completed'
                                ? '#059669'
                                : materi.progress_status === 'in_progress'
                                  ? BRAND.blue
                                  : '#cbd5e1',
                    }}
                >
                    {materi.progress_status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        index
                    )}
                </div>

                {/* Thumbnail */}
                {materi.thumbnail ? (
                    <img
                        src={materi.thumbnail}
                        alt=""
                        className="h-10 w-14 shrink-0 rounded-lg object-cover"
                    />
                ) : (
                    <div
                        className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${BRAND.pink}25` }}
                    >
                        <FileText
                            className="h-4 w-4"
                            style={{ color: BRAND.pinkDeep }}
                        />
                    </div>
                )}

                {/* Title & Author */}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                        {materi.judul}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                        oleh {materi.created_by}
                    </p>
                </div>

                {/* Tugas indicator */}
                {materi.tugas.length > 0 && (
                    <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 sm:inline-flex">
                        <Clock className="h-3 w-3" />
                        {
                            materi.tugas.filter((t) => t.status === 'tersedia')
                                .length
                        }{' '}
                        tugas
                    </span>
                )}

                {/* Status Badge */}
                <span
                    className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline-flex"
                    style={{ background: cfg.bg, color: cfg.color }}
                >
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                </span>

                {/* Action Button */}
                {cfg.btn && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpdateProgress(materi.id, cfg.next!);
                        }}
                        disabled={isLoading}
                        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{
                            background:
                                materi.progress_status === 'not_started'
                                    ? BRAND.blue
                                    : `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueDeep} 100%)`,
                        }}
                    >
                        {isLoading ? '...' : cfg.btn}
                    </button>
                )}

                {/* Expand Icon */}
                {hasContent && (
                    <div className="shrink-0 text-slate-300">
                        {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </div>
                )}
            </button>

            {/* Expanded Content */}
            {isOpen && hasContent && (
                <div
                    className="border-t px-4 py-5 md:px-5"
                    style={{ borderColor: '#f1f5f9' }}
                >
                    {materi.deskripsi && (
                        <p className="mb-4 text-sm leading-relaxed text-slate-600">
                            {materi.deskripsi}
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Video */}
                        {materi.video_embed_url && (
                            <div className="overflow-hidden rounded-xl bg-black shadow-sm">
                                <iframe
                                    src={materi.video_embed_url}
                                    title={materi.judul}
                                    className="aspect-video w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        )}

                        {/* Resources */}
                        <div className="flex flex-col gap-3">
                            {materi.pdf_file && (
                                <a
                                    href={materi.pdf_file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm"
                                    style={{ borderColor: '#e9edf3' }}
                                >
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            background: '#fef3c7',
                                            color: '#b45309',
                                        }}
                                    >
                                        <Download className="h-4.5 w-4.5" />
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
                                    className="flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-sm"
                                    style={{ borderColor: '#e9edf3' }}
                                >
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                        style={{
                                            background: `${BRAND.blue}15`,
                                            color: BRAND.blue,
                                        }}
                                    >
                                        <ExternalLink className="h-4.5 w-4.5" />
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

                    {/* Tugas Section */}
                    {materi.tugas.length > 0 && (
                        <div className="mt-5">
                            <div className="mb-3 flex items-center gap-2">
                                <div
                                    className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                                    style={{ background: BRAND.blue }}
                                >
                                    <Clock className="h-3.5 w-3.5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">
                                    Penugasan
                                </h4>
                            </div>
                            <div className="space-y-3">
                                {materi.tugas.map((tugas) => (
                                    <TugasCard key={tugas.id} tugas={tugas} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── Main Page ── */
export default function MateriSiswa({
    roadmaps,
    stats,
}: {
    roadmaps: RoadmapItem[];
    stats: Stats;
}) {
    const { errors } = usePage().props;
    const [expandedMateri, setExpandedMateri] = useState<number | null>(null);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [activeRoadmap, setActiveRoadmap] = useState<number | null>(
        roadmaps.length > 0 ? roadmaps[0].id : null,
    );
    const [filter, setFilter] = useState<FilterType>('all');

    const persen =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    function updateProgress(materiId: number, status: string) {
        setLoadingId(materiId);
        router.post(
            `/materi-saya/${materiId}/progress`,
            { status },
            { preserveScroll: true, onFinish: () => setLoadingId(null) },
        );
    }

    /* Active roadmap data */
    const currentRoadmap = roadmaps.find((r) => r.id === activeRoadmap) ?? null;

    /* Filtered pertemuan */
    const filteredPertemuan = useMemo(() => {
        if (!currentRoadmap) {
            return [];
        }

        if (filter === 'all') {
            return currentRoadmap.pertemuan;
        }

        return currentRoadmap.pertemuan
            .map((p) => ({
                ...p,
                materi: p.materi.filter((m) => m.progress_status === filter),
            }))
            .filter((p) => p.materi.length > 0);
    }, [currentRoadmap, filter]);

    /* Running materi counter */
    let materiCounter = 0;

    return (
        <>
            <Head title="Materi Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* ── Hero Header ── */}
                    <div
                        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                        style={{
                            background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueDeep} 60%, ${BRAND.blueLight} 100%)`,
                        }}
                    >
                        {/* Decorative pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }}
                        />
                        <div
                            className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-10"
                            style={{ background: BRAND.pink }}
                        />
                        <div
                            className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full opacity-10"
                            style={{ background: BRAND.pink }}
                        />

                        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                                    style={{
                                        background: 'rgba(255,255,255,0.15)',
                                    }}
                                >
                                    <Library className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-1.5">
                                        <Sparkles
                                            className="h-3.5 w-3.5"
                                            style={{ color: BRAND.pink }}
                                        />
                                        <span
                                            className="text-[10px] font-bold tracking-wider uppercase"
                                            style={{ color: BRAND.pink }}
                                        >
                                            Learning Materials
                                        </span>
                                    </div>
                                    <h1 className="text-xl font-bold text-white md:text-2xl">
                                        Materi Saya
                                    </h1>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Belajar sesuai dengan kecepatanmu
                                        sendiri
                                    </p>
                                </div>
                            </div>

                            {/* Progress Circle */}
                            <div className="flex items-center gap-4">
                                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                                    <svg
                                        className="h-16 w-16 -rotate-90"
                                        viewBox="0 0 64 64"
                                    >
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.15)"
                                            strokeWidth="4"
                                        />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r="28"
                                            fill="none"
                                            stroke={BRAND.pink}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(persen / 100) * 175.9} 175.9`}
                                            className="transition-all duration-700"
                                        />
                                    </svg>
                                    <span className="absolute text-sm font-bold text-white">
                                        {persen}%
                                    </span>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-semibold text-white">
                                        {stats.completed}/{stats.total} selesai
                                    </p>
                                    <p className="text-xs text-white/50">
                                        Progress Belajar
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Stats Row ── */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {[
                            {
                                label: 'Total Materi',
                                value: stats.total,
                                icon: BookOpen,
                                color: BRAND.blue,
                            },
                            {
                                label: 'Sedang Dipelajari',
                                value: stats.in_progress,
                                icon: Clock,
                                color: BRAND.blueLight,
                            },
                            {
                                label: 'Selesai',
                                value: stats.completed,
                                icon: CheckCircle2,
                                color: '#059669',
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md md:p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                                        {s.label}
                                    </span>
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                                        style={{
                                            background: s.color + '15',
                                            color: s.color,
                                        }}
                                    >
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Flash Messages */}
                    {errors.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* ── Roadmap Tabs + Filter ── */}
                    {roadmaps.length > 0 ? (
                        <div className="flex flex-col gap-5">
                            {/* Tab bar */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                {/* Roadmap selector */}
                                <div className="flex flex-wrap gap-2">
                                    {roadmaps.map((r) => {
                                        const isActive = activeRoadmap === r.id;

                                        return (
                                            <button
                                                key={r.id}
                                                onClick={() => {
                                                    setActiveRoadmap(r.id);
                                                    setExpandedMateri(null);
                                                }}
                                                className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-all"
                                                style={{
                                                    background: isActive
                                                        ? BRAND.blue
                                                        : 'white',
                                                    color: isActive
                                                        ? 'white'
                                                        : '#64748b',
                                                    border: `1px solid ${isActive ? BRAND.blue : '#e2e8f0'}`,
                                                    boxShadow: isActive
                                                        ? `0 2px 8px ${BRAND.blue}30`
                                                        : 'none',
                                                }}
                                            >
                                                {r.judul}
                                                <span
                                                    className="ml-1.5 text-xs"
                                                    style={{
                                                        opacity: 0.7,
                                                    }}
                                                >
                                                    · {bulanNames[r.bulan - 1]}{' '}
                                                    {r.tahun}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Filter pills */}
                                <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                                    {filterOptions.map((f) => (
                                        <button
                                            key={f.key}
                                            onClick={() => setFilter(f.key)}
                                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all"
                                            style={{
                                                background:
                                                    filter === f.key
                                                        ? 'white'
                                                        : 'transparent',
                                                color:
                                                    filter === f.key
                                                        ? BRAND.blue
                                                        : '#94a3b8',
                                                boxShadow:
                                                    filter === f.key
                                                        ? '0 1px 3px rgba(0,0,0,0.08)'
                                                        : 'none',
                                            }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Pertemuan Sections ── */}
                            {filteredPertemuan.length > 0 ? (
                                <div className="space-y-6">
                                    {filteredPertemuan.map((pertemuan) => {
                                        const pDone = pertemuan.materi.filter(
                                            (m) =>
                                                m.progress_status ===
                                                'completed',
                                        ).length;
                                        const pTotal = pertemuan.materi.length;
                                        const pPersen =
                                            pTotal > 0
                                                ? Math.round(
                                                      (pDone / pTotal) * 100,
                                                  )
                                                : 0;

                                        return (
                                            <div key={pertemuan.id}>
                                                {/* Section Header */}
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div
                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${BRAND.pinkDeep} 0%, ${BRAND.pink} 100%)`,
                                                        }}
                                                    >
                                                        {pertemuan.urutan}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-bold text-slate-900">
                                                            Pertemuan{' '}
                                                            {pertemuan.urutan}:{' '}
                                                            {pertemuan.judul}
                                                        </h3>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${pPersen}%`,
                                                                    background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueLight})`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-400">
                                                            {pDone}/{pTotal}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Materi Cards */}
                                                <div className="space-y-2.5 pl-0 md:pl-10">
                                                    {pertemuan.materi.map(
                                                        (materi) => {
                                                            materiCounter++;

                                                            return (
                                                                <MateriCard
                                                                    key={
                                                                        materi.id
                                                                    }
                                                                    materi={
                                                                        materi
                                                                    }
                                                                    index={
                                                                        materiCounter
                                                                    }
                                                                    isOpen={
                                                                        expandedMateri ===
                                                                        materi.id
                                                                    }
                                                                    onToggle={() =>
                                                                        setExpandedMateri(
                                                                            (
                                                                                prev,
                                                                            ) =>
                                                                                prev ===
                                                                                materi.id
                                                                                    ? null
                                                                                    : materi.id,
                                                                        )
                                                                    }
                                                                    isLoading={
                                                                        loadingId ===
                                                                        materi.id
                                                                    }
                                                                    onUpdateProgress={
                                                                        updateProgress
                                                                    }
                                                                />
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                                        style={{
                                            background: `${BRAND.pink}20`,
                                        }}
                                    >
                                        <BookOpen
                                            className="h-6 w-6"
                                            style={{ color: BRAND.pinkDeep }}
                                        />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">
                                        Tidak ada materi dengan filter ini
                                    </p>
                                    <button
                                        onClick={() => setFilter('all')}
                                        className="text-xs font-semibold transition-colors"
                                        style={{ color: BRAND.blue }}
                                    >
                                        Tampilkan Semua
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ── Empty State ── */
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-20 text-center">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${BRAND.pink}30 0%, ${BRAND.surface} 100%)`,
                                }}
                            >
                                <GraduationCap
                                    className="h-8 w-8"
                                    style={{ color: BRAND.blue }}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">
                                    Belum Ada Materi
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Materi akan muncul di sini setelah guru
                                    menambahkannya.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

MateriSiswa.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
    ],
};
