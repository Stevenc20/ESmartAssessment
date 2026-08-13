import { Head } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    QrCode,
    Camera,
    CameraOff,
    Smartphone,
    HeartHandshake,
    Stethoscope,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

// Preload the QR decoder at module scope. When the user taps, `await` on this
// cached promise resolves in a microtask, so the iOS Safari user-gesture window
// is preserved all the way into the single getUserMedia() call inside start().
const html5QrcodeLibPromise = import('html5-qrcode');

type RiwayatItem = {
    id: number;
    pertemuan: string;
    roadmap: string;
    status: string;
    scan_time: string | null;
    tanggal: string;
};

type ActiveSession = {
    pertemuan_id: number;
    pertemuan: string;
    token: string;
    expired_at: string;
};

type Props = {
    stats: {
        total: number;
        hadir: number;
        terlambat: number;
        izin: number;
        sakit: number;
        alpa: number;
    };
    riwayat: RiwayatItem[];
    active_sessions: ActiveSession[];
};

const formatEndTime = (iso: string): string => {
    try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return '-';
    }
};

const cameraErrorMessage = (err: any): string => {
    const name = err?.name ?? '';
    if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        name === 'SecurityError'
    ) {
        return 'Akses kamera diblokir. Silakan aktifkan izin kamera di pengaturan browser HP Anda (ikon gembok / tanda titik tiga di dekat alamat website).';
    }
    if (
        name === 'NotFoundError' ||
        name === 'DevicesNotFoundError' ||
        name === 'OverconstrainedError'
    ) {
        return 'Kamera tidak ditemukan di perangkat ini.';
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
        return 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi.';
    }
    return err?.message || 'Kamera tidak dapat diakses.';
};

