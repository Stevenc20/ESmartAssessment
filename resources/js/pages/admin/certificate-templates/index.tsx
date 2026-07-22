import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Award, Check, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

type Template = {
    id: number;
    nama_template: string;
    nama_sekolah: string | null;
    is_default: boolean;
    is_active: boolean;
    created_by: string;
    created_at: string;
};

type PageProps = { templates: Template[] };

export default function CertificateTemplatesIndex({ templates }: PageProps) {
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<Template | null>(null);
    const { errors } = usePage().props;
    const { data, setData, post, put, processing, reset } = useForm({
        nama_template: '',
        nama_sekolah: '',
        keterangan: '',
        is_default: false,
    });

    function openCreate() {
        setEditItem(null);
        reset();
        setOpen(true);
    }

    function openEdit(item: Template) {
        setEditItem(item);
        setData({
            nama_template: item.nama_template,
            nama_sekolah: item.nama_sekolah ?? '',
            keterangan: '',
            is_default: item.is_default,
        });
        setOpen(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        if (editItem) {
            put(`/admin/certificate-templates/${editItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                    toast.success('Template diperbarui');
                },
            });
        } else {
            post('/admin/certificate-templates', {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    reset();
                    toast.success('Template dibuat');
                },
            });
        }
    }

    function destroy(id: number) {
        if (confirm('Hapus template ini?')) {
router.delete(`/admin/certificate-templates/${id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success('Template dihapus'),
            });
}
    }

    function setDefault(id: number) {
        router.put(
            `/admin/certificate-templates/${id}/set-default`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Template default diubah'),
            },
        );
    }

    return (
        <>
            <Head title="Sertifikat" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">
                            Template Sertifikat
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Kelola template sertifikat untuk seluruh platform
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={openCreate}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Tambah Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editItem ? 'Edit' : 'Buat'} Template
                                    Sertifikat
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label>Nama Template</Label>
                                    <Input
                                        value={data.nama_template}
                                        onChange={(e) =>
                                            setData(
                                                'nama_template',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.nama_template && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.nama_template}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label>Nama Sekolah</Label>
                                    <Input
                                        value={data.nama_sekolah}
                                        onChange={(e) =>
                                            setData(
                                                'nama_sekolah',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Keterangan</Label>
                                    <Textarea
                                        rows={3}
                                        value={data.keterangan}
                                        onChange={(e) =>
                                            setData(
                                                'keterangan',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_default}
                                        onChange={(e) =>
                                            setData(
                                                'is_default',
                                                e.target.checked,
                                            )
                                        }
                                        className="rounded"
                                    />
                                    <span className="text-sm font-medium">
                                        Jadikan template default
                                    </span>
                                </label>
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

                {/* Templates Grid */}
                {templates.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((t) => (
                            <Card
                                key={t.id}
                                className="group relative gap-0 border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
                            >
                                {t.is_default && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                        <Check className="h-3 w-3" />
                                        Default
                                    </div>
                                )}
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Award className="h-6 w-6" />
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-slate-900">
                                    {t.nama_template}
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {t.nama_sekolah ?? 'Belum diatur'}
                                </p>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                                    <span>oleh {t.created_by}</span>
                                    <span>{t.created_at}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {!t.is_default && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDefault(t.id)}
                                            className="h-7 text-xs"
                                        >
                                            Set Default
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(t)}
                                        className="h-7 text-xs"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => destroy(t.id)}
                                        className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="gap-0 border-slate-200 bg-white p-12 text-center">
                        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">
                            Belum ada template sertifikat
                        </p>
                        <Button
                            onClick={openCreate}
                            className="mx-auto mt-4 bg-slate-900 text-white hover:bg-slate-800"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Buat Template Pertama
                        </Button>
                    </Card>
                )}
            </div>
        </>
    );
}

CertificateTemplatesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Sertifikat', href: '/admin/certificate-templates' },
    ],
};
