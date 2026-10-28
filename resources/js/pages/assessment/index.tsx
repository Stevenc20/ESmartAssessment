import { Head, Link, useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
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
    X,
    Plus,
    Paperclip,
    Download,
    AlertCircle,
} from 'lucide-react';

type SubmissionFile = {
    path: string;
    name: string;
    size: number | null;
    ext: string;
    url: string;
};

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
    revisi_ke: number;
    can_submit: boolean;
    status: 'tersedia' | 'dikirim' | 'dinilai' | 'terlewat';
    nilai: number | null;
    feedback?: string | null;
    file_tugas: string | null;
    files: SubmissionFile[];
    submitted_at: string | null;
    submitted_at_full?: string | null;
    is_late?: boolean;
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

function formatBytes(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileBadgeColor(ext: string): { bg: string; text: string } {
    const e = ext.toLowerCase();
    if (['psd', 'psb'].includes(e)) return { bg: 'bg-sky-100', text: 'text-sky-800' };
    if (['ai', 'eps', 'indd'].includes(e)) return { bg: 'bg-amber-100', text: 'text-amber-800' };
    if (['svg', 'cdr', 'fig', 'sketch', 'xd'].includes(e)) return { bg: 'bg-purple-100', text: 'text-purple-800' };
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(e)) return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
    if (['pdf'].includes(e)) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
    return { bg: 'bg-slate-100', text: 'text-slate-700' };
}

