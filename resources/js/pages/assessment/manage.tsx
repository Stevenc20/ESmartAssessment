import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    FileText,
    GraduationCap,
    Pencil,
    Plus,
    Trash2,
    Users,
    BookOpen,
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

type Assessment = {
    id: number;
    judul: string;
    deskripsi: string;
    materi: string;
    deadline: string;
    deadline_passed: boolean;
    bobot: number;
    max_revisi: number;
    total_submissions: number;
    graded_submissions: number;
    ungraded_submissions: number;
};

type Stats = {
    total: number;
    total_submissions: number;
    ungraded: number;
};

export default function AssessmentManage({
    assessments,
    stats,
}: {
    assessments: Assessment[];
    stats: Stats;
}) {
    const { errors } = usePage().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete(id: number) {
        setDeleteId(id);
    }

    function executeDelete() {
        if (!deleteId) {
return;
}

        setDeleting(true);
        router.delete(`/assessment/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteId(null);
                setDeleting(false);
            },
            onError: () => setDeleting(false),
        });
    }

    return (
        <>
            <Head title="Assessment" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Assessment
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Kelola tugas dan assessment untuk siswa
                                </p>
                            </div>
                        </div>
                        <Link href="/assessment/create">
                            <Button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700">
                                <Plus className="h-4 w-4" />
                                Buat Assessment
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            {
                                label: 'Total Assessment',
                                value: stats.total,
                                color: '#436391',
                                icon: FileText,
                            },
                            {
                                label: 'Total Pengumpulan',
                                value: stats.total_submissions,
                                color: '#7c3aed',
                                icon: Users,
                            },
                            {
                                label: 'Belum Dinilai',
                                value: stats.ungraded,
                                color: '#d97706',
                                icon: GraduationCap,
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        {s.label}
                                    </p>
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                                        style={{
                                            backgroundColor: s.color + '18',
                                            color: s.color,
                                        }}
                                    >
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Success Message */}
                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* List */}
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Daftar Assessment
                                </h2>
                            </div>
                        </div>
                        {assessments.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {assessments.map((assessment) => (
                                    <div
                                        key={assessment.id}
                                        className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {assessment.judul}
                                                </p>
                                                {assessment.ungraded_submissions >
                                                    0 && (
                                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
                                                        {
                                                            assessment.ungraded_submissions
                                                        }{' '}
                                                        perlu dinilai
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                {assessment.materi} · Bobot{' '}
                                                {assessment.bobot}
                                                {assessment.deadline_passed &&
                                                    ' · Deadline terlewati'}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                {assessment.graded_submissions}/
                                                {assessment.total_submissions}{' '}
                                                dinilai
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {assessment.deadline}
                                            </div>
                                            <Link
                                                href={`/assessment/${assessment.id}/submissions`}
                                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                                            >
                                                Lihat Pengumpulan
                                            </Link>
                                            <Link
                                                href={`/assessment/${assessment.id}/edit`}
                                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    confirmDelete(assessment.id)
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                                <GraduationCap className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada assessment
                                </p>
                                <p className="text-xs text-slate-400">
                                    Buat assessment baru untuk mulai menilai
                                    siswa.
                                </p>
                                <Link href="/assessment/create">
                                    <Button className="mt-2 bg-emerald-600 text-white hover:bg-emerald-700">
                                        <Plus className="mr-1 h-4 w-4" /> Buat
                                        Assessment
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
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
                        <DialogTitle>Hapus Assessment</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus assessment ini?
                            Semua pengumpulan dan nilai terkait juga akan
                            dihapus. Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteId(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

AssessmentManage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessment', href: '/assessment' },
    ],
};
