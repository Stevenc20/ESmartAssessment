import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type UserLog = {
    id: number; activity: string; ip_address?: string;
    user: { name: string; email: string } | null;
    created_at: string;
};

type PageProps = {
    logs: { data: UserLog[] };
    filters?: { search?: string; user_id?: string };
};

export default function LogsIndex({ logs, filters }: PageProps) {
    const [search, setSearch] = useState(filters?.search ?? '');

    function searchHandler(e: React.FormEvent) {
        e.preventDefault();
        router.get('/admin/logs', search ? { search } : {}, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Activity Log" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Activity Log</h1>
                </div>

                <form onSubmit={searchHandler} className="flex gap-2">
                    <Input placeholder="Cari user, aktivitas..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
                    <Button type="submit" variant="outline">Cari</Button>
                </form>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="p-3 font-medium">User</th>
                                    <th className="p-3 font-medium">Aktivitas</th>
                                    <th className="p-3 font-medium">IP</th>
                                    <th className="p-3 font-medium">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map(log => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-3">{log.user ? `${log.user.name} (${log.user.email})` : 'System'}</td>
                                        <td className="p-3">{log.activity}</td>
                                        <td className="p-3 text-muted-foreground font-mono text-xs">{log.ip_address ?? '-'}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Belum ada log.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

LogsIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Activity Log', href: '/admin/logs' }],
};