export default function AssessmentIndex({
    assessments,
}: {
    assessments: Assessment[];
}) {
    const [uploadTarget, setUploadTarget] = useState<Assessment | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        files: File[];
    }>({
        files: [],
    });

    function addFiles(newFiles: FileList | File[]) {
        const fileArr = Array.from(newFiles);
        clearErrors();
        setSelectedFiles((prev) => {
            const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`));
            const filtered = fileArr.filter(
                (f) => !existingKeys.has(`${f.name}-${f.size}`)
            );
            const updated = [...prev, ...filtered];
            setData('files', updated);
            return updated;
        });
    }

    function removeFile(index: number) {
        setSelectedFiles((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            setData('files', updated);
            return updated;
        });
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    }

    function submitUpload(e: React.FormEvent) {
        e.preventDefault();
        if (!uploadTarget || selectedFiles.length === 0) return;

        post(`/materi-saya/tugas/${uploadTarget.id}/submit`, {
            preserveScroll: true,
            forceFormData: true,
            onProgress: (p) => setUploadProgress(p?.percentage ?? 0),
            onSuccess: () => {
                setUploadTarget(null);
                setSelectedFiles([]);
                setUploadProgress(0);
                reset();
            },
            onFinish: () => setUploadProgress(0),
        });
    }

    const total = assessments.length;
    const tersedia = assessments.filter((a) => a.status === 'tersedia').length;
    const dikirim = assessments.filter((a) => a.status === 'dikirim').length;
    const dinilai = assessments.filter((a) => a.status === 'dinilai').length;
    const terlewat = assessments.filter((a) => a.status === 'terlewat').length;

    const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

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
                                        const key =
                                            a.pertemuan !== '-' && a.pertemuan
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
                                                                {assessment.revisi_ke > 0 && ` · (Revisi ke-${assessment.revisi_ke})`}
                                                            </p>
                                                            {assessment.deskripsi && (
                                                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                                                    {assessment.deskripsi}
                                                                </p>
                                                            )}

                                                            {/* Submitted Files Preview */}
                                                            {assessment.files && assessment.files.length > 0 && (
                                                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                                    <span className="text-[11px] font-medium text-slate-500">
                                                                        File terkirim ({assessment.files.length}):
                                                                    </span>
                                                                    {assessment.files.map((file, idx) => (
                                                                        <a
                                                                            key={idx}
                                                                            href={file.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download={file.name}
                                                                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                                        >
                                                                            <Paperclip className="h-3 w-3 text-slate-400" />
                                                                            <span className="max-w-[130px] truncate">{file.name}</span>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Feedback preview if available */}
                                                            {assessment.feedback && (
                                                                <div className="mt-2 rounded-lg bg-amber-50/80 border border-amber-200/60 px-3 py-1.5 text-xs text-amber-900">
                                                                    <span className="font-bold">Feedback Guru: </span>
                                                                    {assessment.feedback}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {assessment.deadline}
                                                            </div>
                                                            {assessment.nilai != null && (
                                                                <span className="font-bold text-emerald-600">
                                                                    Nilai: {assessment.nilai}
                                                                </span>
                                                            )}
                                                            {assessment.submitted_at && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="flex items-center gap-1 text-slate-600">
                                                                        <Clock className="h-3.5 w-3.5" />
                                                                        <span>{assessment.submitted_at_full || assessment.submitted_at}</span>
                                                                    </div>
                                                                    {assessment.is_late !== undefined && (
                                                                        <span
                                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                                assessment.is_late
                                                                                    ? 'bg-amber-100 text-amber-800'
                                                                                    : 'bg-emerald-100 text-emerald-800'
                                                                            }`}
                                                                        >
                                                                            {assessment.is_late ? 'Terlambat' : 'Tepat Waktu'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                {assessment.status === 'tersedia' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setUploadTarget(assessment);
                                                                            setSelectedFiles([]);
                                                                            clearErrors();
                                                                            reset();
                                                                        }}
                                                                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-violet-700 shadow-sm"
                                                                    >
                                                                        Upload Tugas
                                                                    </button>
                                                                )}
                                                                {assessment.status !== 'tersedia' && assessment.can_submit && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setUploadTarget(assessment);
                                                                            setSelectedFiles([]);
                                                                            clearErrors();
                                                                            reset();
                                                                        }}
                                                                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-700 shadow-sm"
                                                                    >
                                                                        Upload Revisi
                                                                    </button>
                                                                )}
                                                                <Link
                                                                    href={`/materi-saya/${assessment.materi_id}#penugasan-section`}
                                                                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
                                                                >
                                                                    Buka Materi
                                                                </Link>
                                                            </div>
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

            {/* Upload Modal (Multiple File Support like Google Drive) */}
            <Dialog
                open={uploadTarget !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setUploadTarget(null);
                        setSelectedFiles([]);
                        clearErrors();
                        reset();
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-slate-900">
                            {uploadTarget?.status === 'tersedia'
                                ? 'Upload Tugas Assessment'
                                : `Upload Revisi Tugas (Revisi ke-${(uploadTarget?.revisi_ke ?? 0) + 1})`}
                        </DialogTitle>
                    </DialogHeader>
                    {uploadTarget && (
                        <div className="flex flex-col gap-4">
                            <div className="rounded-lg bg-slate-50 p-3 text-sm border border-slate-100">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-slate-800">
                                            {uploadTarget.judul}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Materi: {uploadTarget.materi}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-slate-500">
                                        <p>Bobot: <span className="font-bold text-slate-700">{uploadTarget.bobot}</span></p>
                                        <p>Maks. Revisi: <span className="font-bold text-slate-700">{uploadTarget.max_revisi}</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Submissions if revising */}
                            {uploadTarget.files && uploadTarget.files.length > 0 && (
                                <div className="rounded-lg bg-amber-50/60 border border-amber-200/70 p-3 text-xs">
                                    <p className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                                        File Pengiriman Sebelumnya (Revisi ke-{uploadTarget.revisi_ke}):
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {uploadTarget.files.map((pf, pidx) => (
                                            <a
                                                key={pidx}
                                                href={pf.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={pf.name}
                                                className="inline-flex items-center gap-1 rounded bg-white border border-amber-200 px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100/60"
                                            >
                                                <Download className="h-3 w-3 text-amber-700" />
                                                <span className="max-w-[140px] truncate">{pf.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submitUpload} className="flex flex-col gap-4">
                                {/* Hidden multiple file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.rtf,.zip,.rar,.7z,.tar,.gz,.bz2,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg,.ico,.heic,.tif,.tiff,.psd,.psb,.ai,.eps,.indd,.cdr,.raw,.cr2,.nef,.sketch,.fig,.xd,.dng,.blend,.fbx,.obj,.mp4,.mov,.avi"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload-multiple"
                                />

                                {/* Drag & Drop Box */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                                        isDragging
                                            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                                            : 'border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center gap-2.5">
                                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                            <UploadCloud className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                Tarik & lepas file ke sini atau{' '}
                                                <span className="text-blue-600 hover:underline">
                                                    Pilih File
                                                </span>
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Bisa pilih sekaligus beberapa file (Google Drive style)
                                            </p>
                                        </div>
                                        <div className="mt-1 flex flex-wrap justify-center gap-1 max-w-sm text-[10px] text-slate-500">
                                            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">PSD, AI, EPS, SVG</span>
                                            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">JPG, PNG, WEBP</span>
                                            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">PDF, DOCX, ZIP, RAR</span>
                                            <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-medium text-slate-700">Maks. 250MB/file</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Error message */}
                                {errors.files && (
                                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
                                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                        <span>{errors.files}</span>
                                    </div>
                                )}

                                {/* Selected Files List */}
                                {selectedFiles.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                                            <span className="font-semibold">
                                                File Terpilih ({selectedFiles.length} file &middot; {formatBytes(totalSelectedSize)}):
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Tambah File
                                            </button>
                                        </div>

                                        <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                                            {selectedFiles.map((file, idx) => {
                                                const ext = file.name.split('.').pop() || '';
                                                const badge = getFileBadgeColor(ext);

                                                return (
                                                    <div
                                                        key={`${file.name}-${idx}`}
                                                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span
                                                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${badge.bg} ${badge.text}`}
                                                            >
                                                                {ext || 'FILE'}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-slate-800 max-w-[280px]">
                                                                    {file.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                                    <span>{formatBytes(file.size)}</span>
                                                                    <span>&bull;</span>
                                                                    <span className="text-emerald-600 font-medium">Siap diunggah</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(idx)}
                                                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                                                            title="Hapus file"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress Bar */}
                                {processing && uploadProgress > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-slate-600">
                                            <span>Mengupload file...</span>
                                            <span className="font-semibold">{uploadProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-200"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUploadTarget(null);
                                            setSelectedFiles([]);
                                            clearErrors();
                                            reset();
                                        }}
                                        disabled={processing}
                                        className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={selectedFiles.length === 0 || processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        {processing
                                            ? 'Mengupload...'
                                            : uploadTarget.status === 'tersedia'
                                            ? `Submit Tugas (${selectedFiles.length} File)`
                                            : `Submit Revisi (${selectedFiles.length} File)`}
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
