import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    HeartHandshake,
    UserX,
    Layers,
    Stethoscope,
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

type SiswaBulan = {
    siswa_id: number;
    nama: string;
    hadir: number;
    terlambat: number;
    izin: number;
    sakit: number;
    tidak_hadir: number;
    pct: number;
    below_threshold: boolean;
};

type SiswaRoadmap = {
    siswa_id: number;
    nama: string;
    statuses: Record<number, string>;
    tidak_hadir: number;
    pct: number;
    below_threshold: boolean;
};

type SiswaItem = SiswaBulan | SiswaRoadmap;

type RoadmapItem = {
    id: number;
    judul: string;
    bulan: number;
    tahun: number;
    bulan_nama: string;
    tingkat: string | null;
    total_pertemuan: number;
    published_pertemuan?: number;
    counted_pertemuan?: number;
};

type PertemuanItem = {
    id: number;
    judul: string;
    urutan: number;
    tanggal: string | null;
};

type Props = {
    data: SiswaItem[];
    total_pertemuan: number;
    bulan: number;
    tahun: number;
    mode: 'bulan' | 'roadmap';
    threshold: number;
    roadmap_id?: number;
    roadmaps?: RoadmapItem[];
    pertemuan?: PertemuanItem[];
    roadmap_judul?: string | null;
    pertemuan_total?: number;
};

const bulanList = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const formatTanggal = (tanggal: string): string => {
    const d = new Date(tanggal);
    if (Number.isNaN(d.getTime())) return tanggal;
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
};

const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; dot: string }
> = {
    hadir: {
        label: 'Hadir',
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        dot: 'bg-emerald-500',
    },
    terlambat: {
        label: 'Terlambat',
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        dot: 'bg-amber-500',
    },
    izin: {
        label: 'Izin',
        bg: 'bg-sky-50',
        text: 'text-sky-600',
        dot: 'bg-sky-500',
    },
    sakit: {
        label: 'Sakit',
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        dot: 'bg-violet-500',
    },
    alpa: {
        label: 'Alpa',
        bg: 'bg-red-50',
        text: 'text-red-600',
        dot: 'bg-red-500',
    },
};

