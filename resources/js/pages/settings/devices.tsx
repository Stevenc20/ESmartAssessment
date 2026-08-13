import { Head, router } from '@inertiajs/react';
import { Link2, Laptop, Smartphone, Tablet, Monitor, Loader2, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import QrScanner from '@/components/device-link/qr-scanner';
import Heading from '@/components/settings/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api';
import { edit } from '@/routes/devices';

type Device = {
    id: number;
    device_name: string | null;
    browser: string | null;
    os: string | null;
    last_active_at: string | null;
    revoked_at: string | null;
    is_active: boolean;
};

type ScannedInfo = {
    id: number;
    expires_at: string;
    device: {
        browser: string;
        os: string;
    };
};

type Props = {
    devices: Device[];
};

function DeviceIcon({ device }: { device: Device }) {
    const label = `${device.browser ?? ''} ${device.os ?? ''}`.toLowerCase();

    if (label.includes('android') || label.includes('ios') || label.includes('mobile')) {
        return <Smartphone className="h-4 w-4" />;
    }

    if (label.includes('tablet') || label.includes('ipad')) {
        return <Tablet className="h-4 w-4" />;
    }

    return <Laptop className="h-4 w-4" />;
}

export default function Devices({ devices }: Props) {
    const [scanning, setScanning] = useState(false);
    const [confirming, setConfirming] = useState<ScannedInfo | null>(null);
    const [approving, setApproving] = useState(false);

    const scannerFlow = useMemo(() => {
        return {
            confirm: (info: ScannedInfo) => {
                setScanning(false);
                setConfirming(info);
            },
            cancel: () => {
                setScanning(false);
                setConfirming(null);
            },
        };
    }, []);

    const handleDecoded = useCallback(
        async (payload: { type: string; token: string; expires_at: string }) => {
            try {
                const res = await apiFetch<{ data: ScannedInfo }>('/auth/device-link/scan', 'POST', {
                    token: payload.token,
                });
                scannerFlow.confirm(res.data);
            } catch (err: any) {
                toast.error(err.message || 'QR Code tidak valid atau sudah kedaluwarsa.');
                setScanning(false);
            }
        },
        [scannerFlow],
    );

    const handleApprove = useCallback(async () => {
        if (!confirming) {
return;
}

        setApproving(true);

        try {
            await apiFetch<{ data: { status: string } }>(
                `/auth/device-link/approve/${confirming.id}`,
                'POST',
            );
            toast.success('Perangkat berhasil dihubungkan.');
            setConfirming(null);
        } catch (err: any) {
            toast.error(err.message || 'Gagal menghubungkan perangkat.');
        } finally {
            setApproving(false);
        }
    }, [confirming]);

    const handleCancelScan = useCallback(async () => {
        if (confirming) {
            apiFetch(`/auth/device-link/cancel/${confirming.id}`).catch(() => {});
        }

        setConfirming(null);
        setScanning(false);
    }, [confirming]);

    const handleRevoke = useCallback((device: Device) => {
        if (!window.confirm(`Putuskan perangkat "${device.device_name ?? 'Perangkat'}"?`)) {
return;
}

        router.delete(`/settings/devices/${device.id}`, {
            preserveScroll: true,
        });
    }, []);

    return (
        <>
            <Head title="Perangkat" />

            <div className="space-y-8">
                <Heading
                    title="Perangkat Terhubung"
                    description="Kelola perangkat yang terhubung ke akun Anda"
                />

                <Card className="border-blue-100 bg-blue-50/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <MonitorSmartphone className="h-4 w-4 text-blue-600" />
                            Link Device
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Hubungkan perangkat lain (misalnya komputer sekolah) dengan memindai QR
                            Code menggunakan kamera perangkat ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            type="button"
                            onClick={() => setScanning(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-test="start-link-device-scanner"
                        >
                            <Link2 className="mr-2 h-4 w-4" />
                            Link Device
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {devices.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Belum ada perangkat terhubung.
                        </p>
                    )}

                    {devices.map((device) => (
                        <Card key={device.id}>
                            <CardContent className="flex items-center justify-between gap-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                        <DeviceIcon device={device} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">
                                                {device.device_name ?? 'Perangkat'}
                                            </p>
                                            {device.is_active ? (
                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                    Terhubung
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Diputuskan</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {device.browser ?? 'Peramban'} · {device.os ?? 'Sistem Operasi'}
                                            {device.last_active_at && (
                                                <> · Terakhir aktif: {device.last_active_at}</>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {device.is_active && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRevoke(device)}
                                        className="text-destructive hover:text-destructive"
                                        data-test="revoke-device-button"
                                    >
                                        Putuskan
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={scanning} onOpenChange={(open) => !open && scannerFlow.cancel()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Link Device</DialogTitle>
                        <DialogDescription>
                            Arahkan kamera ke QR Code yang tampil di komputer yang ingin dihubungkan.
                        </DialogDescription>
                    </DialogHeader>
                    <QrScanner onDecoded={handleDecoded} onClose={() => scannerFlow.cancel()} />
                </DialogContent>
            </Dialog>

            <Dialog open={confirming !== null} onOpenChange={(open) => !open && handleCancelScan()}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hubungkan perangkat ini?</DialogTitle>
                        <DialogDescription className="flex flex-col items-center gap-3 pt-2 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                <Monitor className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                {confirming?.device.browser} · {confirming?.device.os}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Perangkat ini akan dapat masuk ke akun Anda tanpa perlu login
                                menggunakan email dan kata sandi.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancelScan}
                            disabled={approving}
                            data-test="cancel-pairing-button"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={handleApprove}
                            disabled={approving}
                            data-test="approve-pairing-button"
                        >
                            {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Hubungkan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

Devices.layout = {
    breadcrumbs: [
        {
            title: 'Perangkat',
            href: edit(),
        },
    ],
};
