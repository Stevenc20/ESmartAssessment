import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';

type Announcement = {
    id: number;
    judul: string;
    isi: string;
    target_role: string | null;
    created_by: number;
    creator?: { id: number; name: string };
    created_at: string;
};

type PageProps = {
    items: Announcement[];
};

export default function AnnouncementsIndex({ items }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<Announcement | null>(null);
    const { errors } = usePage().props;
    const { data, setData, post, put, processing, reset } = useForm({
        judul: '',
        isi: '',
        target_role: '',
    });

    function openCreate() {
        setEditItem(null);
        reset();
        setOpen(true);
    }

    function openEdit(item: Announcement) {
        setEditItem(item);
        setData({
            judul: item.judul,
            isi: item.isi,
            target_role: item.target_role ?? '',
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editItem) {
            put(`/admin/announcements/${editItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        } else {
            post('/admin/announcements', {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                },
            });
        }
    }

    function destroy(id: number) {
        if (confirm('Yakin ingin menghapus pengumuman ini?')) {
router.delete(`/admin/announcements/${id}`, {
                preserveScroll: true,
            });
}
    }

    return (
        <>
            <Head title="Pengumuman" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Pengumuman</h1>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                Buat Pengumuman
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editItem ? 'Edit' : 'Buat'} Pengumuman
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Judul</Label>
                                    <Input
                                        value={data.judul}
                                        onChange={(e) =>
                                            setData('judul', e.target.value)
                                        }
                                    />
                                    {errors.judul && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.judul}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Target Role (optional)</Label>
                                    <Input
                                        value={data.target_role}
                                        onChange={(e) =>
                                            setData(
                                                'target_role',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="guru, siswa, all"
                                    />
                                </div>
                                <div>
                                    <Label>Isi</Label>
                                    <Textarea
                                        rows={6}
                                        value={data.isi}
                                        onChange={(e) =>
                                            setData('isi', e.target.value)
                                        }
                                    />
                                    {errors.isi && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.isi}
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
                                    <th className="p-3 font-medium">Judul</th>
                                    <th className="p-3 font-medium">Target</th>
                                    <th className="p-3 font-medium">Oleh</th>
                                    <th className="p-3 font-medium">Tanggal</th>
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
                                            {item.judul}
                                        </td>
                                        <td className="p-3">
                                            <Badge variant="outline">
                                                {item.target_role ?? 'Semua'}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {item.creator?.name ?? '-'}
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {new Date(
                                                item.created_at,
                                            ).toLocaleDateString('id-ID')}
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
                                            Belum ada pengumuman.
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

AnnouncementsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Pengumuman', href: '/admin/announcements' },
    ],
};
