import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Download,
    FileSpreadsheet,
    Filter,
    GraduationCap,
    Search,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type PertemuanItem = {
    id: number;
    judul: string;
    urutan: number;
};

type PertemuanScore = {
    pertemuan_id: number;
    pertemuan_judul: string;
    quiz_score: number | null;
    tugas_score: number | null;
    combined_score: number | null;
};

type StudentMatrixItem = {
    id: number;
    nama: string;
    email: string;
    kelas: string;
    jurusan: string;
    pertemuan_scores: Record<number, PertemuanScore>;
    rata_rata: number;
};

type KelasItem = {
    id: number;
    nama_kelas: string;
};

export default function MateriPenilaian({
    pertemuanList,
    students,
    kelasList,
    filters,
}: {
    pertemuanList: PertemuanItem[];
    students: StudentMatrixItem[];
    kelasList: KelasItem[];
    filters: { kelas_id?: string; search?: string };
}) {
    const [kelasId, setKelasId] = useState(filters.kelas_id ?? 'all');
    const [search, setSearch] = useState(filters.search ?? '');

    function handleFilterChange(newKelasId: string) {
        setKelasId(newKelasId);
        router.get(
            '/penilaian-materi',
            {
                kelas_id: newKelasId === 'all' ? undefined : newKelasId,
                search: search || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            '/penilaian-materi',
            {
                kelas_id: kelasId === 'all' ? undefined : kelasId,
                search: search || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleExport() {
        const query = new URLSearchParams();
        if (kelasId && kelasId !== 'all') query.append('kelas_id', kelasId);
        if (search) query.append('search', search);

        window.location.href = `/penilaian-materi/export?${query.toString()}`;
    }

    const totalStudents = students.length;
    const avgOverall =
        totalStudents > 0
            ? roundVal(
                  students.reduce((acc, s) => acc + s.rata_rata, 0) /
                      totalStudents,
              )
            : 0;

    function roundVal(v: number) {
        return Math.round(v * 100) / 100;
    }

    return (
        <>
            <Head title="Master Rekap Penilaian Siswa" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* Top Bar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/materi">
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                                    Master Rekap Penilaian Siswa
                                </h1>
                                <p className="text-xs text-slate-500">
                                    Rekapitulasi biodata dan nilai siswa dari seluruh pertemuan
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleExport}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Tarik / Export Excel (CSV)
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Total Siswa Terdata
                                </CardTitle>
                                <Users className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">
                                    {totalStudents}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Total Pertemuan
                                </CardTitle>
                                <BookOpen className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">
                                    {pertemuanList.length} Pertemuan
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Rata-Rata Seluruh Siswa
                                </CardTitle>
                                <GraduationCap className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-emerald-600">
                                    {avgOverall}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter & Search Bar */}
                    <Card className="border-slate-200">
                        <CardContent className="p-4">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Cari nama, email, jurusan..."
                                            className="pl-9 text-xs"
                                        />
                                    </div>

                                    <div className="w-full sm:w-48">
                                        <Select
                                            value={kelasId}
                                            onValueChange={handleFilterChange}
                                        >
                                            <SelectTrigger className="text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                                                    <SelectValue placeholder="Semua Kelas" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Semua Kelas</SelectItem>
                                                {kelasList.map((k) => (
                                                    <SelectItem
                                                        key={k.id}
                                                        value={String(k.id)}
                                                    >
                                                        {k.nama_kelas}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button type="submit" variant="secondary" size="sm" className="text-xs font-semibold">
                                    Cari
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Master Table */}
                    <Card className="border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                        <th className="px-4 py-3 font-bold text-center w-12 border-r border-slate-200">
                                            No
                                        </th>
                                        <th className="px-4 py-3 font-bold border-r border-slate-200 min-w-[180px]">
                                            Nama Siswa
                                        </th>
                                        <th className="px-4 py-3 font-bold border-r border-slate-200 min-w-[100px]">
                                            Kelas
                                        </th>
                                        <th className="px-4 py-3 font-bold border-r border-slate-200 min-w-[120px]">
                                            Jurusan
                                        </th>

                                        {pertemuanList.map((p, idx) => (
                                            <th
                                                key={p.id}
                                                className="px-4 py-3 font-bold border-r border-slate-200 text-center min-w-[140px]"
                                            >
                                                <div>Pertemuan {idx + 1}</div>
                                                <div className="text-[10px] font-normal text-slate-500 truncate max-w-[140px]">
                                                    {p.judul}
                                                </div>
                                            </th>
                                        ))}

                                        <th className="px-4 py-3 font-bold text-center bg-emerald-50/70 text-emerald-900 min-w-[120px]">
                                            Rata-Rata Akhir
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5 + pertemuanList.length}
                                                className="px-4 py-8 text-center text-slate-400 italic"
                                            >
                                                Belum ada data siswa / penilaian
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map((s, idx) => (
                                            <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-200 font-medium">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200">
                                                    <p className="font-bold text-slate-900">
                                                        {s.nama}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                                        {s.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 font-semibold text-slate-700">
                                                    <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                                        {s.kelas}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 text-slate-600">
                                                    {s.jurusan}
                                                </td>

                                                {pertemuanList.map((p) => {
                                                    const pScore = s.pertemuan_scores[p.id];
                                                    const combined = pScore?.combined_score;

                                                    return (
                                                        <td
                                                            key={p.id}
                                                            className="px-3 py-3 border-r border-slate-200 text-center"
                                                        >
                                                            {combined !== null && combined !== undefined ? (
                                                                <div>
                                                                    <span
                                                                        className={`inline-block rounded-md px-2 py-1 font-bold text-xs ${
                                                                            combined >= 70
                                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                                : 'bg-amber-100 text-amber-800'
                                                                        }`}
                                                                    >
                                                                        {combined}
                                                                    </span>
                                                                    <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                                                                        {pScore.quiz_score !== null && (
                                                                            <span title="Nilai Quiz">
                                                                                Q: {pScore.quiz_score}
                                                                            </span>
                                                                        )}
                                                                        {pScore.tugas_score !== null && (
                                                                            <span title="Nilai Tugas">
                                                                                T: {pScore.tugas_score}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-300 font-semibold">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                <td className="px-4 py-3 text-center bg-emerald-50/40">
                                                    <span
                                                        className={`inline-block rounded-lg px-2.5 py-1 text-xs font-black ${
                                                            s.rata_rata >= 70
                                                                ? 'bg-emerald-600 text-white'
                                                                : s.rata_rata > 0
                                                                ? 'bg-amber-600 text-white'
                                                                : 'bg-slate-200 text-slate-500'
                                                        }`}
                                                    >
                                                        {s.rata_rata}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

MateriPenilaian.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Rekap Penilaian Siswa', href: '' },
    ],
};
