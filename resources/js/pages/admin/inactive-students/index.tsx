import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type InactiveStudent = {
    id: number; siswa_id: number; tanggal_nonaktif: string; status: string;
    siswa?: { id: number; name: string; email: string };
};

type RecycleAccount = {
    id: number; siswa_id: number; restored_at?: string; archived_at?: string;
    siswa?: { id: number; name: string; email: string };
};

type PageProps = { items: InactiveStudent[]; recycled: RecycleAccount[] };

export default function InactiveStudentsIndex({ items, recycled }: PageProps) {
    function restore(id: number) {
        if (confirm('Pulihkan akun siswa ini?')) {
            router.post(`/admin/inactive-students/${id}/restore`, {}, { preserveScroll: true });
        }
    }

    function forceDelete(id: number) {
        if (confirm('Hapus permanen data siswa nonaktif ini?')) {
            router.delete(`/admin/inactive-students/${id}`, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Arsip Siswa" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Arsip Siswa Nonaktif</h1>
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-base">Siswa Nonaktif ({items.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="p-3 font-medium">Nama</th>
                                    <th className="p-3 font-medium">Email</th>
                                    <th className="p-3 font-medium">Tanggal Nonaktif</th>
                                    <th className="p-3 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-3 font-medium">{item.siswa?.name ?? 'Unknown'}</td>
                                        <td className="p-3 text-muted-foreground">{item.siswa?.email ?? '-'}</td>
                                        <td className="p-3 text-muted-foreground">{new Date(item.tanggal_nonaktif).toLocaleDateString('id-ID')}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button variant="outline" size="sm" onClick={() => restore(item.id)}>Pulihkan</Button>
                                                <Button variant="destructive" size="sm" onClick={() => forceDelete(item.id)}>Hapus</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Tidak ada siswa nonaktif.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {recycled.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Riwayat Restore</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="p-3 font-medium">Siswa</th>
                                        <th className="p-3 font-medium">Diarsipkan</th>
                                        <th className="p-3 font-medium">Direstore</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recycled.map(item => (
                                        <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-3 font-medium">{item.siswa?.name ?? 'Unknown'}</td>
                                            <td className="p-3 text-muted-foreground">{item.archived_at ? new Date(item.archived_at).toLocaleDateString('id-ID') : '-'}</td>
                                            <td className="p-3 text-muted-foreground">{item.restored_at ? new Date(item.restored_at).toLocaleDateString('id-ID') : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

InactiveStudentsIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Arsip Siswa', href: '/admin/inactive-students' }],
};
