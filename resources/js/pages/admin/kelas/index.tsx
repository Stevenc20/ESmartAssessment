import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { AdminKelas, AdminTahunAjaran } from '@/types/admin';

type PageProps = {
    items: AdminKelas[];
    tahunAjaran: AdminTahunAjaran[];
};

export default function KelasIndex({ items, tahunAjaran }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<AdminKelas | null>(null);
    const { errors } = usePage().props;
    const { data, setData, post, put, processing, reset } = useForm({
        nama_kelas: '',
        tingkat: '',
        tahun_ajaran_id: '',
    });

    function openCreate() {
        setEditItem(null);
        reset();
        setOpen(true);
    }

    function openEdit(item: AdminKelas) {
        setEditItem(item);
        setData({
            nama_kelas: item.nama_kelas,
            tingkat: item.tingkat,
            tahun_ajaran_id: String(item.tahun_ajaran_id),
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editItem) {
            put(`/admin/kelas/${editItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/kelas', {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        }
    }

    function destroy(id: number) {
        if (confirm('Yakin ingin menghapus kelas ini?')) {
router.delete(`/admin/kelas/${id}`, { preserveScroll: true });
}
    }

    return (
        <>
            <Head title="Management Kelas" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Management Kelas</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>Tambah Kelas</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editItem ? 'Edit' : 'Tambah'} Kelas
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Nama Kelas</Label>
                                    <Input
                                        value={data.nama_kelas}
                                        onChange={(e) =>
                                            setData(
                                                'nama_kelas',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.nama_kelas && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.nama_kelas}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Tingkat</Label>
                                    <Select
                                        value={data.tingkat}
                                        onValueChange={(v) =>
                                            setData('tingkat', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['X', 'XI', 'XII'].map((t) => (
                                                <SelectItem key={t} value={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.tingkat && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.tingkat}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Tahun Ajaran</Label>
                                    <Select
                                        value={data.tahun_ajaran_id}
                                        onValueChange={(v) =>
                                            setData('tahun_ajaran_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tahunAjaran.map((ta) => (
                                                <SelectItem
                                                    key={ta.id}
                                                    value={String(ta.id)}
                                                >
                                                    {ta.tahun}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.tahun_ajaran_id && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.tahun_ajaran_id}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
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
                                    <th className="p-3 font-medium">
                                        Nama Kelas
                                    </th>
                                    <th className="p-3 font-medium">Tingkat</th>
                                    <th className="p-3 font-medium">
                                        Tahun Ajaran
                                    </th>
                                    <th className="p-3 font-medium">Siswa</th>
                                    <th className="p-3 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0 hover:bg-muted/50"
                                    >
                                        <td className="p-3 font-medium">
                                            {item.nama_kelas}
                                        </td>
                                        <td className="p-3">{item.tingkat}</td>
                                        <td className="p-3">
                                            {item.tahun_ajaran?.tahun ?? '-'}
                                        </td>
                                        <td className="p-3">
                                            {item.siswa_count ?? 0}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        destroy(item.id)
                                                    }
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-6 text-center text-muted-foreground"
                                        >
                                            Belum ada data kelas.
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

KelasIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Management Kelas', href: '/admin/kelas' },
    ],
};
