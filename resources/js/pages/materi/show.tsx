import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Download,
    ExternalLink,
    FileText,
    Folder,
    Pencil,
    Trash2,
    User,
    Video,
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
import MateriForumChat, { type DiscussionItem } from '@/components/materi/materi-forum-chat';

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
    folders?: {
        id: number;
        nama: string;
        file_count: number;
        total_size: number;
        download_url: string;
    }[];
    files?: {
        id: number;
        nama: string;
        size: number;
        download_url: string;
    }[];
    pertemuan: string;
    roadmap: string;
    created_by: string;
    created_at: string;
    discussions?: DiscussionItem[];
};

function formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function MateriShow({
    materi,
}: {
    materi: MateriDetail;
}) {
    const { errors } = usePage().props;
    const [deleteOpen, setDeleteOpen] = useState(false);

    function executeDelete() {
        router.delete(`/materi/${materi.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteOpen(false);
                router.visit('/materi');
            },
        });
    }

    return (
        <>
            <Head title={materi.judul} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                    {/* Back */}
                    <Link
                        href="/materi"
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Materi
                    </Link>

                    {/* Flash Messages */}
                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* Header Card */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {/* Thumbnail */}
                        {materi.thumbnail && (
                            <div className="flex w-full items-center justify-center bg-slate-100">
                                <img
                                    src={materi.thumbnail}
                                    alt={materi.judul}
                                    className="mx-auto max-h-80 w-auto max-w-full object-contain"
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
                                            {materi.pertemuan}
                                        </span>
                                        <span>·</span>
                                        <span>{materi.roadmap}</span>
                                        <span>·</span>
                                        <span className="inline-flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" />
                                            {materi.created_by}
                                        </span>
                                        <span>·</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {materi.created_at}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 items-center gap-2">
                                    <Link href={`/materi/${materi.id}/edit`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="inline-flex items-center gap-1.5 text-xs"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setDeleteOpen(true)}
                                        className="inline-flex items-center gap-1.5 text-xs"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>

                            {/* Description */}
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
                                    <Video className="h-4 w-4 text-slate-500" />
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
                    {(materi.pdf_file ||
                        materi.drive_link ||
                        (materi.folders?.length ?? 0) > 0 ||
                        (materi.files?.length ?? 0) > 0) && (
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
                                        <span className="text-xs font-semibold text-orange-600">
                                            Download
                                        </span>
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
                                        <span className="text-xs font-semibold text-blue-600">
                                            Buka
                                        </span>
                                    </a>
                                )}
                                {materi.files?.map((f) => (
                                    <a
                                        key={f.id}
                                        href={f.download_url}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {f.nama}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {formatBytes(f.size)}
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-orange-600">
                                            Download
                                        </span>
                                    </a>
                                ))}
                                {materi.folders?.map((f) => (
                                    <a
                                        key={f.id}
                                        href={f.download_url}
                                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                                            <Folder className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-900">
                                                Download Folder · {f.nama}
                                            </p>
                                            <p className="truncate text-xs text-slate-400">
                                                {f.file_count} file · .zip
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-violet-600">
                                            Download
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Forum Diskusi */}
            {materi.discussions !== undefined && (
                <MateriForumChat
                    materiId={materi.id}
                    discussions={materi.discussions ?? []}
                    postUrl={`/materi/${materi.id}/discussion`}
                    deleteUrl={(id) => `/materi/discussions/${id}`}
                />
            )}

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Materi</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus materi &quot;{materi.judul}&quot;? Data
                            terkait juga akan dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
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

MateriShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
    ],
};