export default function LaporanAbsensi({
    data,
    total_pertemuan,
    bulan,
    tahun,
    mode,
    threshold,
    roadmap_id,
    roadmaps,
    pertemuan,
    roadmap_judul,
    pertemuan_total,
}: Props) {
    const [filterBulan, setFilterBulan] = useState(String(bulan));
    const [filterTahun, setFilterTahun] = useState(String(tahun));
    const [filterRoadmap, setFilterRoadmap] = useState(
        roadmap_id ? String(roadmap_id) : '',
    );

    const tahunList = Array.from({ length: 10 }, (_, i) =>
        String(new Date().getFullYear() - 5 + i),
    );

    const goBulan = () => {
        router.get('/laporan/absensi', {
            mode: 'bulan',
            bulan: filterBulan,
            tahun: filterTahun,
        });
    };

    const goRoadmap = () => {
        router.get('/laporan/absensi', {
            mode: 'roadmap',
            roadmap_id: filterRoadmap,
        });
    };

    const totalSiswa = data.length;

    const totalHadir = mode === 'bulan'
        ? data.reduce((sum, s) => sum + ('hadir' in s ? s.hadir : 0), 0)
        : 0;
    const totalTerlambat = mode === 'bulan'
        ? data.reduce((sum, s) => sum + ('terlambat' in s ? s.terlambat : 0), 0)
        : 0;
    const totalTidakHadir = data.reduce((sum, s) => sum + s.tidak_hadir, 0);
    const totalRisiko = data.filter((s) => s.below_threshold).length;

    const setMode = (m: 'bulan' | 'roadmap') => {
        router.get('/laporan/absensi', { mode: m });
    };

    return (
        <>
            <Head title="Laporan Absensi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Laporan Absensi
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Rekapitulasi & tracking kehadiran siswa
                                </p>
                            </div>
                        </div>

                        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                            <button
                                onClick={() => setMode('bulan')}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                                    mode === 'bulan'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Per Bulan
                            </button>
                            <button
                                onClick={() => setMode('roadmap')}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                                    mode === 'roadmap'
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Layers className="h-3.5 w-3.5" />
                                Per Roadmap
                            </button>
                        </div>
                    </div>

                    {mode === 'bulan' ? (
                        <>
                            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Bulan
                                    </label>
                                    <Select
                                        value={filterBulan}
                                        onValueChange={setFilterBulan}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bulanList.map((b) => (
                                                <SelectItem
                                                    key={b.value}
                                                    value={b.value}
                                                >
                                                    {b.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Tahun
                                    </label>
                                    <Select
                                        value={filterTahun}
                                        onValueChange={setFilterTahun}
                                    >
                                        <SelectTrigger className="w-28">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tahunList.map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={goBulan} className="h-9">
                                    Lihat
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <StatCard
                                    icon={Calendar}
                                    color="text-sky-600 bg-sky-50"
                                    label="Total Pertemuan"
                                    value={total_pertemuan}
                                />
                                <StatCard
                                    icon={FileText}
                                    color="text-violet-600 bg-violet-50"
                                    label="Total Siswa"
                                    value={totalSiswa}
                                />
                                <StatCard
                                    icon={CheckCircle}
                                    color="text-emerald-600 bg-emerald-50"
                                    label="Hadir"
                                    value={totalHadir + totalTerlambat}
                                />
                                <StatCard
                                    icon={AlertTriangle}
                                    color="text-red-600 bg-red-50"
                                    label="Di Bawah Batas"
                                    value={totalRisiko}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500">
                                    Roadmap
                                </label>
                                <Select
                                    value={filterRoadmap}
                                    onValueChange={setFilterRoadmap}
                                >
                                    <SelectTrigger className="w-72">
                                        <SelectValue placeholder="Pilih roadmap" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roadmaps?.map((r) => (
                                            <SelectItem
                                                key={r.id}
                                                value={String(r.id)}
                                            >
                                                {r.bulan_nama} {r.tahun} —{' '}
                                                {r.judul} ({r.total_pertemuan}{' '}
                                                pertemuan
                                                {typeof r.counted_pertemuan ===
                                                    'number' &&
                                                r.counted_pertemuan <
                                                    r.total_pertemuan
                                                    ? `, ${r.counted_pertemuan} terhitung`
                                                    : ''}
                                                )
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={goRoadmap} className="h-9">
                                Lihat
                            </Button>
                        </div>
                    )}

                    {mode === 'roadmap' && (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-emerald-900">
                                    {roadmap_judul ?? 'Pilih roadmap terlebih dahulu'}
                                </p>
                                <p className="text-xs text-emerald-700">
                                    {total_pertemuan} pertemuan · batas
                                    kehadiran {threshold}%
                                </p>
                            </div>
                            {totalRisiko > 0 && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {totalRisiko} siswa berisiko
                                </span>
                            )}
                        </div>
                    )}

                    {mode === 'roadmap' &&
                        total_pertemuan === 0 &&
                        (pertemuan_total ?? 0) > 0 && (
                            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                Belum ada pertemuan yang dihitung ({pertemuan_total}{' '}
                                pertemuan) — laporan hanya menghitung pertemuan
                                published atau yang sudah punya absensi.
                                Publikasikan atau buka absensinya lewat menu
                                Pertemuan.
                            </div>
                        )}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-bold text-slate-900">
                                {mode === 'roadmap'
                                    ? 'Tracking Kehadiran per Pertemuan'
                                    : 'Detail Absensi Siswa'}
                                {total_pertemuan > 0 && (
                                    <span className="ml-2 text-xs font-normal text-slate-400">
                                        ({total_pertemuan} pertemuan)
                                    </span>
                                )}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {Object.entries(statusConfig).map(([k, v]) => (
                                    <span
                                        key={k}
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${v.bg} ${v.text}`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${v.dot}`}
                                        />
                                        {v.label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500">
                                            <th className="w-10 px-4 py-2.5 font-semibold">
                                                No
                                            </th>
                                            <th className="px-4 py-2.5 font-semibold">
                                                Nama Siswa
                                            </th>
                                            {mode === 'roadmap' &&
                                                pertemuan?.map((p, i) => (
                                                    <th
                                                        key={p.id}
                                                        className="px-2 py-2.5 text-center font-semibold"
                                                    >
                                                        <div className="text-xs font-bold text-slate-700">
                                                            Pert{' '}
                                                            {p.urutan ?? i + 1}
                                                        </div>
                                                        {p.judul && (
                                                            <div className="text-[10px] font-normal text-slate-500">
                                                                {p.judul}
                                                            </div>
                                                        )}
                                                        {p.tanggal && (
                                                            <div className="text-[10px] font-normal text-slate-400">
                                                                {formatTanggal(
                                                                    p.tanggal,
                                                                )}
                                                            </div>
                                                        )}
                                                    </th>
                                                ))}
                                            {mode === 'bulan' && (
                                                <>
                                                    <th className="w-20 px-2 py-2.5 text-center font-semibold">
                                                        Hadir
                                                    </th>
                                                    <th className="w-20 px-2 py-2.5 text-center font-semibold">
                                                        Terlambat
                                                    </th>
                                                    <th className="w-20 px-2 py-2.5 text-center font-semibold">
                                                        Izin
                                                    </th>
                                                    <th className="w-20 px-2 py-2.5 text-center font-semibold">
                                                        Sakit
                                                    </th>
                                                </>
                                            )}
                                            <th className="w-20 px-2 py-2.5 text-center font-semibold">
                                                Bolong
                                            </th>
                                            <th className="w-24 px-2 py-2.5 text-center font-semibold">
                                                % Kehadiran
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.map((s, i) => {
                                            const pct = s.pct;
                                            return (
                                                <tr
                                                    key={s.siswa_id}
                                                    className={`transition-colors hover:bg-slate-50 ${
                                                        s.below_threshold
                                                            ? 'bg-red-50/40'
                                                            : ''
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 text-slate-400">
                                                        {i + 1}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">
                                                                {s.nama}
                                                            </span>
                                                            {s.below_threshold && (
                                                                <span
                                                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"
                                                                    title={`Kehadiran di bawah ${threshold}%`}
                                                                >
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    &lt;{threshold}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {mode === 'roadmap' &&
                                                        pertemuan?.map((p) => {
                                                            const st =
                                                                'statuses' in s
                                                                    ? (s.statuses[
                                                                          p.id
                                                                      ] ?? 'alpa')
                                                                    : 'alpa';
                                                            const cfg =
                                                                statusConfig[
                                                                    st
                                                                ] ??
                                                                statusConfig.alpa;
                                                            return (
                                                                <td
                                                                    key={p.id}
                                                                    className="px-2 py-3 text-center"
                                                                >
                                                                    <span
                                                                        className={`inline-flex min-w-[70px] items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}
                                                                    >
                                                                        <span
                                                                            className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                                                                        />
                                                                        {
                                                                            cfg.label
                                                                        }
                                                                    </span>
                                                                </td>
                                                            );
                                                        })}
                                                    {mode === 'bulan' && (
                                                        <>
                                                            <td className="px-2 py-3 text-center">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    {'hadir' in s
                                                                        ? s.hadir
                                                                        : 0}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                                                                    <Clock className="h-3 w-3" />
                                                                    {'terlambat' in s
                                                                        ? s.terlambat
                                                                        : 0}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-600">
                                                                    <HeartHandshake className="h-3 w-3" />
                                                                    {'izin' in s
                                                                        ? s.izin
                                                                        : 0}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-3 text-center">
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-600">
                                                                    <Stethoscope className="h-3 w-3" />
                                                                    {'sakit' in s
                                                                        ? s.sakit
                                                                        : 0}
                                                                </span>
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="px-2 py-3 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                s.tidak_hadir > 0
                                                                    ? 'bg-red-50 text-red-600'
                                                                    : 'bg-slate-50 text-slate-400'
                                                            }`}
                                                        >
                                                            <UserX className="h-3 w-3" />
                                                            {s.tidak_hadir}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-3 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                                s.below_threshold
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : pct >= 80
                                                                      ? 'bg-green-50 text-green-600'
                                                                      : pct >= 50
                                                                        ? 'bg-amber-50 text-amber-600'
                                                                        : 'bg-red-50 text-red-600'
                                                            }`}
                                                        >
                                                            {pct}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                                <BarChart3 className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada data absensi
                                </p>
                                <p className="text-xs text-slate-400">
                                    {mode === 'roadmap'
                                        ? roadmap_judul
                                            ? 'Tidak ada siswa aktif yang terdaftar, atau pertemuan roadmap masih draft.'
                                            : 'Pilih roadmap terlebih dahulu.'
                                        : total_pertemuan === 0
                                          ? 'Tidak ada pertemuan yang dipublikasikan pada bulan ini.'
                                          : 'Tidak ada siswa aktif yang terdaftar.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    color,
    label,
    value,
}: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {label}
                </p>
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

LaporanAbsensi.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan Absensi', href: '/laporan/absensi' },
    ],
};
