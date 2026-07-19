import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { AdminTahunAjaran } from '@/types/admin';

type PageProps = {
    items: AdminTahunAjaran[];
};

export default function TahunAjaranIndex({ items }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<AdminTahunAjaran | null>(null);
    const { errors } = usePage().props;
    const { data, setData, post, put, processing, reset } = useForm({
        tahun: '', status: 'inactive' as 'active' | 'inactive',
    });

    function openCreate() {
        setEditItem(null);
        reset();
        setOpen(true);
    }

    function openEdit(item: AdminTahunAjaran) {
        setEditItem(item);
        setData({ tahun: item.tahun, status: item.status });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editItem) {
            put(`/admin/tahun-ajaran/${editItem.id}`, {
                preserveScroll: true, onSuccess: () => { setOpen(false); reset(); },
            });
        } else {
            post('/admin/tahun-ajaran', {
                preserveScroll: true, onSuccess: () => { setOpen(false); reset(); },
            });
        }
    }

    function destroy(id: number) {
        if (confirm('Yakin ingin menghapus tahun ajaran ini?')) {
            router.delete(`/admin/tahun-ajaran/${id}`, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Tahun Ajaran" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Tahun Ajaran</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>Tambah Tahun Ajaran</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editItem ? 'Edit' : 'Tambah'} Tahun Ajaran</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="tahun">Tahun</Label>
                                    <Input id="tahun" value={data.tahun} onChange={e => setData('tahun', e.target.value)} placeholder="2025/2026" />
                                    {errors.tahun && <p className="text-sm text-red-500 mt-1">{errors.tahun}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={v => setData('status', v as 'active' | 'inactive')}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={processing}>{processing ? 'Menyimpan...' : 'Simpan'}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="p-3 font-medium">Tahun</th>
                                    <th className="p-3 font-medium">Status</th>
                                    <th className="p-3 font-medium">Kelas</th>
                                    <th className="p-3 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="p-3">{item.tahun}</td>
                                        <td className="p-3">
                                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                                                {item.status === 'active' ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="p-3">{item.kelas_count ?? 0}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => destroy(item.id)}>Hapus</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Belum ada data tahun ajaran.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

TahunAjaranIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Tahun Ajaran', href: '/admin/tahun-ajaran' }],
};
