import { Head, router } from '@inertiajs/react';
import { BarChart3, Calendar, CheckCircle, Clock, FileText, UserX } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type SiswaItem = {
    siswa_id: number;
    nama: string;
    hadir: number;
    terlambat: number;
    tidak_hadir: number;
};

type Props = {
    data: SiswaItem[];
    total_pertemuan: number;
    bulan: number;
    tahun: number;
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

export default function LaporanAbsensi({ data, total_pertemuan, bulan, tahun }: Props) {
    const [filterBulan, setFilterBulan] = useState(String(bulan));
    const [filterTahun, setFilterTahun] = useState(String(tahun));

    const tahunList = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - 5 + i));

    const cari = () => {
        router.get('/laporan/absensi', { bulan: filterBulan, tahun: filterTahun });
    };

    const totalSiswa = data.length;
    const totalHadir = data.reduce((sum, s) => sum + s.hadir, 0);
    const totalTerlambat = data.reduce((sum, s) => sum + s.terlambat, 0);
    const totalTidakHadir = data.reduce((sum, s) => sum + s.tidak_hadir, 0);

    return (
        <>
            <Head title="Laporan Absensi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Laporan Absensi</h1>
                            <p className="text-sm text-slate-500">Rekapitulasi kehadiran siswa per bulan</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Bulan</label>
                            <Select value={filterBulan} onValueChange={setFilterBulan}>
                                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {bulanList.map(b => (
                                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Tahun</label>
                            <Select value={filterTahun} onValueChange={setFilterTahun}>
                                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {tahunList.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={cari} className="h-9">Lihat</Button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pertemuan</p>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                                    <Calendar className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{total_pertemuan}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Siswa</p>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                    <FileText className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{totalSiswa}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hadir</p>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-emerald-600">{totalHadir + totalTerlambat}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tidak Hadir</p>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                    <UserX className="h-4 w-4" />
                                </div>
                            </div>
                            <p className="mt-1 text-2xl font-bold text-red-600">{totalTidakHadir}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-bold text-slate-900">
                                Detail Absensi Siswa
                                {total_pertemuan > 0 && (
                                    <span className="ml-2 text-xs font-normal text-slate-400">
                                        ({total_pertemuan} pertemuan)
                                    </span>
                                )}
                            </h2>
                        </div>
                        {data.length > 0 ? (
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500">
                                        <th className="w-12 px-4 py-2.5 font-semibold">No</th>
                                        <th className="px-4 py-2.5 font-semibold">Nama Siswa</th>
                                        <th className="w-20 px-4 py-2.5 font-semibold text-center">Hadir</th>
                                        <th className="w-24 px-4 py-2.5 font-semibold text-center">Terlambat</th>
                                        <th className="w-24 px-4 py-2.5 font-semibold text-center">Tidak Hadir</th>
                                        <th className="w-24 px-4 py-2.5 font-semibold text-center">% Kehadiran</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.map((s, i) => {
                                        const pct = total_pertemuan > 0
                                            ? Math.round(((s.hadir + s.terlambat) / total_pertemuan) * 100)
                                            : 0;
                                        return (
                                            <tr key={s.siswa_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{s.nama}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                                                        <CheckCircle className="h-3 w-3" />
                                                        {s.hadir}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                                                        <Clock className="h-3 w-3" />
                                                        {s.terlambat}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        s.tidak_hadir > 0
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        <UserX className="h-3 w-3" />
                                                        {s.tidak_hadir}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        pct >= 80 ? 'bg-green-50 text-green-600'
                                                        : pct >= 50 ? 'bg-amber-50 text-amber-600'
                                                        : 'bg-red-50 text-red-600'
                                                    }`}>
                                                        {pct}%
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                                <BarChart3 className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">Belum ada data absensi</p>
                                <p className="text-xs text-slate-400">
                                    {total_pertemuan === 0
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

LaporanAbsensi.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan Absensi', href: '/laporan/absensi' },
    ],
};
