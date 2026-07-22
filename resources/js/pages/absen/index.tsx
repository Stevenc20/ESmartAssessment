import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    QrCode,
    Camera,
    CameraOff,
    Smartphone,
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

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
    stats: { total: number; hadir: number; terlambat: number };
    riwayat: RiwayatItem[];
    active_sessions: ActiveSession[];
};

export default function AbsenIndex({ stats, riwayat, active_sessions }: Props) {
    const [scannerActive, setScannerActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [polledSessions, setPolledSessions] =
        useState<ActiveSession[]>(active_sessions);
    const [autoScanning, setAutoScanning] = useState(false);
    const scannerRef = useRef<HTMLDivElement>(null);
    const html5QrCodeRef = useRef<any>(null);
    const scannerStartedRef = useRef(false);
    const autoStartDoneRef = useRef(false);
    const startScannerRef = useRef<() => void>(() => {});

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

        scannerStartedRef.current = false;
    }, []);

    const startScanner = useCallback(async () => {
        if (scannerStartedRef.current) {
return;
}

        setCameraError(null);
        setScannerActive(true);
        setAutoScanning(false);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');

            const cameras = await Html5Qrcode.getCameras();

            if (!cameras || cameras.length === 0) {
                throw new Error('Tidak ada kamera yang terdeteksi');
            }

            const backCamera = cameras.find(
                (c) =>
                    c.label.toLowerCase().includes('back') ||
                    c.label.toLowerCase().includes('environment'),
            );
            const selectedCamera = backCamera ?? cameras[0];

            const scanner = new Html5Qrcode('qr-scanner-viewfinder');
            html5QrCodeRef.current = scanner;
            scannerStartedRef.current = true;

            await scanner.start(
                { deviceId: { exact: selectedCamera.id } },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    const match = decodedText.match(/\/absen\/([a-zA-Z0-9]+)/);
                    const token = match ? match[1] : null;

                    if (token && scannerStartedRef.current) {
                        scannerStartedRef.current = false;
                        scanner.stop().catch(() => {});
                        setScannerActive(false);
                        router.visit(`/absen/${token}`);
                    }
                },
                () => {},
            );
        } catch (err: any) {
            setCameraError(err?.message || 'Kamera tidak dapat diakses');
            setScannerActive(false);
        }
    }, []);

    useEffect(() => {
        startScannerRef.current = startScanner;
    }, [startScanner]);

    const toggleScanner = useCallback(() => {
        if (scannerActive) {
            stopScanner();
            setScannerActive(false);
        } else {
            autoStartDoneRef.current = true;
            startScanner();
        }
    }, [scannerActive, startScanner, stopScanner]);

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

                    {/* QR Scanner Viewfinder */}
                    {scannerActive && (
                        <div className="overflow-hidden rounded-xl border-2 border-dashed border-indigo-300 bg-black">
                            <div
                                id="qr-scanner-viewfinder"
                                ref={scannerRef}
                                className="mx-auto flex items-center justify-center"
                                style={{ maxWidth: 400, minHeight: 300 }}
                            />
                            <div className="flex items-center justify-center gap-2 bg-black/80 px-4 py-2.5 text-center">
                                <Smartphone className="h-4 w-4 text-indigo-300" />
                                <p className="text-xs text-indigo-200">
                                    Arahkan kamera ke QR code yang ditampilkan
                                    guru
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Camera Error */}
                    {cameraError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">
                                        Kamera tidak tersedia
                                    </p>
                                    <p className="mt-1 text-xs text-red-600">
                                        {cameraError}
                                    </p>
                                    <p className="mt-1 text-xs text-red-500">
                                        Gunakan daftar sesi aktif di bawah untuk
                                        absen tanpa kamera.
                                    </p>
                                </div>
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
                                                        {new Date(
                                                            s.expired_at,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}
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
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            {
                                label: 'Total Absen',
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

                    {/* Riwayat Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <h2 className="text-sm font-bold text-slate-900">
                                Riwayat Absensi
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
                                            Scan
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
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                        r.status === 'hadir'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : r.status ===
                                                                'terlambat'
                                                              ? 'bg-amber-50 text-amber-600'
                                                              : 'bg-red-50 text-red-600'
                                                    }`}
                                                >
                                                    {r.status === 'hadir' && (
                                                        <CheckCircle className="h-3 w-3" />
                                                    )}
                                                    {r.status ===
                                                        'terlambat' && (
                                                        <Clock className="h-3 w-3" />
                                                    )}
                                                    {r.status ===
                                                        'tidak_hadir' && (
                                                        <AlertTriangle className="h-3 w-3" />
                                                    )}
                                                    {r.status}
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
