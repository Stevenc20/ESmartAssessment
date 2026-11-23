import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    GraduationCap,
    Mail,
    Pencil,
    Phone,
    RotateCcw,
    Search,
    ShieldAlert,
    UserCheck,
    Users,
    UserX,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type StudentItem = {
    id: number;
    name: string;
    email: string;
    no_hp: string;
    foto: string | null;
    kelas_id?: number | null;
    nama_kelas?: string;
    kelas_formatted?: string;
    tingkat?: string;
    jurusan?: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
};

type KelasItem = {
    id: number;
    nama_kelas: string;
    tingkat: string;
};

const JURUSAN_LIST = [
    { value: 'RPL_PPLG', label: 'RPL/PPLG' },
    { value: 'DKV_1', label: 'DKV 1' },
    { value: 'DKV_2', label: 'DKV 2' },
    { value: 'AKL', label: 'AKL' },
    { value: 'MPLB', label: 'MPLB' },
    { value: 'BisnisRitel', label: 'Bisnis Ritel' },
];

export default function DataSiswaGuruIndex({
    students,
    kelasList,
    filters,
}: {
    students: StudentItem[];
    kelasList: KelasItem[];
    filters: {
        kelas_id?: string;
        jurusan?: string;
        status?: string;
        search?: string;
    };
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [kelasId, setKelasId] = useState(filters.kelas_id ?? 'all');
    const [jurusan, setJurusan] = useState(filters.jurusan ?? 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');

    // Dialog state
    const [detailStudent, setDetailStudent] = useState<StudentItem | null>(null);
    const [editStudent, setEditStudent] = useState<StudentItem | null>(null);

    // Form edit state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        no_hp: '',
        kelas_id: '',
        jurusan: '',
        status: 'active',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    function handleFilterChange(newParams: Record<string, string>) {
        const current = {
            search,
            kelas_id: kelasId !== 'all' ? kelasId : '',
            jurusan: jurusan !== 'all' ? jurusan : '',
            status: statusFilter !== 'all' ? statusFilter : '',
            ...newParams,
        };

        const cleaned: Record<string, string> = {};
        Object.entries(current).forEach(([k, v]) => {
            if (v && v !== 'all') cleaned[k] = v;
        });

        router.get('/guru/siswa', cleaned, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleFilterChange({ search });
    }

    function handleResetFilters() {
        setSearch('');
        setKelasId('all');
        setJurusan('all');
        setStatusFilter('all');
        router.get('/guru/siswa', {}, { preserveScroll: true });
    }

    function openEditModal(student: StudentItem) {
        setEditStudent(student);
        setFormData({
            name: student.name,
            email: student.email,
            no_hp: student.no_hp && student.no_hp !== '-' ? student.no_hp : '',
            kelas_id: student.kelas_id ? String(student.kelas_id) : '',
            jurusan: student.jurusan && student.jurusan !== '-' ? student.jurusan : '',
            status: student.status || 'active',
        });
        setFormErrors({});
    }

    function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editStudent) return;

        setIsSubmitting(true);
        setFormErrors({});

        router.put(`/guru/siswa/${editStudent.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditStudent(null);
                setIsSubmitting(false);
            },
            onError: (errs) => {
                setFormErrors(errs);
                setIsSubmitting(false);
            },
        });
    }

    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'active').length;
    const inactiveStudents = totalStudents - activeStudents;

    return (
        <>
            <Head title="Data Siswa - Guru" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* Top Bar */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard">
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 md:text-2xl flex items-center gap-2">
                                    <Users className="h-6 w-6 text-blue-600" />
                                    Data Siswa
                                </h1>
                                <p className="text-xs text-slate-500">
                                    Kelola dan perbarui data profil, Gmail / email, kelas, jurusan, serta nomor HP siswa
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/penilaian-materi">
                                <Button variant="outline" size="sm" className="font-semibold text-xs gap-1.5">
                                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                                    Lihat Rekap Penilaian
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Total Siswa Terdaftar
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
                                    Siswa Aktif
                                </CardTitle>
                                <UserCheck className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-emerald-600">
                                    {activeStudents}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Siswa Pasif / Nonaktif
                                </CardTitle>
                                <UserX className="h-4 w-4 text-rose-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-rose-600">
                                    {inactiveStudents}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters & Search Toolbar */}
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
                                    placeholder="Cari nama siswa, Gmail / email, atau nomor HP..."
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>

                            {/* Filter Kelas */}
                            <div className="w-full sm:w-44">
                                <Select
                                    value={kelasId}
                                    onValueChange={(val) => {
                                        setKelasId(val);
                                        handleFilterChange({ kelas_id: val });
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Semua Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kelas</SelectItem>
                                        {kelasList.map((k) => (
                                            <SelectItem key={k.id} value={String(k.id)}>
                                                {k.nama_kelas}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Jurusan */}
                            <div className="w-full sm:w-40">
                                <Select
                                    value={jurusan}
                                    onValueChange={(val) => {
                                        setJurusan(val);
                                        handleFilterChange({ jurusan: val });
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Semua Jurusan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jurusan</SelectItem>
                                        {JURUSAN_LIST.map((j) => (
                                            <SelectItem key={j.value} value={j.value}>
                                                {j.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Status */}
                            <div className="w-full sm:w-36">
                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        handleFilterChange({ status: val });
                                    }}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Status Akun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-9 text-xs font-semibold px-3.5 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Cari
                                </Button>
                                {(search || kelasId !== 'all' || jurusan !== 'all' || statusFilter !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetFilters}
                                        className="h-9 text-xs px-2.5"
                                        title="Reset Filter"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table Data Siswa */}
                    <Card className="border-slate-200 overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/75">
                                        <th className="px-4 py-3 font-bold text-slate-700 w-12 text-center">
                                            No
                                        </th>
                                        <th className="px-4 py-3 font-bold text-slate-700 min-w-[220px]">
                                            Nama Siswa
                                        </th>
                                        <th className="px-4 py-3 font-bold text-slate-700 min-w-[200px]">
                                            Gmail / Akun Email
                                        </th>
                                        <th className="px-4 py-3 font-bold text-slate-700 min-w-[140px] text-center">
                                            Kelas & Jurusan
                                        </th>
                                        <th className="px-4 py-3 font-bold text-slate-700 min-w-[130px]">
                                            Nomor WhatsApp
                                        </th>
                                        <th className="px-4 py-3 font-bold text-slate-700 min-w-[100px] text-center">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 font-bold text-slate-700 w-28 text-center">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.length > 0 ? (
                                        students.map((s, idx) => {
                                            const isPasif = s.status !== 'active';

                                            return (
                                                <tr
                                                    key={s.id}
                                                    className="hover:bg-slate-50/60 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-center font-medium text-slate-500">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {s.foto ? (
                                                                <img
                                                                    src={s.foto}
                                                                    alt={s.name}
                                                                    className={`h-9 w-9 rounded-full object-cover shrink-0 border ${
                                                                        isPasif ? 'grayscale' : ''
                                                                    }`}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs shrink-0 ${
                                                                        isPasif
                                                                            ? 'bg-slate-200 text-slate-500'
                                                                            : 'bg-blue-100 text-blue-700'
                                                                    }`}
                                                                >
                                                                    {s.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 truncate">
                                                                    {s.name}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400">
                                                                    ID: #{s.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        <div className="flex items-center gap-1.5">
                                                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span className="font-medium text-slate-800 break-all">
                                                                {s.email}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                            {s.kelas_formatted || s.nama_kelas || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">
                                                        {s.no_hp && s.no_hp !== '-' ? (
                                                            <a
                                                                href={`https://wa.me/${s.no_hp.replace(/[^0-9]/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-emerald-700 hover:underline font-semibold flex items-center gap-1.5"
                                                            >
                                                                <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                                {s.no_hp}
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 italic">
                                                                Belum diisi
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                s.status === 'active'
                                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                            }`}
                                                        >
                                                            {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDetailStudent(s)}
                                                                className="h-7 px-2 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                                title="Lihat Detail"
                                                            >
                                                                <Eye className="h-3.5 w-3.5 mr-1" />
                                                                Detail
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditModal(s)}
                                                                className="h-7 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                                                title="Edit Data & Gmail"
                                                            >
                                                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="py-12 text-center text-slate-400"
                                            >
                                                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                                                <p className="font-semibold text-slate-600">
                                                    Tidak ada data siswa yang ditemukan
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Coba ganti kata kunci pencarian atau ubah filter kelas.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal Detail Siswa */}
            <Dialog
                open={!!detailStudent}
                onOpenChange={(open) => !open && setDetailStudent(null)}
            >
                {detailStudent && (
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                <Users className="h-5 w-5 text-blue-600" />
                                Informasi Lengkap Siswa
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Biodata terdaftar pada sistem E-SmartAssessment
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                {detailStudent.foto ? (
                                    <img
                                        src={detailStudent.foto}
                                        alt={detailStudent.name}
                                        className="h-12 w-12 rounded-full object-cover border"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                        {detailStudent.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">
                                        {detailStudent.name}
                                    </h4>
                                    <p className="text-xs text-slate-500">{detailStudent.email}</p>
                                    <span
                                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold mt-1 uppercase ${
                                            detailStudent.status === 'active'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-rose-100 text-rose-800'
                                        }`}
                                    >
                                        Status: {detailStudent.status}
                                    </span>
                                </div>
                            </div>

                            <div className="divide-y divide-slate-100 text-xs">
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500 font-medium">Kelas / Rombel:</span>
                                    <span className="font-bold text-slate-800">
                                        {detailStudent.nama_kelas || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500 font-medium">Format Kelas:</span>
                                    <span className="font-bold text-blue-700">
                                        {detailStudent.kelas_formatted || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500 font-medium">Jurusan:</span>
                                    <span className="font-semibold text-slate-800">
                                        {detailStudent.jurusan || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500 font-medium">Nomor WhatsApp:</span>
                                    <span className="font-semibold text-slate-800">
                                        {detailStudent.no_hp !== '-' ? detailStudent.no_hp : 'Belum diisi'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500 font-medium">Terdaftar Sejak:</span>
                                    <span className="font-semibold text-slate-800">
                                        {detailStudent.created_at}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDetailStudent(null)}
                                className="text-xs font-semibold"
                            >
                                Tutup
                            </Button>
                            <Button
                                onClick={() => {
                                    const s = detailStudent;
                                    setDetailStudent(null);
                                    openEditModal(s);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white gap-1.5"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit Siswa Ini
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

            {/* Modal Edit Data & Gmail Siswa */}
            <Dialog
                open={!!editStudent}
                onOpenChange={(open) => !open && setEditStudent(null)}
            >
                {editStudent && (
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                <Pencil className="h-5 w-5 text-emerald-600" />
                                Edit Data Siswa & Gmail
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Perbarui nama, alamat Gmail/email akun, kelas, jurusan, nomor HP, atau status aktif.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-1">
                            {/* Nama Siswa */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-700">
                                    Nama Lengkap Siswa *
                                </Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Masukkan nama lengkap siswa"
                                    className="h-9 text-xs"
                                    required
                                />
                                {formErrors.name && (
                                    <p className="text-[11px] text-rose-600 font-medium">
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Gmail / Email */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                                    <span>Gmail / Email Akun *</span>
                                    <span className="text-[10px] text-slate-400">
                                        Dipakai untuk login siswa
                                    </span>
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="contoh: nama.siswa@gmail.com"
                                        className="pl-9 h-9 text-xs"
                                        required
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="text-[11px] text-rose-600 font-medium">
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Kelas & Jurusan (2 Columns) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">
                                        Kelas
                                    </Label>
                                    <Select
                                        value={formData.kelas_id}
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, kelas_id: val })
                                        }
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Pilih kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kelasList.map((k) => (
                                                <SelectItem key={k.id} value={String(k.id)}>
                                                    {k.nama_kelas}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.kelas_id && (
                                        <p className="text-[11px] text-rose-600 font-medium">
                                            {formErrors.kelas_id}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-1.5">
                                    <Label className="text-xs font-semibold text-slate-700">
                                        Jurusan
                                    </Label>
                                    <Select
                                        value={formData.jurusan}
                                        onValueChange={(val) =>
                                            setFormData({ ...formData, jurusan: val })
                                        }
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Pilih jurusan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {JURUSAN_LIST.map((j) => (
                                                <SelectItem key={j.value} value={j.value}>
                                                    {j.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.jurusan && (
                                        <p className="text-[11px] text-rose-600 font-medium">
                                            {formErrors.jurusan}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Nomor WhatsApp / HP */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-700">
                                    Nomor Telepon / WhatsApp
                                </Label>
                                <div className="relative">
                                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        value={formData.no_hp}
                                        onChange={(e) =>
                                            setFormData({ ...formData, no_hp: e.target.value })
                                        }
                                        placeholder="08123456789"
                                        className="pl-9 h-9 text-xs"
                                    />
                                </div>
                                {formErrors.no_hp && (
                                    <p className="text-[11px] text-rose-600 font-medium">
                                        {formErrors.no_hp}
                                    </p>
                                )}
                            </div>

                            {/* Status Akun */}
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-semibold text-slate-700">
                                    Status Akun Siswa
                                </Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, status: val })
                                    }
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditStudent(null)}
                                    className="text-xs font-semibold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}
