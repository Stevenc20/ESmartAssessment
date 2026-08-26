import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Download,
    ExternalLink,
    FileText,
    Folder,
    Image,
    Link2,
    Pencil,
    Plus,
    Trash2,
    Video,
    Eye,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    folders?: { id: number; nama: string; file_count: number }[];
    files?: { id: number; nama: string }[];
    pertemuan: string;
    roadmap: string;
    created_by: string;
    created_at: string;
    tingkat?: string | null;
    is_live?: boolean;
    linked_to?: {
        id: number;
        judul: string;
        pertemuan: string;
        roadmap: string;
    } | null;
};

type Stats = { total: number };

export default function MateriIndex({
    materiList,
    stats,
}: {
    materiList: MateriItem[];
    stats: Stats;
}) {
    const { errors } = usePage().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const groupedMateri = materiList.reduce((acc, materi) => {
        const groupName = materi.pertemuan === '-' 
            ? 'Lainnya (Tanpa Pertemuan)' 
            : `${materi.roadmap} - ${materi.pertemuan}`;
        
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(materi);
        return acc;
    }, {} as Record<string, MateriItem[]>);

    function executeDelete() {
        if (!deleteId) {
            return;
        }

        router.delete(`/materi/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    }

    return (
        <>
            <Head title="Materi Pembelajaran" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Materi Pembelajaran
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Kelola materi pembelajaran untuk siswa
                                </p>
                            </div>
                        </div>
                        <Link href="/materi/create">
                            <Button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-700">
                                <Plus className="h-4 w-4" />
                                Tambah Materi
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Total Materi
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {stats.total}
                            </p>
                        </div>
                    </div>

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

                    {/* List */}
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Daftar Materi
                                </h2>
                            </div>
                        </div>
                        {Object.keys(groupedMateri).length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {Object.entries(groupedMateri).map(([groupName, materis]) => (
                                    <div key={groupName} className="pb-4">
                                        <div className="bg-slate-50 px-5 py-2 border-y border-slate-100 flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{groupName}</span>
                                            <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200">
                                                {materis.length} Materi
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                        {materis.map((materi) => (
                                    <div
                                        key={materi.id}
                                        className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        {/* Thumbnail */}
                                        <div className="shrink-0">
                                            {materi.thumbnail ? (
                                                <img
                                                    src={materi.thumbnail}
                                                    alt=""
                                                    className="h-12 w-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-orange-50 text-orange-300">
                                                    <Image className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Title & meta */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {materi.judul}
                                                </p>
                                                {materi.tingkat && (
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 shrink-0">
                                                        Kelas {materi.tingkat}
                                                    </span>
                                                )}
                                                {materi.is_live && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700 animate-pulse shrink-0">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
                                                        LIVE
                                                    </span>
                                                )}
                                                {materi.linked_to && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 shrink-0">
                                                        <Link2 className="h-3 w-3" />
                                                        Menautkan ke {materi.linked_to.judul}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                {materi.pertemuan} ·{' '}
                                                {materi.roadmap} · oleh{' '}
                                                {materi.created_by} ·{' '}
                                                {materi.created_at}
                                            </p>
                                            {materi.deskripsi && (
                                                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                                    {materi.deskripsi}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            {materi.video_embed_url && (
                                                <span className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600">
                                                    <Video className="h-3.5 w-3.5" />
                                                </span>
                                            )}
                                            {materi.pdf_file && (
                                                <a
                                                    href={materi.pdf_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                            {(materi.files?.length ?? 0) > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {materi.files?.length}
                                                </span>
                                            )}
                                            {(materi.folders?.length ?? 0) > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600">
                                                    <Folder className="h-3.5 w-3.5" />
                                                    {materi.folders?.length}
                                                </span>
                                            )}
                                            {materi.drive_link && (
                                                <a
                                                    href={materi.drive_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                            <Link
                                                href={`/materi/${materi.id}`}
                                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                            {!materi.linked_to && (
                                                <Link
                                                    href={`/materi/${materi.id}/edit`}
                                                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Link>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setDeleteId(materi.id)
                                                }
                                                className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    ))}
                                    </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada materi
                                </p>
                                <p className="text-xs text-slate-400">
                                    Tambah materi pembelajaran baru.
                                </p>
                                <Link href="/materi/create">
                                    <Button className="mt-2 bg-orange-600 text-white hover:bg-orange-700">
                                        <Plus className="mr-1 h-4 w-4" /> Tambah
                                        Materi
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <Dialog
                open={deleteId !== null}
                onOpenChange={(o) => {
                    if (!o) {
                        setDeleteId(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Materi</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus materi ini? Data
                            terkait juga akan dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={executeDelete}>
                            Hapus
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

MateriIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
    ],
};
