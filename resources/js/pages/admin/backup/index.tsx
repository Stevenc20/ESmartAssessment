import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BackupItem = { filename: string; size: string; created_at: string };

type PageProps = { backups: BackupItem[] };

export default function BackupIndex({ backups }: PageProps) {
    const [running, setRunning] = useState(false);

    function runBackup() {
        setRunning(true);
        router.post(
            '/admin/backup',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Backup berhasil dibuat');
                    setRunning(false);
                },
                onError: () => {
                    toast.error('Gagal membuat backup');
                    setRunning(false);
                },
                onFinish: () => setRunning(false),
            },
        );
    }

    function download(filename: string) {
        window.open(`/admin/backup/${filename}/download`, '_blank');
    }

    return (
        <>
            <Head title="Backup Database" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Backup Database</h1>
                    <Button onClick={runBackup} disabled={running}>
                        {running ? 'Memproses...' : 'Buat Backup Baru'}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Daftar Backup
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="p-3 font-medium">
                                        Filename
                                    </th>
                                    <th className="p-3 font-medium">Size</th>
                                    <th className="p-3 font-medium">Tanggal</th>
                                    <th className="p-3 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.map((backup) => (
                                    <tr
                                        key={backup.filename}
                                        className="border-b last:border-0 hover:bg-muted/50"
                                    >
                                        <td className="p-3 font-mono text-xs">
                                            {backup.filename}
                                        </td>
                                        <td className="p-3">{backup.size}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {backup.created_at}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    download(backup.filename)
                                                }
                                            >
                                                Download
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {backups.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            Belum ada backup.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

BackupIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Backup', href: '/admin/backup' },
    ],
};
