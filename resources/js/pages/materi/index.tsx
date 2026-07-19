import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronRight, Download, ExternalLink, FileText, Image, Pencil, Plus, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
    pertemuan: string;
    roadmap: string;
    created_by: string;
    created_at: string;
};

type Stats = { total: number };

export default function MateriIndex({ materiList, stats }: { materiList: MateriItem[]; stats: Stats }) {
    const { errors } = usePage().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    function executeDelete() {
        if (!deleteId) return;
        router.delete(`/materi/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    }

    function toggleExpand(id: number) {
        setExpandedId(prev => (prev === id ? null : id));
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
                                <h1 className="text-xl font-bold text-slate-900">Materi Pembelajaran</h1>
                                <p className="text-sm text-slate-500">Kelola materi pembelajaran untuk siswa</p>
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
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Materi</p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* List */}
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">Daftar Materi</h2>
                            </div>
                        </div>
                        {materiList.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {materiList.map((materi) => {
                                    const isOpen = expandedId === materi.id;
                                    return (
                                        <div key={materi.id}>
                                            <button
                                                onClick={() => toggleExpand(materi.id)}
                                                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                                            >
                                                <div className="flex shrink-0 items-center gap-2">
                                                    {isOpen ? (
                                                        <ChevronDown className="h-4 w-4 text-slate-400" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                                    )}
                                                    {materi.thumbnail ? (
                                                        <img src={materi.thumbnail} alt="" className="h-10 w-16 rounded-lg object-cover" />
                                                    ) : (
                                                        <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-orange-50 text-orange-300">
                                                            <Image className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-900">{materi.judul}</p>
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                        {materi.pertemuan} · {materi.roadmap} · oleh {materi.created_by} · {materi.created_at}
                                                    </p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                                    {materi.video_embed_url && (
                                                        <span className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600">
                                                            <Video className="h-3.5 w-3.5" />
                                                        </span>
                                                    )}
                                                    {materi.pdf_file && (
                                                        <a href={materi.pdf_file} target="_blank" rel="noopener noreferrer"
                                                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                                                            <Download className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                    {materi.drive_link && (
                                                        <a href={materi.drive_link} target="_blank" rel="noopener noreferrer"
                                                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                    <Link href={`/materi/${materi.id}/edit`}
                                                        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button onClick={() => setDeleteId(materi.id)}
                                                        className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                                                    {materi.deskripsi && (
                                                        <p className="mb-3 text-sm text-slate-600">{materi.deskripsi}</p>
                                                    )}
                                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                        {materi.video_embed_url && (
                                                            <div className="overflow-hidden rounded-lg bg-black">
                                                                <iframe
                                                                    src={materi.video_embed_url}
                                                                    title={materi.judul}
                                                                    className="aspect-video w-full"
                                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                    allowFullScreen
                                                                />
                                                            </div>
                                                        )}
                                                        {materi.pdf_file && (
                                                            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
                                                                <Download className="h-8 w-8 text-slate-400" />
                                                                <p className="text-sm font-semibold text-slate-600">File Materi</p>
                                                                <p className="text-xs text-slate-400">{materi.pdf_file_name}</p>
                                                                <a href={materi.pdf_file} target="_blank" rel="noopener noreferrer"
                                                                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-700">
                                                                    <Download className="h-3.5 w-3.5" />
                                                                    Download
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">Belum ada materi</p>
                                <p className="text-xs text-slate-400">
                                    Tambah materi pembelajaran baru.
                                </p>
                                <Link href="/materi/create">
                                    <Button className="mt-2 bg-orange-600 text-white hover:bg-orange-700">
                                        <Plus className="mr-1 h-4 w-4" /> Tambah Materi
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Materi</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus materi ini? Data terkait juga akan dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
                        <Button variant="destructive" onClick={executeDelete}>Hapus</Button>
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
