import { AlertTriangle, Expand, Loader2, Maximize2, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useLiveScreenViewer } from '@/hooks/use-live-screen-viewer';

type LiveScreenViewerModalProps = {
    open: boolean;
    onClose: () => void;
    roomName: string | null;
    hostName: string;
    materiJudul: string;
    pertemuanJudul: string;
};

export default function LiveScreenViewerModal({
    open,
    onClose,
    roomName,
    hostName,
    materiJudul,
    pertemuanJudul,
}: LiveScreenViewerModalProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');

    const { stream, isConnected, isConnecting, error, reconnect } = useLiveScreenViewer(
        roomName,
        open,
    );

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
        }
    }, [stream]);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                aria-describedby={undefined}
                className="max-w-5xl p-0 overflow-hidden rounded-2xl border-slate-800 bg-slate-950 text-white shadow-2xl sm:max-w-6xl"
            >
                <DialogTitle className="sr-only">
                    Live Screen - {materiJudul}
                </DialogTitle>

                <div ref={containerRef} className="relative flex flex-col bg-slate-950 w-full h-full min-h-[70vh] sm:min-h-[80vh]">
                    {/* Header Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 text-white backdrop-blur-md">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-extrabold text-white animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                                LIVE
                            </span>
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-slate-100">
                                    Layar Guru: {hostName}
                                </h3>
                                <p className="truncate text-[11px] text-slate-400">
                                    {materiJudul} • {pertemuanJudul}
                                </p>
                            </div>
                        </div>

                        {/* Top Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => setObjectFit((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
                                className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5 hidden sm:inline-flex"
                            >
                                <Maximize2 className="h-4 w-4" />
                                {objectFit === 'contain' ? 'Fit Screen' : 'Fill Screen'}
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={toggleFullscreen}
                                className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
                            >
                                <Expand className="h-4 w-4" />
                                Fullscreen
                            </Button>

                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={onClose}
                                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Stream Video Container */}
                    <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden min-h-[60vh]">
                        {isConnected && stream ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full max-h-[82vh] transition-all ${
                                    objectFit === 'contain' ? 'object-contain' : 'object-cover'
                                }`}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                                {isConnecting ? (
                                    <>
                                        <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
                                        <p className="text-sm font-semibold text-slate-300">
                                            Menghubungkan ke tayangan layar guru...
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Harap tunggu sebentar, stream WebRTC sedang dimuat.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-amber-400">
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-200">
                                            {error || 'Tayangan layar terputus atau guru mengakhiri sesi.'}
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={reconnect}
                                            variant="outline"
                                            className="mt-2 border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs gap-2"
                                        >
                                            <RefreshCw className="h-4 w-4" /> Hubungkan Ulang
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="flex items-center justify-between border-t border-slate-900 bg-slate-950 px-4 py-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`h-2 w-2 rounded-full ${
                                    isConnected ? 'bg-emerald-500' : isConnecting ? 'bg-amber-500 animate-ping' : 'bg-red-500'
                                }`}
                            />
                            Status Stream: {isConnected ? 'Terhubung (Direct WebRTC P2P)' : isConnecting ? 'Menghubungkan...' : 'Terputus'}
                        </span>
                        <span className="hidden sm:inline italic">
                            Protip: Gunakan tombol Fullscreen di pojok kanan atas untuk melihat detail software guru dengan lebih jelas.
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
