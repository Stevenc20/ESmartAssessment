import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Megaphone, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
    type: string;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_by: string;
    created_at: string;
};

type PageProps = { announcements: Announcement[] };

const typeStyles: Record<
    string,
    { bg: string; text: string; label: string; ring: string }
> = {
    info: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        label: 'Info',
        ring: 'bg-blue-500',
    },
    warning: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        label: 'Warning',
        ring: 'bg-amber-500',
    },
    maintenance: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        label: 'Maintenance',
        ring: 'bg-red-500',
    },
};

export default function GlobalAnnouncementsIndex({ announcements }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<Announcement | null>(null);
    const { errors } = usePage().props;
    const { data, setData, post, put, processing, reset } = useForm({
        judul: '',
        isi: '',
        type: 'info',
        starts_at: '',
        ends_at: '',
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
            type: item.type,
            starts_at: item.starts_at ?? '',
            ends_at: item.ends_at ?? '',
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editItem) {
            put(`/admin/global-announcements/${editItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                    toast.success('Pengumuman diperbarui');
                },
            });
        } else {
            post('/admin/global-announcements', {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                    toast.success('Pengumuman dibuat');
                },
            });
        }
    }

    function destroy(id: number) {
        if (confirm('Hapus pengumuman ini?')) {
router.delete(`/admin/global-announcements/${id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Pengumuman dihapus'),
            });
}
    }

    function toggle(id: number) {
        router.put(
            `/admin/global-announcements/${id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Status diubah'),
            },
        );
    }

    return (
        <>
            <Head title="Pengumuman Global" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">
                            Pengumuman Global
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Pengumuman yang berlaku untuk semua role di platform
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={openCreate}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Buat Pengumuman
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editItem ? 'Edit' : 'Buat'} Pengumuman
                                    Global
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
                                    <Label>Tipe</Label>
                                    <select
                                        value={data.type}
                                        onChange={(e) =>
                                            setData('type', e.target.value)
                                        }
                                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                                    >
                                        <option value="info">Info</option>
                                        <option value="warning">Warning</option>
                                        <option value="maintenance">
                                            Maintenance
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <Label>Isi Pengumuman</Label>
                                    <Textarea
                                        rows={5}
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
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label>Mulai (optional)</Label>
                                        <Input
                                            type="datetime-local"
                                            value={data.starts_at}
                                            onChange={(e) =>
                                                setData(
                                                    'starts_at',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <Label>Selesai (optional)</Label>
                                        <Input
                                            type="datetime-local"
                                            value={data.ends_at}
                                            onChange={(e) =>
                                                setData(
                                                    'ends_at',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table */}
                <Card className="overflow-hidden border-slate-200 bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <th className="px-5 py-3">Judul</th>
                                        <th className="px-5 py-3">Tipe</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Mulai</th>
                                        <th className="px-5 py-3">Oleh</th>
                                        <th className="px-5 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {announcements.map((item) => {
                                        const ts =
                                            typeStyles[item.type] ??
                                            typeStyles.info;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-3 font-semibold text-slate-900">
                                                    {item.judul}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge
                                                        className={`${ts.bg} ${ts.text} border-0 font-semibold`}
                                                    >
                                                        {ts.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <button
                                                        onClick={() =>
                                                            toggle(item.id)
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                                                            item.is_active
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                                        />
                                                        {item.is_active
                                                            ? 'Aktif'
                                                            : 'Nonaktif'}
                                                    </button>
                                                </td>
                                                <td className="px-5 py-3 text-slate-500">
                                                    {item.starts_at ?? '-'}
                                                </td>
                                                <td className="px-5 py-3 text-slate-500">
                                                    {item.created_by}
                                                </td>
                                                <td className="px-5 py-3">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEdit(item)
                                                            }
                                                            className="h-7 text-xs"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                destroy(item.id)
                                                            }
                                                            className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            Hapus
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {announcements.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-5 py-12 text-center"
                                            >
                                                <Megaphone className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                                                <p className="text-sm text-slate-500">
                                                    Belum ada pengumuman global
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

GlobalAnnouncementsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Pengumuman Global', href: '/admin/global-announcements' },
    ],
};
