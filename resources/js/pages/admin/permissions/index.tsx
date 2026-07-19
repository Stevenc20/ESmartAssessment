import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { AdminPermission } from '@/types/admin';

type GroupedPerms = Record<string, AdminPermission[]>;

type PageProps = {
    permissions: GroupedPerms;
};

export default function PermissionsIndex({ permissions }: PageProps) {
    const [open, setOpen] = useState(false);
    const { errors } = usePage().props;
    const { data, setData, post, processing, reset } = useForm({
        permission_name: '', module: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/permissions', {
            preserveScroll: true, onSuccess: () => { setOpen(false); reset(); },
        });
    }

    function destroy(id: number) {
        if (confirm('Yakin ingin menghapus permission ini?')) {
            router.delete(`/admin/permissions/${id}`, { preserveScroll: true });
        }
    }

    const allPermissions = Object.values(permissions).flat();

    return (
        <>
            <Head title="Permissions" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Permissions</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild><Button onClick={() => { reset(); setOpen(true); }}>Tambah Permission</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Tambah Permission</DialogTitle></DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Nama Permission</Label>
                                    <Input value={data.permission_name} onChange={e => setData('permission_name', e.target.value)} />
                                    {errors.permission_name && <p className="text-sm text-red-500 mt-1">{errors.permission_name}</p>}
                                </div>
                                <div>
                                    <Label>Module</Label>
                                    <Input value={data.module} onChange={e => setData('module', e.target.value)} />
                                    {errors.module && <p className="text-sm text-red-500 mt-1">{errors.module}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {Object.entries(permissions).map(([module, perms]) => (
                    <Card key={module}>
                        <CardContent className="p-0">
                            <div className="border-b px-3 py-2 text-sm font-semibold text-muted-foreground uppercase">{module}</div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="p-3 font-medium">Permission</th>
                                        <th className="p-3 font-medium w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perms.map(p => (
                                        <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="p-3 font-medium">{p.permission_name}</td>
                                            <td className="p-3">
                                                <Button variant="destructive" size="sm" onClick={() => destroy(p.id)}>Hapus</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Permissions', href: '/admin/permissions' }],
};
