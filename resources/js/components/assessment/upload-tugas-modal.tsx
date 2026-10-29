import { useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Clock,
    UploadCloud,
    X,
    Plus,
    Download,
    AlertCircle,
} from 'lucide-react';

export type SubmissionFile = {
    path: string;
    name: string;
    size: number | null;
    ext: string;
    url: string;
};

export type TargetTugas = {
    id: number;
    judul: string;
    deskripsi?: string | null;
    materi?: string;
    bobot?: number | string;
    max_revisi?: number;
    revisi_ke?: number;
    status: 'tersedia' | 'dikirim' | 'dinilai' | 'terlewat';
    files?: SubmissionFile[];
};

function formatBytes(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1,
    );
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getFileBadgeColor(ext: string): { bg: string; text: string } {
    const e = ext.toLowerCase();
    if (['psd', 'psb'].includes(e)) return { bg: 'bg-blue-100', text: 'text-blue-800' };
    if (['ai', 'eps'].includes(e)) return { bg: 'bg-amber-100', text: 'text-amber-800' };
    if (['svg', 'cdr', 'fig', 'sketch', 'xd'].includes(e)) return { bg: 'bg-purple-100', text: 'text-purple-800' };
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(e)) return { bg: 'bg-emerald-100', text: 'text-emerald-800' };
    if (['pdf'].includes(e)) return { bg: 'bg-red-100', text: 'text-red-800' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return { bg: 'bg-indigo-100', text: 'text-indigo-800' };
    return { bg: 'bg-slate-100', text: 'text-slate-700' };
}

interface UploadTugasModalProps {
    target: TargetTugas | null;
    open: boolean;
    onClose: () => void;
    onSuccessCallback?: () => void;
}

export default function UploadTugasModal({
    target,
    open,
    onClose,
    onSuccessCallback,
}: UploadTugasModalProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { setData, post, processing, reset, errors, clearErrors } = useForm<{
        files: File[];
    }>({
        files: [],
    });

    const handleClose = () => {
        setSelectedFiles([]);
        clearErrors();
        reset();
        setUploadProgress(0);
        onClose();
    };

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
        if (!target || selectedFiles.length === 0) return;

        post(`/materi-saya/tugas/${target.id}/submit`, {
            preserveScroll: true,
            forceFormData: true,
            onProgress: (p) => setUploadProgress(p?.percentage ?? 0),
            onSuccess: () => {
                handleClose();
                onSuccessCallback?.();
            },
            onFinish: () => setUploadProgress(0),
        });
    }

    const totalSelectedSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) handleClose();
            }}
        >
            <DialogContent
                className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-slate-900">
                        {target?.status === 'tersedia'
                            ? 'Upload Tugas Assessment'
                            : `Upload Revisi Tugas (Revisi ke-${(target?.revisi_ke ?? 0) + 1})`}
                    </DialogTitle>
                </DialogHeader>
                {target && (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-lg bg-slate-50 p-3 text-sm border border-slate-100">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-slate-800">
                                        {target.judul}
                                    </p>
                                    {target.materi && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Materi: {target.materi}
                                        </p>
                                    )}
                                </div>
                                {(target.bobot !== undefined || target.max_revisi !== undefined) && (
                                    <div className="text-right text-xs text-slate-500 shrink-0">
                                        {target.bobot !== undefined && (
                                            <p>Bobot: <span className="font-bold text-slate-700">{target.bobot}</span></p>
                                        )}
                                        {target.max_revisi !== undefined && (
                                            <p>Maks. Revisi: <span className="font-bold text-slate-700">{target.max_revisi}</span></p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Previous Submissions if revising */}
                        {target.files && target.files.length > 0 && (
                            <div className="rounded-lg bg-amber-50/60 border border-amber-200/70 p-3 text-xs">
                                <p className="font-semibold text-amber-900 mb-1 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-amber-700" />
                                    File Pengiriman Sebelumnya (Revisi ke-{target.revisi_ke ?? 0}):
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {target.files.map((pf, pidx) => (
                                        <a
                                            key={pidx}
                                            href={pf.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={pf.name}
                                            className="inline-flex items-center gap-1 rounded bg-white border border-amber-200 px-2 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100/60 transition-colors"
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
                                    onClick={handleClose}
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
                                        : target.status === 'tersedia'
                                        ? `Submit Tugas (${selectedFiles.length} File)`
                                        : `Submit Revisi (${selectedFiles.length} File)`}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
