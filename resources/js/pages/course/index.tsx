import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, FileText, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type CourseItem = {
    id: number;
    judul: string;
    deskripsi: string | null;
    thumbnail: string | null;
    assign_to_all: boolean;
    class_levels: string[] | null;
    pertemuan_count: number;
    guru: string;
    is_active: boolean;
    created_at: string;
};

type Stats = { total: number };

export default function CourseIndex({
    courses,
    stats,
}: {
    courses: CourseItem[];
    stats: Stats;
}) {
    const { errors } = usePage().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);

    function executeDelete() {
        if (!deleteId) return;
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
                                    Kelola course dan pertemuan
                                </p>
                            </div>
                        </div>
                        <Link href="/materi/create">
                            <Button className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-700">
                                <Plus className="h-4 w-4" />
                                Tambah Course
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Total Course
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {stats.total}
                            </p>
                        </div>
                    </div>

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Daftar Course
                                </h2>
                            </div>
                        </div>
                        {courses.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {course.judul}
                                            </p>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                {course.pertemuan_count} pertemuan
                                                {course.class_levels
                                                    ? ` · Tingkat ${course.class_levels.join(', ')}`
                                                    : course.assign_to_all
                                                      ? ' · Semua tingkat'
                                                      : ''}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <Link
                                                href={`/materi/${course.id}/pertemuan`}
                                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                            <Link
                                                href={`/materi/${course.id}/edit`}
                                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteId(course.id)}
                                                className="rounded-lg border border-red-200 px-2 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada course
                                </p>
                                <p className="text-xs text-slate-400">
                                    Tambah course baru untuk memulai.
                                </p>
                                <Link href="/materi/create">
                                    <Button className="mt-2 bg-orange-600 text-white hover:bg-orange-700">
                                        <Plus className="mr-1 h-4 w-4" /> Tambah Course
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
                        <DialogTitle>Hapus Course</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus course ini? Semua pertemuan, section, quiz, dan file terkait juga akan dihapus.
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

CourseIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
    ],
};
