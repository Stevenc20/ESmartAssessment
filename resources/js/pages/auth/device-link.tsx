import { Head, router } from '@inertiajs/react';
import { Loader2, MonitorSmartphone, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import QRCode from 'qrcode';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type CreateData = {
    request_id: number;
    token: string;
    expires_at: string;
    payload: string;
};

type StatusData = {
    id: number;
    status: string;
    expires_at: string;
};

type LinkStatus = 'loading' | 'pending' | 'authenticated' | 'expired' | 'error';

const TTL_SECONDS = 90;
const POLL_INTERVAL_MS = 5000;

export default function DeviceLink() {
    const [requestId, setRequestId] = useState<number | null>(null);
    const [expiresAt, setExpiresAt] = useState<number | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<LinkStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(TTL_SECONDS);
    const [generating, setGenerating] = useState(false);

    const createRequest = useCallback(async () => {
        setGenerating(true);
        setError(null);
        setStatus('loading');
        setSecondsLeft(TTL_SECONDS);

        try {
            const res = await apiFetch<{ data: CreateData }>('/auth/device-link/create');
            const data = res.data;

            const url = await QRCode.toDataURL(data.payload, {
                width: 280,
                margin: 2,
                color: { dark: '#1a2236', light: '#ffffff' },
            });

            setRequestId(data.request_id);
            setExpiresAt(Date.parse(data.expires_at));
            setQrDataUrl(url);
            setStatus('pending');
        } catch (err: any) {
            setError(err.message || 'Gagal membuat QR Code. Silakan coba lagi.');
            setStatus('error');
        } finally {
            setGenerating(false);
        }
    }, []);

    const cancelRequest = useCallback(async () => {
        if (requestId) {
            apiFetch(`/auth/device-link/cancel/${requestId}`).catch(() => {});
        }
    }, [requestId]);

    const consumeRequest = useCallback(async () => {
        if (!requestId) {
return;
}

        try {
            await apiFetch<{ data: { status: string } }>(`/auth/device-link/consume/${requestId}`);
            setStatus('authenticated');
            router.visit('/dashboard', { preserveState: true });
        } catch (err: any) {
            setError(err.message || 'Gagal menghubungkan perangkat.');
            setStatus('error');
        }
    }, [requestId]);

    useEffect(() => {
        const timer = setTimeout(createRequest, 0);

        return () => {
            clearTimeout(timer);
            cancelRequest();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status !== 'pending' || !expiresAt) {
return;
}

        const timer = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
            setSecondsLeft(remaining);

            if (remaining <= 0) {
                setStatus('expired');
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [status, expiresAt]);

    useEffect(() => {
        if (status !== 'pending' || !requestId) {
return;
}

        let stopped = false;

        const poll = async () => {
            if (stopped) {
return;
}

            try {
                const res = await apiFetch<{ data: StatusData }>(
                    `/auth/device-link/status/${requestId}`,
                    'GET',
                );

                if (stopped) {
return;
}

                if (res.data.status === 'approved') {
                    await consumeRequest();
                } else if (['expired', 'cancelled', 'consumed'].includes(res.data.status)) {
                    setStatus('expired');
                }
            } catch {
                // transient network errors are ignored; polling continues
            }
        };

        const timeout = setInterval(poll, POLL_INTERVAL_MS);

        return () => {
            stopped = true;
            clearInterval(timeout);
        };
    }, [status, requestId, consumeRequest]);

    const isBusy = status === 'loading' || generating;

    return (
        <>
            <Head title="Link Device" />

            <div className="flex flex-col gap-4">
                {isBusy && (
                    <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm">Menyiapkan QR Code…</p>
                    </div>
                )}

                {status === 'pending' && qrDataUrl && (
                    <>
                        <div className="flex flex-col items-center gap-3">
                            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white p-4 shadow-sm">
                                <img src={qrDataUrl} alt="QR Code Link Device" className="h-64 w-64" />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                <span>
                                    Buka ESmartAssessment di HP Anda untuk menghubungkan perangkat
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Kode berlaku selama{' '}
                                <span className="font-semibold text-foreground">{secondsLeft} detik</span>
                            </p>

                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                                </span>
                                Menunggu scan…
                            </div>
                        </div>
                    </>
                )}

                {status === 'authenticated' && (
                    <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-600">
                            Perangkat berhasil dihubungkan.
                        </p>
                    </div>
                )}

                {status === 'expired' && (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <QrCode className="h-10 w-10 text-muted-foreground/50" />
                        <div>
                            <p className="text-sm font-semibold">QR Code telah kedaluwarsa</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Buat QR Code baru untuk melanjutkan.
                            </p>
                        </div>
                        <Button onClick={createRequest} className="bg-blue-600 hover:bg-blue-700">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Generate QR Baru
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <MonitorSmartphone className="h-10 w-10 text-red-500" />
                        <p className="text-sm font-semibold text-red-600">{error}</p>
                        <Button onClick={createRequest} className="bg-blue-600 hover:bg-blue-700">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </div>
                )}

                {status === 'pending' && (
                    <Card className="border-blue-100 bg-blue-50/50">
                        <CardHeader>
                            <CardTitle className="text-sm">Cara menghubungkan</CardTitle>
                            <CardDescription className="text-xs">
                                Pastikan Anda sudah masuk (login) di aplikasi ESmartAssessment pada HP Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
                                <li>Buka ESmartAssessment di HP yang sudah login.</li>
                                <li>Masuk ke menu Perangkat (Account/Profile).</li>
                                <li>Pilih &quot;Link Device&quot;, lalu scan QR Code ini.</li>
                                <li>Konfirmasi pada HP, komputer ini akan masuk otomatis.</li>
                            </ol>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

DeviceLink.layout = {
    title: 'Link Device',
    description: 'Hubungkan komputer ini menggunakan aplikasi di perangkat Anda',
};