export default function AbsenIndex({ stats, riwayat, active_sessions }: Props) {
    const [scannerActive, setScannerActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [cameraErrorDetail, setCameraErrorDetail] = useState<string | null>(
        null,
    );
    const [polledSessions, setPolledSessions] =
        useState<ActiveSession[]>(active_sessions);
    const [autoScanning, setAutoScanning] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomMin, setZoomMin] = useState(1);
    const [zoomMax, setZoomMax] = useState(4);
    const zoomModeRef = useRef<'optical' | 'css'>('css');
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<any>(null);
    const scannerStartedRef = useRef(false);
    const autoStartDoneRef = useRef(false);
    const startScannerRef = useRef<() => void>(() => {});

    const applyCameraZoom = useCallback(
        async (nextZoom: number) => {
            const scanner = html5QrCodeRef.current;
            if (!scanner) return;

            const max = zoomModeRef.current === 'optical' ? zoomMax : 4;
            const min = zoomModeRef.current === 'optical' ? zoomMin : 1;
            const clamped = Math.min(max, Math.max(min, nextZoom));

            if (zoomModeRef.current === 'optical') {
                try {
                    await scanner.applyVideoConstraints({
                        advanced: [{ zoom: clamped }],
                    });
                } catch {
                    return;
                }
            } else {
                const el = scannerRef.current;
                if (el) {
                    el.style.transform = clamped > 1 ? `scale(${clamped})` : '';
                }
            }

            setZoomLevel(clamped);
        },
        [zoomMin, zoomMax],
    );

    const stopScanner = useCallback(async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch { /* scanner may already be stopped */ }

            try {
                await html5QrCodeRef.current.clear();
            } catch { /* scanner may already be cleared */ }

            html5QrCodeRef.current = null;
        }

        if (scannerRef.current) {
            scannerRef.current.style.transform = '';
        }

        scannerStartedRef.current = false;
        zoomModeRef.current = 'css';
        setZoomLevel(1);
        setZoomMin(1);
        setZoomMax(4);
    }, []);

    const startScanner = useCallback(
        async (fromUserGesture = false) => {
        if (scannerStartedRef.current) {
            return;
        }

        setCameraError(null);
        setCameraErrorDetail(null);
        setAutoScanning(false);

        try {
            if (window.self !== window.top) {
                throw new Error(
                    'Aplikasi dibuka di dalam bingkai/jendela. Buka langsung di browser (esmart.tantechstev.com) agar kamera dapat digunakan.',
                );
            }
            if (!window.isSecureContext) {
                throw new Error(
                    'Akses kamera hanya tersedia melalui koneksi HTTPS yang aman.',
                );
            }
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error(
                    'Perangkat ini tidak mendukung akses kamera (mediaDevices tidak tersedia).',
                );
            }

            const { Html5Qrcode } = await html5QrcodeLibPromise;

            // Clear any leftover instance/stream from a previous attempt so the
            // camera is not "busy" (NotReadableError) on the next start.
            if (html5QrCodeRef.current) {
                try { await html5QrCodeRef.current.stop(); } catch { /* ignore */ }
                try { await html5QrCodeRef.current.clear(); } catch { /* ignore */ }
                html5QrCodeRef.current = null;
            }

            scannerStartedRef.current = true;
            setScannerActive(true);

            // Reveal the viewfinder synchronously (no setTimeout) so Html5Qrcode
            // measures a non-zero container AND the iOS user gesture is preserved.
            // A macrotask here would end the gesture before getUserMedia() runs.
            scannerRef.current?.classList.remove('hidden');

            const scanner = new Html5Qrcode('qr-scanner-viewfinder');
            html5QrCodeRef.current = scanner;

            const onDecoded = (decodedText: string) => {
                const match = decodedText.match(/\/absen\/([a-zA-Z0-9]+)/);
                const token = match ? match[1] : null;

                if (token && scannerStartedRef.current) {
                    scannerStartedRef.current = false;
                    scanner.stop().catch(() => {});
                    setScannerActive(false);
                    window.location.href = `/absen/${token}`;
                }
            };

            const probeZoom = () => {
                try {
                    const zoomFeature = scanner
                        .getRunningTrackCameraCapabilities()
                        .zoomFeature();

                    if (zoomFeature.isSupported()) {
                        zoomModeRef.current = 'optical';
                        setZoomMin(zoomFeature.min());
                        setZoomMax(zoomFeature.max());
                        setZoomLevel(1);
                        scanner
                            .applyVideoConstraints({
                                advanced: [{ zoom: zoomFeature.min() }],
                            } as any)
                            .catch(() => {});
                        return;
                    }
                } catch { /* capabilities not ready yet */ }

                zoomModeRef.current = 'css';
                setZoomMin(1);
                setZoomMax(4);
                setZoomLevel(1);
            };

            // Prefer the back/environment camera, fall back to the default camera.
            // Using facingMode directly (not a cached deviceId) avoids
            // OverconstrainedError from stale device ids.
            const attempts: any[] = [{ facingMode: 'environment' }, {}];

            let lastErr: any = null;
            for (const config of attempts) {
                try {
                    scannerStartedRef.current = true;
                    await scanner.start(
                        config,
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        onDecoded,
                        () => {},
                    );
                    lastErr = null;
                    break;
                } catch (err: any) {
                    lastErr = err;
                    scannerStartedRef.current = false;
                    try { await scanner.stop(); } catch { /* ignore */ }
                    try { await scanner.clear(); } catch { /* ignore */ }
                }
            }

            if (lastErr) {
                throw lastErr;
            }

            probeZoom();
            setTimeout(probeZoom, 400);
        } catch (err: any) {
            scannerStartedRef.current = false;
            if (html5QrCodeRef.current) {
                try { await html5QrCodeRef.current.stop(); } catch { /* ignore */ }
                try { await html5QrCodeRef.current.clear(); } catch { /* ignore */ }
                html5QrCodeRef.current = null;
            }
            setScannerActive(false);

            const name = err?.name ?? '';
            const isDenied =
                name === 'NotAllowedError' ||
                name === 'PermissionDeniedError' ||
                name === 'SecurityError';

            setCameraErrorDetail(
                `${name || 'UnknownError'}: ${err?.message || ''}`,
            );
            console.error('[absen-camera]', err);

            setCameraError(
                isDenied && !fromUserGesture
                    ? 'Untuk membuka kamera, ketuk tombol "Izinkan Akses Kamera" di bawah ini.'
                    : cameraErrorMessage(err),
            );
        }
    }, []);

    // Called from a real user tap. Do NOT call getUserMedia() here: html5-qrcode
    // opens the camera exactly once inside start(), and because the library is
    // preloaded (microtask) with no setTimeout before start(), the iOS Safari
    // permission prompt still shows. Opening the camera twice in a row is what
    // produced the "UnknownError" (camera busy) on iOS.
    const acquireAndStart = useCallback(async () => {
        setCameraError(null);
        setCameraErrorDetail(null);
        await startScanner(true);
    }, [startScanner]);

    const requestCameraPermission = acquireAndStart;

    useEffect(() => {
        startScannerRef.current = startScanner;
    }, [startScanner]);

    const toggleScanner = useCallback(() => {
        if (scannerActive) {
            stopScanner();
            setScannerActive(false);
        } else {
            autoStartDoneRef.current = true;
            acquireAndStart();
        }
    }, [scannerActive, acquireAndStart, stopScanner]);

    useEffect(() => {
        if (active_sessions.length > 0 && !autoStartDoneRef.current) {
            autoStartDoneRef.current = true;
            setAutoScanning(true);
            const timer = setTimeout(() => {
                startScannerRef.current();
            }, 600);

            return () => clearTimeout(timer);
        }
    }, [active_sessions.length]);

    useEffect(() => {
        const poll = setInterval(async () => {
            try {
                const res = await fetch('/absen/sesi-aktif');
                const data: ActiveSession[] = await res.json();
                setPolledSessions(data);

                if (
                    data.length > 0 &&
                    !scannerStartedRef.current &&
                    !autoStartDoneRef.current
                ) {
                    autoStartDoneRef.current = true;
                    setAutoScanning(true);
                    startScannerRef.current();
                }
            } catch { /* network error, will retry next interval */ }
        }, 10000);

        return () => clearInterval(poll);
    }, []);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, [stopScanner]);

    const showSessions = polledSessions.length > 0 && !scannerActive;

    return (
        <>
            <Head title="Absensi Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Absensi Saya
                                </h1>
                                <p className="text-sm text-slate-500">
                                    Scan QR code guru untuk absen
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scan QR Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleScanner}
                            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition-all ${
                                scannerActive
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : polledSessions.length > 0
                                      ? 'animate-pulse bg-emerald-600 hover:bg-emerald-700'
                                      : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {scannerActive ? (
                                <>
                                    <CameraOff className="h-5 w-5" /> Tutup
                                    Kamera
                                </>
                            ) : (
                                <>
                                    <Camera className="h-5 w-5" /> Scan QR
                                </>
                            )}
                        </button>
                        {autoScanning && (
                            <span className="animate-pulse text-xs font-semibold text-indigo-600">
                                Mendeteksi kamera...
                            </span>
                        )}
                        {polledSessions.length > 0 &&
                            !scannerActive &&
                            !autoScanning && (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    {polledSessions.length} sesi absen aktif
                                </span>
                            )}
                    </div>

                    {/* QR Scanner Viewfinder (always mounted so Html5Qrcode always finds the element) */}
                    <div
                        className={`relative rounded-xl border-2 border-dashed border-indigo-300 bg-black ${
                            scannerActive ? '' : 'hidden'
                        } ${
                            zoomLevel > 1
                                ? 'overflow-visible'
                                : 'overflow-hidden'
                        }`}
                    >
                        <div
                            id="qr-scanner-viewfinder"
                            ref={scannerRef}
                            className="mx-auto flex items-center justify-center"
                            style={{
                                maxWidth: 400,
                                minHeight: 300,
                                transformOrigin: 'center top',
                                transition: 'transform 150ms ease-out',
                            }}
                        />
                            <div className="flex items-center justify-center gap-2 bg-black/80 px-4 py-2.5 text-center">
                                <Smartphone className="h-4 w-4 text-indigo-300" />
                                <p className="text-xs text-indigo-200">
                                    Arahkan kamera ke QR code yang ditampilkan
                                    guru
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-black/80 px-4 py-2.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        applyCameraZoom(zoomLevel - 0.5)
                                    }
                                    disabled={zoomLevel <= zoomMin}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Perkecil kamera"
                                    >
                                        <ZoomOut className="h-4 w-4" />
                                    </button>
                                    <span className="w-14 text-center text-xs font-bold text-white tabular-nums">
                                        {Math.round(zoomLevel * 100)}%
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            applyCameraZoom(zoomLevel + 0.5)
                                        }
                                        disabled={zoomLevel >= zoomMax}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                                        aria-label="Perbesar kamera"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                </div>
                    </div>

                    {/* Camera Error / Permission Request Card */}
                    {cameraError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                                <div className="space-y-1 flex-1">
                                    <p className="text-sm font-bold text-red-800">
                                        Akses Kamera Diperlukan
                                    </p>
                                    <p className="text-xs text-red-700 leading-relaxed">
                                        {cameraError}
                                    </p>
                                    {cameraErrorDetail && (
                                        <p className="text-[10px] text-red-400 font-mono break-all leading-relaxed">
                                            {cameraErrorDetail}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-red-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={requestCameraPermission}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
                                >
                                    <Camera className="h-4 w-4" /> Izinkan Akses Kamera
                                </button>
                                <p className="text-[11px] text-red-600 italic">
                                    Tips: Tekan ikon 🔒 Gembok di dekat alamat website untuk mengizinkan kamera.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Auto-scanning notification (shown while camera initializes) */}
                    {autoScanning && !scannerActive && !cameraError && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-800">
                                        Absen sedang dibuka!
                                    </p>
                                    <p className="mt-0.5 text-xs text-indigo-600">
                                        Mencoba mengakses kamera untuk scan
                                        otomatis...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Sessions - QR Scan Required */}
                    {showSessions && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                    <QrCode className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-emerald-800">
                                        Absen sedang dibuka!
                                    </p>
                                    <div className="mt-2 space-y-2">
                                        {polledSessions.map((s) => (
                                            <div
                                                key={s.pertemuan_id}
                                                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        {s.pertemuan}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Berakhir:{' '}
                                                        {formatEndTime(s.expired_at)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={toggleScanner}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                                                >
                                                    <Camera className="h-3.5 w-3.5" />
                                                    Scan QR
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {[
                            {
                                label: 'Total Pertemuan',
                                value: stats.total,
                                color: '#436391',
                                icon: Calendar,
                            },
                            {
                                label: 'Hadir',
                                value: stats.hadir,
                                color: '#059669',
                                icon: CheckCircle,
                            },
                            {
                                label: 'Terlambat',
                                value: stats.terlambat,
                                color: '#d97706',
                                icon: Clock,
                            },
                            {
                                label: 'Izin',
                                value: stats.izin ?? 0,
                                color: '#0284c7',
                                icon: HeartHandshake,
                            },
                            {
                                label: 'Sakit',
                                value: stats.sakit ?? 0,
                                color: '#7c3aed',
                                icon: Stethoscope,
                            },
                            {
                                label: 'Tidak Hadir (Bolong)',
                                value: stats.alpa ?? 0,
                                color: '#dc2626',
                                icon: AlertTriangle,
                            },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="rounded-xl border border-slate-200 bg-white p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
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

                    {/* Riwayat Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-bold text-slate-900">
                                Riwayat Presensi Pertemuan
                            </h2>
                        </div>
                        {riwayat.length > 0 ? (
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500">
                                        <th className="px-4 py-2.5 font-semibold">
                                            Pertemuan
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold">
                                            Tanggal
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold">
                                            Waktu Scan
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {riwayat.map((r) => (
                                        <tr
                                            key={r.id}
                                            className="transition-colors hover:bg-slate-50"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-800">
                                                    {r.pertemuan}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    {r.roadmap}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {r.tanggal}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {r.scan_time ?? '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        r.status === 'hadir'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : r.status === 'terlambat'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : r.status === 'izin'
                                                            ? 'bg-sky-50 text-sky-700'
                                                            : r.status === 'sakit'
                                                            ? 'bg-violet-50 text-violet-700'
                                                            : 'bg-red-50 text-red-700'
                                                    }`}
                                                >
                                                    {r.status === 'hadir'
                                                        ? 'Hadir'
                                                        : r.status === 'terlambat'
                                                        ? 'Terlambat'
                                                        : r.status === 'izin'
                                                        ? 'Izin'
                                                        : r.status === 'sakit'
                                                        ? 'Sakit'
                                                        : 'Tidak Hadir (Bolong)'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                                <Calendar className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada riwayat absensi
                                </p>
                                <p className="text-xs text-slate-400">
                                    Scan QR code yang ditampilkan guru untuk
                                    melakukan absensi.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AbsenIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Absensi', href: '/absen' },
    ],
};
