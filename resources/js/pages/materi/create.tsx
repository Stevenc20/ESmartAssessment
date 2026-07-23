import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type PertemuanItem = { id: number; judul: string };

export default function MateriCreate({
    pertemuanList,
}: {
    pertemuanList: PertemuanItem[];
}) {
    const { errors } = usePage().props;
    const thumbRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [pertemuanId, setPertemuanId] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [driveLink, setDriveLink] = useState('');
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setUploadProgress(0);

        const form = new FormData();
        form.append('pertemuan_id', pertemuanId);
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);

        if (thumbRef.current?.files?.[0]) {
            form.append('thumbnail', thumbRef.current.files[0]);
        }

        if (fileRef.current?.files?.[0]) {
            form.append('pdf_file', fileRef.current.files[0]);
        }

        form.append('video_url', videoUrl);
        form.append('drive_link', driveLink);

        router.post('/materi', form, {
            preserveScroll: true,
            forceFormData: true,
            onProgress: (progress) => setUploadProgress(progress.percentage),
            onFinish: () => {
                setProcessing(false);
                setUploadProgress(0);
            },
        });
    }

    return (
        <>
            <Head title="Tambah Materi" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Tambah Materi
                            </h1>
                            <p className="text-sm text-slate-500">
                                Buat materi pembelajaran baru
                            </p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Materi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submit}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="col-span-2">
                                    <Label>Judul Materi</Label>
                                    <Input
                                        value={judul}
                                        onChange={(e) =>
                                            setJudul(e.target.value)
                                        }
                                        placeholder="Masukkan judul materi"
                                    />
                                    {errors.judul && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.judul}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label>Deskripsi</Label>
                                    <Textarea
                                        value={deskripsi}
                                        onChange={(e) =>
                                            setDeskripsi(e.target.value)
                                        }
                                        placeholder="Deskripsi materi (opsional)"
                                        rows={3}
                                    />
                                    {errors.deskripsi && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.deskripsi}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Pertemuan (opsional)</Label>
                                    {pertemuanList.length > 0 ? (
                                        <Select
                                            value={pertemuanId}
                                            onValueChange={(v) =>
                                                setPertemuanId(v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih pertemuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pertemuanList.map((p) => (
                                                    <SelectItem
                                                        key={p.id}
                                                        value={String(p.id)}
                                                    >
                                                        {p.judul}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">
                                            Tidak ada pertemuan tersedia
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Thumbnail</Label>
                                    <Input
                                        ref={thumbRef}
                                        type="file"
                                        accept="image/*"
                                        className="file:mr-2 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {errors.thumbnail && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.thumbnail}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>File Materi (PDF/DOC/PPT)</Label>
                                    <Input
                                        ref={fileRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                        className="file:mr-2 file:rounded-lg file:border-0 file:bg-orange-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {errors.pdf_file && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.pdf_file}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Video URL</Label>
                                    <Input
                                        value={videoUrl}
                                        onChange={(e) =>
                                            setVideoUrl(e.target.value)
                                        }
                                        placeholder="URL video (opsional)"
                                    />
                                    {errors.video_url && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.video_url}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Drive Link</Label>
                                    <Input
                                        value={driveLink}
                                        onChange={(e) =>
                                            setDriveLink(e.target.value)
                                        }
                                        placeholder="Google Drive link (opsional)"
                                    />
                                    {errors.drive_link && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.drive_link}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <Link href="/materi">
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-orange-600 text-white hover:bg-orange-700 min-w-[160px]"
                                    >
                                        {processing
                                            ? uploadProgress > 0
                                                ? `Menyimpan (${uploadProgress}%)`
                                                : 'Menyimpan...'
                                            : 'Simpan'}
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

MateriCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Tambah', href: '' },
    ],
};
