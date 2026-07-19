import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';

type PertemuanItem = { id: number; judul: string };
type MateriItem = {
    id: number;
    pertemuan_id: number | null;
    judul: string;
    deskripsi: string | null;
    thumbnail: string | null;
    video_url: string | null;
    pdf_file: string | null;
    pdf_file_name: string | null;
    drive_link: string | null;
};

export default function MateriEdit({ materi, pertemuanList }: { materi: MateriItem; pertemuanList: PertemuanItem[] }) {
    const { errors } = usePage().props;
    const thumbRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [judul, setJudul] = useState(materi.judul);
    const [deskripsi, setDeskripsi] = useState(materi.deskripsi ?? '');
    const [pertemuanId, setPertemuanId] = useState(materi.pertemuan_id ? String(materi.pertemuan_id) : '');
    const [videoUrl, setVideoUrl] = useState(materi.video_url ?? '');
    const [driveLink, setDriveLink] = useState(materi.drive_link ?? '');
    const [processing, setProcessing] = useState(false);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const form = new FormData();
        form.append('_method', 'PUT');
        form.append('pertemuan_id', pertemuanId);
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);
        if (thumbRef.current?.files?.[0]) form.append('thumbnail', thumbRef.current.files[0]);
        if (fileRef.current?.files?.[0]) form.append('pdf_file', fileRef.current.files[0]);
        form.append('video_url', videoUrl);
        form.append('drive_link', driveLink);

        router.post(`/materi/${materi.id}`, form, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title="Edit Materi" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Edit Materi</h1>
                            <p className="text-sm text-slate-500">{materi.judul}</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Materi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label>Judul Materi</Label>
                                    <Input value={judul} onChange={e => setJudul(e.target.value)} placeholder="Masukkan judul materi" />
                                    {errors.judul && <p className="mt-1 text-sm text-red-500">{errors.judul}</p>}
                                </div>

                                <div className="col-span-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} placeholder="Deskripsi materi (opsional)" rows={3} />
                                    {errors.deskripsi && <p className="mt-1 text-sm text-red-500">{errors.deskripsi}</p>}
                                </div>

                                <div>
                                    <Label>Pertemuan (opsional)</Label>
                                    {pertemuanList.length > 0 ? (
                                        <Select value={pertemuanId} onValueChange={v => setPertemuanId(v)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih pertemuan" /></SelectTrigger>
                                            <SelectContent>
                                                {pertemuanList.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.judul}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">Tidak ada pertemuan tersedia</p>
                                    )}
                                </div>

                                <div>
                                    <Label>Thumbnail</Label>
                                    {materi.thumbnail && (
                                        <p className="mb-1 truncate text-xs text-slate-500">File: {materi.thumbnail}</p>
                                    )}
                                    <Input
                                        ref={thumbRef}
                                        type="file"
                                        accept="image/*"
                                        className="file:mr-2 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {errors.thumbnail && <p className="mt-1 text-sm text-red-500">{errors.thumbnail}</p>}
                                </div>

                                <div>
                                    <Label>File Materi (PDF/DOC/PPT)</Label>
                                    {materi.pdf_file && (
                                        <p className="mb-1 truncate text-xs text-slate-500">File: {materi.pdf_file_name}</p>
                                    )}
                                    <Input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                        className="file:mr-2 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {errors.pdf_file && <p className="mt-1 text-sm text-red-500">{errors.pdf_file}</p>}
                                </div>

                                <div>
                                    <Label>Video URL</Label>
                                    <Input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="URL video (opsional)" />
                                    {errors.video_url && <p className="mt-1 text-sm text-red-500">{errors.video_url}</p>}
                                </div>

                                <div>
                                    <Label>Drive Link</Label>
                                    <Input value={driveLink} onChange={e => setDriveLink(e.target.value)} placeholder="Google Drive link (opsional)" />
                                    {errors.drive_link && <p className="mt-1 text-sm text-red-500">{errors.drive_link}</p>}
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <Link href="/materi">
                                        <Button type="button" variant="outline">Batal</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing} className="bg-orange-600 text-white hover:bg-orange-700">
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

MateriEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Edit', href: '' },
    ],
};
