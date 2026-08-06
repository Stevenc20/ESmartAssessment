import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CheckCircle2,
    Clock,
    Circle,
    FileText,
    Folder,
    GraduationCap,
    Library,
    PlayCircle,
    ArrowRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';

/* ── Types ── */
type TugasItem = {
    id: number;
    judul: string;
    status: 'tersedia' | 'dikirim' | 'dinilai' | 'terlewat';
};

type MateriItem = {
    id: number;
    judul: string;
    deskripsi: string | null;
    thumbnail: string | null;
    created_by: string;
    progress_status: 'not_started' | 'in_progress' | 'completed';
    folders?: { id: number; nama: string; file_count: number }[];
    files?: { id: number; nama: string }[];
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
    },
    in_progress: {
        icon: PlayCircle,
        label: 'Sedang Dipelajari',
        color: BRAND.blue,
        bg: '#eef3f9',
    },
    completed: {
        icon: CheckCircle2,
        label: 'Selesai',
        color: '#059669',
        bg: '#ecfdf5',
    },
};

const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'not_started', label: 'Belum Dimulai' },
    { key: 'in_progress', label: 'Sedang Dipelajari' },
    { key: 'completed', label: 'Selesai' },
];

/* ── Materi Card ── */
function MateriCard({
    materi,
    index,
}: {
    materi: MateriItem;
    index: number;
}) {
    const cfg = progressConfig[materi.progress_status];
    const StatusIcon = cfg.icon;

    return (
        <Link
            href={`/materi-saya/${materi.id}`}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-all hover:border-slate-300 hover:shadow-md md:px-5"
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
                    className="h-10 w-14 shrink-0 rounded-lg object-contain bg-slate-100"
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

            {/* Title, Author, Desc */}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                    {materi.judul}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                    oleh {materi.created_by}
                </p>
                {materi.deskripsi && (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                        {materi.deskripsi}
                    </p>
                )}
            </div>

            {/* Tugas indicator */}
            {(materi.files?.length ?? 0) > 0 && (
                <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 sm:inline-flex">
                    <FileText className="h-3 w-3" />
                    {materi.files?.length} file
                </span>
            )}

            {(materi.folders?.length ?? 0) > 0 && (
                <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 sm:inline-flex">
                    <Folder className="h-3 w-3" />
                    {materi.folders?.length} folder
                </span>
            )}

            {materi.tugas.length > 0 && (
                <span className="hidden shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700 sm:inline-flex">
                    <Clock className="h-3 w-3" />
                    {materi.tugas.filter((t) => t.status === 'tersedia').length}{' '}
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

            {/* Masuk Arrow */}
            <div className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-500">
                <ArrowRight className="h-4 w-4" />
            </div>
        </Link>
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
    const [activeRoadmap, setActiveRoadmap] = useState<number | null>(
        roadmaps.length > 0 ? roadmaps[0].id : null,
    );
    const [filter, setFilter] = useState<FilterType>('all');

    const persen =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const currentRoadmap = roadmaps.find((r) => r.id === activeRoadmap) ?? null;

    const filteredPertemuan = useMemo(() => {
        if (!currentRoadmap) return [];

        if (filter === 'all') return currentRoadmap.pertemuan;

        return currentRoadmap.pertemuan
            .map((p) => ({
                ...p,
                materi: p.materi.filter((m) => m.progress_status === filter),
            }))
            .filter((p) => p.materi.length > 0);
    }, [currentRoadmap, filter]);

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
                                    style={{ background: 'rgba(255,255,255,0.15)' }}
                                >
                                    <Library className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white md:text-2xl">
                                        Materi Saya
                                    </h1>
                                    <p className="mt-0.5 text-sm text-white/60">
                                        Belajar sesuai dengan kecepatanmu sendiri
                                    </p>
                                </div>
                            </div>

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
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {roadmaps.map((r) => {
                                        const isActive = activeRoadmap === r.id;

                                        return (
                                            <button
                                                key={r.id}
                                                onClick={() => setActiveRoadmap(r.id)}
                                                className="rounded-lg px-3.5 py-2 text-sm font-semibold transition-all"
                                                style={{
                                                    background: isActive ? BRAND.blue : 'white',
                                                    color: isActive ? 'white' : '#64748b',
                                                    border: `1px solid ${isActive ? BRAND.blue : '#e2e8f0'}`,
                                                    boxShadow: isActive
                                                        ? `0 2px 8px ${BRAND.blue}30`
                                                        : 'none',
                                                }}
                                            >
                                                {r.judul}
                                                <span className="ml-1.5 text-xs" style={{ opacity: 0.7 }}>
                                                    · {bulanNames[r.bulan - 1]} {r.tahun}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                                    {filterOptions.map((f) => (
                                        <button
                                            key={f.key}
                                            onClick={() => setFilter(f.key)}
                                            className="rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all"
                                            style={{
                                                background: filter === f.key ? 'white' : 'transparent',
                                                color: filter === f.key ? BRAND.blue : '#94a3b8',
                                                boxShadow:
                                                    filter === f.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
                                            (m) => m.progress_status === 'completed',
                                        ).length;
                                        const pTotal = pertemuan.materi.length;
                                        const pPersen =
                                            pTotal > 0
                                                ? Math.round((pDone / pTotal) * 100)
                                                : 0;

                                        return (
                                            <div key={pertemuan.id}>
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
                                                            Pertemuan {pertemuan.urutan}:{' '}
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

                                                <div className="space-y-2.5 pl-0 md:pl-10">
                                                    {pertemuan.materi.map((materi) => {
                                                        materiCounter++;

                                                        return (
                                                            <MateriCard
                                                                key={materi.id}
                                                                materi={materi}
                                                                index={materiCounter}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                                        style={{ background: `${BRAND.pink}20` }}
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
                                    Materi akan muncul di sini setelah guru menambahkannya.
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
