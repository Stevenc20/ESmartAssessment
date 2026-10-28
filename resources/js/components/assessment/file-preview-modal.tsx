import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Download,
    ZoomIn,
    ZoomOut,
    RotateCw,
    ExternalLink,
    FileText,
    FileSpreadsheet,
    FileArchive,
    FileQuestion,
    Eye,
} from 'lucide-react';

export type PreviewFile = {
    url: string;
    name: string;
    ext: string;
    size?: number | null;
};

interface FilePreviewModalProps {
    file: PreviewFile | null;
    isOpen: boolean;
    onClose: () => void;
}

function formatBytes(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function FilePreviewModal({
    file,
    isOpen,
    onClose,
}: FilePreviewModalProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    if (!file) return null;

    const ext = (file.ext || file.name.split('.').pop() || '').toLowerCase();

    const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'ico'].includes(ext);
    const isPdf = ext === 'pdf';
    const isVideo = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);
    const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);

    function resetView() {
        setZoom(1);
        setRotation(0);
    }

    function handleZoomIn() {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    }

    function handleZoomOut() {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
    }

    function handleRotate() {
        setRotation((prev) => (prev + 90) % 360);
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    resetView();
                    onClose();
                }
            }}
        >
            <DialogContent
                className="flex max-h-[92vh] w-[95vw] max-w-5xl flex-col gap-0 p-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
                onCloseAutoFocus={() => resetView()}
            >
                {/* Header */}
                <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-2.5 min-w-0 pr-8">
                        <span className="shrink-0 rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                            {ext || 'FILE'}
                        </span>
                        <div className="min-w-0 truncate">
                            <DialogTitle className="truncate text-sm font-bold text-slate-800">
                                {file.name}
                            </DialogTitle>
                            {file.size && file.size > 0 && (
                                <p className="text-[11px] text-slate-400">
                                    {formatBytes(file.size)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="flex items-center gap-1 sm:gap-2 mr-6">
                        {isImage && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleZoomIn}
                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    title="Perbesar (Zoom In)"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleZoomOut}
                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    title="Perkecil (Zoom Out)"
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRotate}
                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    title="Putar (Rotate)"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </button>
                                <div className="h-4 w-px bg-slate-200 mx-1" />
                            </>
                        )}

                        <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs"
                            title="Buka di tab baru"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Buka Tab</span>
                        </a>

                        <a
                            href={file.url}
                            download={file.name}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                            title="Download file"
                        >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                        </a>
                    </div>
                </DialogHeader>

                {/* Body Viewer */}
                <div className="relative flex min-h-[420px] max-h-[75vh] w-full flex-1 items-center justify-center overflow-auto bg-slate-900/95 p-2 sm:p-4">
                    {/* Image Viewer */}
                    {isImage && (
                        <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                            <img
                                src={file.url}
                                alt={file.name}
                                style={{
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    transition: 'transform 0.2s ease-in-out',
                                }}
                                className="max-h-[68vh] max-w-full rounded-md object-contain shadow-lg"
                            />
                        </div>
                    )}

                    {/* PDF Viewer */}
                    {isPdf && (
                        <div className="h-[72vh] w-full bg-white rounded-lg overflow-hidden">
                            <iframe
                                src={`${file.url}#toolbar=1&navpanes=1&scrollbar=1`}
                                title={file.name}
                                className="h-full w-full border-0"
                            />
                        </div>
                    )}

                    {/* Video Player */}
                    {isVideo && (
                        <div className="flex h-full w-full items-center justify-center p-2">
                            <video
                                src={file.url}
                                controls
                                className="max-h-[68vh] max-w-full rounded-lg shadow-lg"
                            >
                                Browser Anda tidak mendukung pemutaran video langsung.
                            </video>
                        </div>
                    )}

                    {/* Audio Player */}
                    {isAudio && (
                        <div className="flex flex-col items-center justify-center gap-4 p-8 text-white">
                            <p className="text-sm font-semibold">{file.name}</p>
                            <audio src={file.url} controls className="w-80" />
                        </div>
                    )}

                    {/* Fallback for Design Files & Office Docs (PSD, AI, EPS, DOCX, ZIP, etc) */}
                    {!isImage && !isPdf && !isVideo && !isAudio && (
                        <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 p-8 text-center text-slate-200 shadow-xl">
                            <div className="rounded-2xl bg-slate-700/80 p-4 text-blue-400">
                                {['psd', 'psb', 'ai', 'eps', 'indd'].includes(ext) ? (
                                    <FileQuestion className="h-10 w-10 text-amber-400" />
                                ) : ['doc', 'docx', 'txt', 'rtf'].includes(ext) ? (
                                    <FileText className="h-10 w-10 text-sky-400" />
                                ) : ['xls', 'xlsx', 'csv'].includes(ext) ? (
                                    <FileSpreadsheet className="h-10 w-10 text-emerald-400" />
                                ) : ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) ? (
                                    <FileArchive className="h-10 w-10 text-indigo-400" />
                                ) : (
                                    <FileQuestion className="h-10 w-10 text-slate-400" />
                                )}
                            </div>

                            <div>
                                <h4 className="text-base font-bold text-white">
                                    {file.name}
                                </h4>
                                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                                    Format <span className="font-semibold text-slate-200 uppercase">.{ext}</span> adalah file desain/dokumen khusus yang memerlukan aplikasi eksternal (seperti Adobe Photoshop, Illustrator, atau Office) untuk dibuka secara maksimal.
                                </p>
                            </div>

                            <div className="mt-2 flex flex-wrap justify-center gap-2">
                                <a
                                    href={file.url}
                                    download={file.name}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 shadow-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    Download File untuk Membuka
                                </a>
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-600"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Buka File Asli
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
