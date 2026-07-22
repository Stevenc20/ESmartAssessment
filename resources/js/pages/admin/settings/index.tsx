import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function SettingsIndex() {
    const { props } = usePage();
    const settings = ((props as any).settings as Record<string, any>) || {};
    const errors = (props as any).errors || {};

    const { data, setData, put, processing } = useForm({
        app_name: settings.app_name ?? '',
        registration_open: settings.registration_open ?? true,
        maintenance_mode: settings.maintenance_mode ?? false,
        max_login_attempts: settings.max_login_attempts ?? 5,
        session_timeout: settings.session_timeout ?? 120,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        put('/admin/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('Pengaturan berhasil disimpan'),
            onError: () => toast.error('Gagal menyimpan pengaturan'),
        });
    }

    return (
        <>
            <Head title="Pengaturan" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <h1 className="text-xl font-bold">Pengaturan</h1>

                <Card className="max-w-2xl">
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                                    APLIKASI
                                </h3>
                                <div>
                                    <Label>Nama Aplikasi</Label>
                                    <Input
                                        value={data.app_name}
                                        onChange={(e) =>
                                            setData('app_name', e.target.value)
                                        }
                                    />
                                    {errors.app_name && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.app_name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                                    FITUR
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Registrasi Terbuka</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Izinkan user baru mendaftar
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.registration_open}
                                            onCheckedChange={(v) =>
                                                setData('registration_open', v)
                                            }
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Mode Maintenance</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Nonaktifkan akses sementara
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.maintenance_mode}
                                            onCheckedChange={(v) =>
                                                setData('maintenance_mode', v)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                                    KEAMANAN
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Max Login Attempts</Label>
                                        <Input
                                            type="number"
                                            value={data.max_login_attempts}
                                            onChange={(e) =>
                                                setData(
                                                    'max_login_attempts',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-24"
                                        />
                                        {errors.max_login_attempts && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.max_login_attempts}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label>Session Timeout (menit)</Label>
                                        <Input
                                            type="number"
                                            value={data.session_timeout}
                                            onChange={(e) =>
                                                setData(
                                                    'session_timeout',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-24"
                                        />
                                        {errors.session_timeout && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.session_timeout}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Pengaturan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SettingsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Pengaturan', href: '/admin/settings' },
    ],
};
