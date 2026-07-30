import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Eye,
    FileSpreadsheet,
    Filter,
    GraduationCap,
    Mail,
    Phone,
    Search,
    User as UserIcon,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    no_hp: string;
    foto: string | null;
    kelas: string;
    jurusan: string;
    status: string;
    created_at: string;
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
    const [selectedStudent, setSelectedStudent] = useState<StudentMatrixItem | null>(null);

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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm shrink-0"
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

                    {/* Filter & Search Bar - Sleek Professional Toolbar */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
                        >
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, email, no HP, jurusan..."
                                    className="h-9 pl-9 text-xs border-slate-200 focus-visible:ring-blue-500"
                                />
                            </div>

                            {/* Filter Select */}
                            <div className="w-full sm:w-56 shrink-0">
                                <Select
                                    value={kelasId}
                                    onValueChange={handleFilterChange}
                                >
                                    <SelectTrigger className="h-9 w-full text-xs border-slate-200 bg-white">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
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

                            <Button type="submit" size="sm" variant="secondary" className="h-9 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 shrink-0">
                                Cari Data
                            </Button>
                        </form>
                    </div>

                    {/* Master Table */}
                    <Card className="border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                                        <th className="px-4 py-3.5 font-bold text-center w-12 border-r border-slate-200">
                                            No
                                        </th>
                                        <th className="px-4 py-3.5 font-bold border-r border-slate-200 min-w-[200px]">
                                            Nama Siswa
                                        </th>
                                        <th className="px-4 py-3.5 font-bold border-r border-slate-200 min-w-[130px]">
                                            No. Telepon / HP
                                        </th>
                                        <th className="px-4 py-3.5 font-bold border-r border-slate-200 min-w-[90px]">
                                            Kelas
                                        </th>
                                        <th className="px-4 py-3.5 font-bold border-r border-slate-200 min-w-[110px]">
                                            Jurusan
                                        </th>

                                        {pertemuanList.map((p, idx) => (
                                            <th
                                                key={p.id}
                                                className="px-4 py-3.5 font-bold border-r border-slate-200 text-center min-w-[130px]"
                                            >
                                                <div>Pertemuan {idx + 1}</div>
                                                <div className="text-[10px] font-normal text-slate-500 truncate max-w-[130px]">
                                                    {p.judul}
                                                </div>
                                            </th>
                                        ))}

                                        <th className="px-4 py-3.5 font-bold text-center bg-emerald-50/70 text-emerald-900 min-w-[120px]">
                                            Rata-Rata Akhir
                                        </th>
                                        <th className="px-3 py-3.5 font-bold text-center min-w-[80px]">
                                            Biodata
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {students.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6 + pertemuanList.length}
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
                                                    <div className="flex items-center gap-2.5">
                                                        {s.foto ? (
                                                            <img
                                                                src={s.foto}
                                                                alt={s.nama}
                                                                className="h-8 w-8 rounded-full object-cover shrink-0 border"
                                                            />
                                                        ) : (
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs shrink-0">
                                                                {s.nama.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedStudent(s)}
                                                                className="font-bold text-slate-900 hover:text-blue-600 text-left transition-colors truncate block max-w-[170px]"
                                                            >
                                                                {s.nama}
                                                            </button>
                                                            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                                                                {s.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 text-slate-700 font-medium">
                                                    {s.no_hp !== '-' ? (
                                                        <a
                                                            href={`https://wa.me/${s.no_hp.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                                                        >
                                                            <Phone className="h-3 w-3 text-emerald-600" />
                                                            {s.no_hp}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 font-semibold text-slate-700">
                                                    <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                                        {s.kelas}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-r border-slate-200 text-slate-600 font-medium">
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
                                                <td className="px-3 py-3 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedStudent(s)}
                                                        className="h-7 px-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 mr-1" />
                                                        Detail
                                                    </Button>
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

            {/* Student Biodata Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                {selectedStudent && (
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                <UserIcon className="h-5 w-5 text-blue-600" />
                                Detail Biodata Siswa
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Informasi profil pendaftaran dan rekap nilai siswa.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            {/* Profile Header */}
                            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                                {selectedStudent.foto ? (
                                    <img
                                        src={selectedStudent.foto}
                                        alt={selectedStudent.nama}
                                        className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xl shadow-sm">
                                        {selectedStudent.nama.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {selectedStudent.nama}
                                    </h3>
                                    <p className="text-xs text-slate-500">{selectedStudent.email}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                            Kelas {selectedStudent.kelas}
                                        </span>
                                        <span className="inline-flex rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                            {selectedStudent.jurusan}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                        Nomor Telepon / HP:
                                    </span>
                                    {selectedStudent.no_hp !== '-' ? (
                                        <a
                                            href={`https://wa.me/${selectedStudent.no_hp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold text-emerald-600 hover:underline"
                                        >
                                            {selectedStudent.no_hp}
                                        </a>
                                    ) : (
                                        <span className="font-semibold text-slate-400">Belum diisi</span>
                                    )}
                                </div>

                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                        Email Akun:
                                    </span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
                                </div>

                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
                                        Status Akun:
                                    </span>
                                    <span className="font-bold text-emerald-600 capitalize">
                                        {selectedStudent.status}
                                    </span>
                                </div>

                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        Tanggal Mendaftar:
                                    </span>
                                    <span className="font-semibold text-slate-800">{selectedStudent.created_at}</span>
                                </div>

                                <div className="flex justify-between py-1.5">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                                        Rata-Rata Nilai Akhir:
                                    </span>
                                    <span className="font-black text-sm text-emerald-600">
                                        {selectedStudent.rata_rata}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
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
