import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { AdminRole, AdminPermission } from '@/types/admin';

type PageProps = {
    roles: AdminRole[];
    permissions: Record<string, AdminPermission[]>;
};

export default function RolesIndex({ roles, permissions }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<AdminRole | null>(null);
    const [permOpen, setPermOpen] = useState<number | null>(null);
    const [selectedPerms, setSelectedPerms] = useState<number[]>([]);
    const { errors } = usePage().props;

    const { data, setData, post, put, processing, reset } = useForm({
        role_name: '', description: '',
    });

    function openCreate() { setEditItem(null); reset(); setOpen(true); }

    function openEdit(item: AdminRole) {
        setEditItem(item);
        setData({ role_name: item.role_name, description: item.description ?? '' });
        setOpen(true);
    }

    function openPermissions(role: AdminRole) {
        setPermOpen(role.id);
        setSelectedPerms(role.permissions?.map(p => p.id) ?? []);
    }

    function togglePerm(id: number) {
        setSelectedPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    }

    function savePermissions(roleId: number) {
        router.put(`/admin/roles/${roleId}/permissions`, { permissions: selectedPerms }, {
            preserveScroll: true, onSuccess: () => setPermOpen(null),
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editItem) {
            put(`/admin/roles/${editItem.id}`, { preserveScroll: true, onSuccess: () => { setOpen(false); reset(); } });
        } else {
            post('/admin/roles', { preserveScroll: true, onSuccess: () => { setOpen(false); reset(); } });
        }
    }

    function destroy(id: number) {
        if (confirm('Yakin ingin menghapus role ini?')) router.delete(`/admin/roles/${id}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Role & Permission" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Role & Permission</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild><Button onClick={openCreate}>Tambah Role</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>{editItem ? 'Edit' : 'Tambah'} Role</DialogTitle></DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Nama Role</Label>
                                    <Input value={data.role_name} onChange={e => setData('role_name', e.target.value)} />
                                    {errors.role_name && <p className="text-sm text-red-500 mt-1">{errors.role_name}</p>}
                                </div>
                                <div>
                                    <Label>Deskripsi</Label>
                                    <Textarea value={data.description} onChange={e => setData('description', e.target.value)} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {roles.map(role => (
                        <Card key={role.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">{role.role_name}</CardTitle>
                                        {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
                                    </div>
                                    <Badge variant="outline">{role.users_count} user</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-3 flex flex-wrap gap-1">
                                    {role.permissions?.slice(0, 5).map(p => (
                                        <Badge key={p.id} variant="secondary" className="text-xs">{p.permission_name}</Badge>
                                    ))}
                                    {(role.permissions?.length ?? 0) > 5 && (
                                        <Badge variant="outline" className="text-xs">+{role.permissions!.length - 5}</Badge>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" onClick={() => openPermissions(role)}>Atur Hak Akses</Button>
                                    <Button variant="outline" size="sm" onClick={() => openEdit(role)}>Edit</Button>
                                    {!['super_admin', 'admin', 'guru', 'siswa'].includes(role.role_name) && (
                                        <Button variant="destructive" size="sm" onClick={() => destroy(role.id)}>Hapus</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {permOpen !== null && (() => {
                    const role = roles.find(r => r.id === permOpen);
                    if (!role) return null;
                    return (
                        <Dialog open={true} onOpenChange={() => setPermOpen(null)}>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Hak Akses — {role.role_name}</DialogTitle></DialogHeader>
                                <div className="max-h-96 space-y-4 overflow-y-auto">
                                    {Object.entries(permissions).map(([module, perms]) => (
                                        <div key={module}>
                                            <h4 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">{module}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {perms.map(p => (
                                                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <Checkbox checked={selectedPerms.includes(p.id)} onCheckedChange={() => togglePerm(p.id)} />
                                                        {p.permission_name}
                                                    </label>
                                                ))}
                                            </div>
                                            <Separator className="mt-2" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setPermOpen(null)}>Batal</Button>
                                    <Button onClick={() => savePermissions(role.id)}>Simpan</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    );
                })()}
            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Role & Permission', href: '/admin/roles' }],
};
