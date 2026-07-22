import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

type Props = {
    status: 'invalid' | 'success' | 'already';
    message: string;
    pertemuan?: string;
    scan_time?: string;
};

export default function ScanAbsen({
    status,
    message,
    pertemuan,
    scan_time,
}: Props) {
    return (
        <>
            <Head title="Absen" />

            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
                <div className="w-full max-w-sm">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
                        {/* Icon */}
                        <div
                            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                            style={{
                                backgroundColor:
                                    status === 'success'
                                        ? '#d1fae5'
                                        : status === 'already'
                                          ? '#fef3c7'
                                          : '#fee2e2',
                            }}
                        >
                            {status === 'success' && (
                                <CheckCircle className="h-10 w-10 text-emerald-600" />
                            )}
                            {status === 'already' && (
                                <Clock className="h-10 w-10 text-amber-600" />
                            )}
                            {status === 'invalid' && (
                                <XCircle className="h-10 w-10 text-red-600" />
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="mb-1 text-xl font-bold text-slate-900">
                            {status === 'success' && 'Absensi Berhasil!'}
                            {status === 'already' && 'Sudah Absen'}
                            {status === 'invalid' && 'Gagal'}
                        </h1>

                        {/* Pertemuan name */}
                        {pertemuan && (
                            <p className="mb-4 text-sm text-slate-500">
                                {pertemuan}
                            </p>
                        )}

                        {/* Message */}
                        <p className="mb-2 text-sm text-slate-600">{message}</p>

                        {/* Scan time */}
                        {scan_time && (
                            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{scan_time}</span>
                            </div>
                        )}

                        {/* Info for invalid */}
                        {status === 'invalid' && (
                            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>
                                    Hubungi guru untuk informasi lebih lanjut
                                </span>
                            </div>
                        )}

                        {/* Success action */}
                        {status === 'success' && (
                            <button
                                onClick={() => router.visit('/dashboard')}
                                className="mt-4 w-full rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
                            >
                                Ke Dashboard
                            </button>
                        )}

                        {/* Already - go to absen history */}
                        {status === 'already' && (
                            <button
                                onClick={() => router.visit('/absen')}
                                className="mt-4 w-full rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-700"
                            >
                                Riwayat Absensi
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ScanAbsen.layout = null;
