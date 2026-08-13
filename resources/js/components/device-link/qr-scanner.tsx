import { Loader2, ScanLine, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const html5QrcodeLibPromise = import('html5-qrcode');

type Props = {
    onDecoded: (payload: { type: string; token: string; expires_at: string }) => void;
    onClose: () => void;
};

export default function QrScanner({ onDecoded, onClose }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
    const [starting, setStarting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const decodedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        async function start() {
            try {
                const { Html5Qrcode } = await html5QrcodeLibPromise;

                if (cancelled || !containerRef.current) {
return;
}

                const scanner = new Html5Qrcode(containerRef.current.id);
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        if (decodedRef.current) {
return;
}

                        decodedRef.current = true;

                        try {
                            const payload = JSON.parse(decodedText);

                            if (payload?.type === 'esmart-device-link' && payload?.token) {
                                scanner.stop().catch(() => {});
                                onDecoded(payload);
                            } else {
                                decodedRef.current = false;
                            }
                        } catch {
                            decodedRef.current = false;
                        }
                    },
                    () => {},
                );

                if (!cancelled) {
setStarting(false);
}
            } catch (err: any) {
                if (!cancelled) {
                    setError(
                        err?.name === 'NotAllowedError'
                            ? 'Izin kamera ditolak. Aktifkan kamera pada perangkat Anda.'
                            : 'Tidak dapat mengakses kamera. Pastikan kamera tersedia dan izin diberikan.',
                    );
                    setStarting(false);
                }
            }
        }

        start();

        return () => {
            cancelled = true;

            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current.clear();
            }
        };
    }, [onDecoded]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-black">
                <div ref={containerRef} id="device-link-scanner" className="aspect-square w-full" />
                {starting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                        <span className="text-sm">Menyalakan kamera…</span>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
                        <ScanLine className="h-8 w-8 text-red-400" />
                        <p className="text-sm text-white">{error}</p>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Tutup
                        </Button>
                    </div>
                )}
                {!error && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-48 w-48 rounded-xl border-2 border-white/70" />
                    </div>
                )}
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Batalkan
            </Button>
        </div>
    );
}
