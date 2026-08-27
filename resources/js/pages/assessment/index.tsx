import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    Trophy,
    XCircle,
    UploadCloud,
} from 'lucide-react';

type Assessment = {
    id: number;
    judul: string;
    deskripsi: string;
    materi: string;
    materi_id: number;
    pertemuan: string;
    pertemuan_id: number;
    roadmap: string;
    deadline: string;
    deadline_passed: boolean;
    bobot: number;
    max_revisi: number;
    status: 'tersedia' | 'dikirim' | 'dinilai' | 'terlewat';
    nilai: number | null;
    submitted_at: string | null;
};

const statusConfig: Record<
    string,
    { icon: typeof Clock; label: string; color: string; bg: string }
> = {
    tersedia: {
        icon: Clock,
        label: 'Belum Dikerjakan',
        color: '#436391',
        bg: 'bg-blue-50',
    },
    dikirim: {
        icon: CheckCircle2,
        label: 'Dikirim',
        color: '#d97706',
        bg: 'bg-amber-50',
    },
    dinilai: {
        icon: Trophy,
        label: 'Dinilai',
        color: '#059669',
        bg: 'bg-emerald-50',
    },
    terlewat: {
        icon: XCircle,
        label: 'Terlewat',
        color: '#dc2626',
        bg: 'bg-red-50',
    },
};

export default function AssessmentIndex({
    assessments,
}: {
    assessments: Assessment[];
}) {
    const [uploadTarget, setUploadTarget] = useState<Assessment | null>(null);
    const { data, setData, post, processing, reset } = useForm<{
        file_tugas: File | null;
    }>({
        file_tugas: null,
    });
    const [fileName, setFileName] = useState<string | null>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        setData('file_tugas', file || null);
        setFileName(file?.name ?? null);
    }

    function submitUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!uploadTarget || !data.file_tugas) return;
        post(`/materi-saya/tugas/${uploadTarget.id}/submit`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setUploadTarget(null);
                setFileName(null);
                reset();
            },
        });
    }

    const total = assessments.length;
    const tersedia = assessments.filter((a) => a.status === 'tersedia').length;
    const dikirim = assessments.filter((a) => a.status === 'dikirim').length;
    const dinilai = assessments.filter((a) => a.status === 'dinilai').length;
    const terlewat = assessments.filter((a) => a.status === 'terlewat').length;

    return (
        <>
            <Head title="Assessment" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Assessment
                            </h1>
                            <p className="text-sm text-slate-500">
                                Daftar tugas dan assessment yang tersedia
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { label: 'Total', value: total, color: '#436391' },
                            {
                                label: 'Belum Dikerjakan',
                                value: tersedia,
                                color: '#436391',
                            },
                            {
                                label: 'Dikirim',
                                value: dikirim,
                                color: '#d97706',
                            },
                            {
                                label: 'Dinilai',
                                value: dinilai,
                                color: '#059669',
                            },
                            {
                                label: 'Terlewat',
                                value: terlewat,
                                color: '#dc2626',
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                    {s.label}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* List */}
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Daftar Assessment
                                </h2>
                            </div>
                        </div>
                        {assessments.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {Object.entries(
                                    assessments.reduce((acc, a) => {
                                        const key = a.pertemuan !== '-' && a.pertemuan 
                                            ? `${a.pertemuan} - ${a.roadmap}`
                                            : 'Lainnya';
                                        if (!acc[key]) acc[key] = [];
                                        acc[key].push(a);
                                        return acc;
                                    }, {} as Record<string, Assessment[]>)
                                ).map(([groupKey, groupAssessments]) => (
                                    <div key={groupKey} className="pb-2 last:pb-0">
                                        <div className="bg-slate-50 px-5 py-2.5 border-y border-slate-100 first:border-t-0">
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                                <BookOpen className="h-3.5 w-3.5 opacity-60" />
                                                {groupKey}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {groupAssessments.map((assessment) => {
                                                const cfg = statusConfig[assessment.status];
                                                const StatusIcon = cfg.icon;

                                                return (
                                                    <div
                                                        key={assessment.id}
                                                        className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                                    {assessment.judul}
                                                                </p>
                                                                <span
                                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${cfg.bg}`}
                                                                    style={{ color: cfg.color }}
                                                                >
                                                                    <StatusIcon className="h-3 w-3" />
                                                                    {cfg.label}
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                                Materi: {assessment.materi} &middot; Bobot {assessment.bobot} &middot; Max revisi {assessment.max_revisi}
                                                            </p>
                                                            {assessment.deskripsi && (
                                                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                                                    {assessment.deskripsi}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {assessment.deadline}
                                                            </div>
                                                            {assessment.nilai != null && (
                                                                <span className="font-bold text-emerald-600">
                                                                    {assessment.nilai}
                                                                </span>
                                                            )}
                                                            {assessment.submitted_at && (
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    {assessment.submitted_at}
                                                                </div>
                                                            )}
                                                            {assessment.status === 'tersedia' && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setUploadTarget(assessment);
                                                                            setFileName(null);
                                                                            reset();
                                                                        }}
                                                                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-violet-700"
                                                                    >
                                                                        Upload
                                                                    </button>
                                                                    <Link
                                                                        href={`/materi-saya/${assessment.materi_id}#penugasan-section`}
                                                                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                                                                    >
                                                                        Buka Materi
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada assessment
                                </p>
                                <p className="text-xs text-slate-400">
                                    Assessment akan muncul di sini setelah guru
                                    membuatnya.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog
                open={uploadTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUploadTarget(null);
                        setFileName(null);
                        reset();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Tugas</DialogTitle>
                    </DialogHeader>
                    {uploadTarget && (
                        <div className="flex flex-col gap-4">
                            <div className="rounded-lg bg-slate-50 p-3 text-sm">
                                <p className="font-semibold text-slate-800">
                                    {uploadTarget.judul}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Materi: {uploadTarget.materi}
                                </p>
                            </div>
                            
                            <form onSubmit={submitUpload} className="flex flex-col gap-4">
                                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                            <UploadCloud className="h-5 w-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Pilih file tugas Anda
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                PDF, DOC, DOCX, ZIP, JPG, PNG (Max. 10MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            onChange={handleFile}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                                        >
                                            Browse File
                                        </label>
                                        {fileName && (
                                            <p className="mt-2 truncate max-w-full text-xs font-medium text-blue-600">
                                                Terpilih: {fileName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setUploadTarget(null)}
                                        className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!data.file_tugas || processing}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Mengupload...' : 'Submit Tugas'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

AssessmentIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessment', href: '/assessment' },
    ],
};
