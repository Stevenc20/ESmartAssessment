import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ArrowLeft, Plus, Pencil, Trash2, Eye, FileText, HelpCircle, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type PertemuanItem = {
    id: number;
    judul: string;
    deskripsi: string | null;
    gambar: string | null;
    urutan: number;
    sections_count: number;
    quiz_count: number;
    files_count: number;
};

type CourseData = { id: number; judul: string };

export default function PertemuanIndex({
    course,
    pertemuanList,
}: {
    course: CourseData;
    pertemuanList: PertemuanItem[];
}) {
    const { errors } = usePage().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);

    function executeDelete() {
        if (!deleteId) return;
        router.delete(`/materi/${course.id}/pertemuan/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
        });
    }

    return (
        <>
            <Head title={`${course.judul} - Pertemuan`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                    <Link
                        href="/materi"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Course
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {course.judul}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Kelola pertemuan dalam course ini
                                </p>
                            </div>
                        </div>
                        <Link href={`/materi/${course.id}/pertemuan/create`}>
                            <Button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700">
                                <Plus className="h-4 w-4" />
                                Tambah Pertemuan
                            </Button>
                        </Link>
                    </div>

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    <div className="space-y-3">
                        {pertemuanList.length > 0 ? (
                            pertemuanList.map((p) => (
                                <div
                                    key={p.id}
                                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-bold text-orange-700">
                                        {p.urutan}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {p.judul}
                                        </p>
                                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                {p.sections_count} section
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <HelpCircle className="h-3 w-3" />
                                                {p.quiz_count} quiz
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Paperclip className="h-3 w-3" />
                                                {p.files_count} file
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <Link
                                            href={`/materi/${course.id}/pertemuan/${p.id}/edit`}
                                            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteId(p.id)}
                                            className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada pertemuan
                                </p>
                                <p className="text-xs text-slate-400">
                                    Tambah pertemuan pertama untuk course ini.
                                </p>
                                <Link href={`/materi/${course.id}/pertemuan/create`}>
                                    <Button className="mt-2 bg-orange-600 text-white hover:bg-orange-700">
                                        <Plus className="mr-1 h-4 w-4" /> Tambah Pertemuan
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pertemuan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus pertemuan ini? Semua section, quiz, dan file terkait juga akan dihapus.
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

PertemuanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Pertemuan', href: '#' },
    ],
};
