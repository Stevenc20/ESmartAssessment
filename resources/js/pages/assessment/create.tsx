import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap } from 'lucide-react';

type MateriItem = { id: number; judul: string };

export default function AssessmentCreate({ materiList }: { materiList: MateriItem[] }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        materi_id: '',
        judul: '',
        deskripsi: '',
        deadline: '',
        bobot: '',
        max_revisi: '0',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/assessment', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Buat Assessment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Buat Assessment</h1>
                            <p className="text-sm text-slate-500">Buat tugas atau assessment baru untuk siswa</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Judul Assessment</Label>
                                    <Input value={data.judul} onChange={e => setData('judul', e.target.value)} placeholder="Masukkan judul assessment" />
                                    {errors.judul && <p className="mt-1 text-sm text-red-500">{errors.judul}</p>}
                                </div>

                                <div className="col-span-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} placeholder="Deskripsi assessment (opsional)" rows={3} />
                                    {errors.deskripsi && <p className="mt-1 text-sm text-red-500">{errors.deskripsi}</p>}
                                </div>

                                <div>
                                    <Label>Materi</Label>
                                    <Select value={data.materi_id} onValueChange={v => setData('materi_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih materi" /></SelectTrigger>
                                        <SelectContent>
                                            {materiList.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.judul}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.materi_id && <p className="mt-1 text-sm text-red-500">{errors.materi_id}</p>}
                                </div>

                                <div>
                                    <Label>Deadline</Label>
                                    <Input type="datetime-local" value={data.deadline} onChange={e => setData('deadline', e.target.value)} />
                                    {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
                                </div>

                                <div>
                                    <Label>Bobot</Label>
                                    <Input type="number" min="1" max="100" value={data.bobot} onChange={e => setData('bobot', e.target.value)} placeholder="1-100" />
                                    {errors.bobot && <p className="mt-1 text-sm text-red-500">{errors.bobot}</p>}
                                </div>

                                <div>
                                    <Label>Max Revisi</Label>
                                    <Input type="number" min="0" value={data.max_revisi} onChange={e => setData('max_revisi', e.target.value)} placeholder="0" />
                                    {errors.max_revisi && <p className="mt-1 text-sm text-red-500">{errors.max_revisi}</p>}
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <Link href="/assessment">
                                        <Button type="button" variant="outline">Batal</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AssessmentCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessment', href: '/assessment' },
        { title: 'Buat', href: '' },
    ],
};
