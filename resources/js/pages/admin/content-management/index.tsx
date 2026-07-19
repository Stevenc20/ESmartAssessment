import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { BookOpen, Layers, Medal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type BadgeItem = {
    id: number; badge_name: string; icon: string | null;
    description: string | null; total_penerima: number; created_at: string;
};

type PageProps = { badges: BadgeItem[]; materiKategori: string[] };

const colorAccents: Record<string, { bg: string; text: string; ring: string }> = {
    canva:      { bg: 'bg-cyan-50',    text: 'text-cyan-700',    ring: 'border-cyan-200'    },
    photoshop:  { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'border-blue-200'    },
    illustrator:{ bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'border-amber-200'   },
    uiux:       { bg: 'bg-purple-50',  text: 'text-purple-700',  ring: 'border-purple-200'  },
    web:        { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'border-emerald-200' },
};

export default function ContentManagementIndex({ badges, materiKategori }: PageProps) {
    const [openBadge, setOpenBadge] = useState(false);
    const [editBadge, setEditBadge] = useState<BadgeItem | null>(null);
    const { errors } = usePage().props;
    const { data, setData, post, put, processing, reset } = useForm({
        badge_name: '', icon: '', description: '',
    });

    function openCreateBadge() { setEditBadge(null); reset(); setOpenBadge(true); }

    function openEditBadge(item: BadgeItem) {
        setEditBadge(item);
        setData({ badge_name: item.badge_name, icon: item.icon ?? '', description: item.description ?? '' });
        setOpenBadge(true);
    }

    function submitBadge(e: React.FormEvent) {
        e.preventDefault();
        if (editBadge) {
            put(`/admin/content-management/badges/${editBadge.id}`, {
                preserveScroll: true,
                onSuccess: () => { setOpenBadge(false); reset(); toast.success('Badge diperbarui'); },
            });
        } else {
            post('/admin/content-management/badges', {
                preserveScroll: true,
                onSuccess: () => { setOpenBadge(false); reset(); toast.success('Badge dibuat'); },
            });
        }
    }

    function destroyBadge(id: number) {
        if (confirm('Hapus badge ini?')) router.delete(`/admin/content-management/badges/${id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Badge dihapus'),
        });
    }

    return (
        <>
            <Head title="Content Management" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                <div>
                    <h1 className="text-xl font-black text-slate-900">Content Management</h1>
                    <p className="mt-0.5 text-sm text-slate-500">Kelola kategori materi dan badge yang tersedia di platform</p>
                </div>

                {/* Kategori Materi */}
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="flex-row items-center gap-2.5 border-b border-slate-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <Layers className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold text-slate-900">Kategori Materi</CardTitle>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {materiKategori.length}
                        </span>
                    </CardHeader>
                    <CardContent className="p-5">
                        {materiKategori.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {materiKategori.map((kat) => {
                                    const lower = kat.toLowerCase();
                                    const accent = colorAccents[lower] ?? { bg: 'bg-slate-50', text: 'text-slate-700', ring: 'border-slate-200' };
                                    return (
                                        <span key={kat} className={`inline-flex items-center gap-1.5 rounded-md border ${accent.ring} ${accent.bg} ${accent.text} px-3 py-1.5 text-xs font-semibold`}>
                                            <BookOpen className="h-3 w-3" />
                                            {kat}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Belum ada kategori materi</p>
                        )}
                    </CardContent>
                </Card>

                {/* Badge Management */}
                <Card className="border-slate-200 bg-white">
                    <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                <Medal className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-sm font-bold text-slate-900">Badge</CardTitle>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {badges.length}
                            </span>
                        </div>
                        <Dialog open={openBadge} onOpenChange={setOpenBadge}>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={openCreateBadge} className="bg-slate-900 text-white hover:bg-slate-800">
                                    <Plus className="mr-1 h-3.5 w-3.5" />Tambah Badge
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>{editBadge ? 'Edit' : 'Buat'} Badge</DialogTitle></DialogHeader>
                                <form onSubmit={submitBadge} className="space-y-4">
                                    <div>
                                        <Label>Nama Badge</Label>
                                        <Input value={data.badge_name} onChange={e => setData('badge_name', e.target.value)} />
                                        {errors.badge_name && <p className="mt-1 text-sm text-red-500">{errors.badge_name}</p>}
                                    </div>
                                    <div>
                                        <Label>Icon (emoji atau URL)</Label>
                                        <Input value={data.icon} onChange={e => setData('icon', e.target.value)} placeholder="🎨 atau /icons/designer.svg" />
                                    </div>
                                    <div>
                                        <Label>Deskripsi (termasuk kriteria)</Label>
                                        <Textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)}
                                            placeholder="Minimal: Nilai 85 & Portfolio 10" />
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                        <Button type="button" variant="outline" onClick={() => setOpenBadge(false)}>Batal</Button>
                                        <Button type="submit" disabled={processing} className="bg-slate-900 text-white hover:bg-slate-800">
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-5">
                        {badges.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {badges.map((b) => (
                                    <div key={b.id} className="group flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg">
                                            {b.icon || <Medal className="h-5 w-5 text-amber-700" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-slate-900">{b.badge_name}</p>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{b.description || '-'}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-[10px] text-slate-700 hover:bg-slate-100">
                                                    {b.total_penerima} penerima
                                                </Badge>
                                                <button onClick={() => openEditBadge(b)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Edit</button>
                                                <button onClick={() => destroyBadge(b.id)} className="text-xs font-semibold text-red-600 hover:text-red-700">Hapus</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                <Medal className="h-8 w-8 text-slate-300" />
                                <p className="text-sm text-slate-500">Belum ada badge</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ContentManagementIndex.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Content Management', href: '/admin/content-management' }],
};
