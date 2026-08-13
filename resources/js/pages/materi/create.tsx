import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useRef, useState } from 'react';
import type {
    PickedFile,
    PickedFolder,
} from '@/components/materi/materi-folder-upload';
import MateriFolderUpload from '@/components/materi/materi-folder-upload';
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

type PertemuanItem = { id: number; judul: string; tingkat: string | null };

type MateriLinkItem = {
    id: number;
    judul: string;
    pertemuan: string;
    roadmap: string;
    tingkat: string | null;
};

export default function MateriCreate({
    pertemuanList,
    materiList,
}: {
    pertemuanList: PertemuanItem[];
    materiList: MateriLinkItem[];
}) {
    const { errors } = usePage().props;
    const thumbRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'new' | 'link'>('new');
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [pertemuanId, setPertemuanId] = useState('');
    const [linkMateriId, setLinkMateriId] = useState('');
    const [tingkat, setTingkat] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [driveLink, setDriveLink] = useState('');
    const [pollPertanyaan, setPollPertanyaan] = useState('');
    const [pollOpsi, setPollOpsi] = useState<string[]>(['', '']);
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [folders, setFolders] = useState<PickedFolder[]>([]);
    const [files, setFiles] = useState<PickedFile[]>([]);

    const addOpsi = () => setPollOpsi([...pollOpsi, '']);
    const removeOpsi = (idx: number) => setPollOpsi(pollOpsi.filter((_, i) => i !== idx));
    const updateOpsi = (idx: number, val: string) => {
        const next = [...pollOpsi];
        next[idx] = val;
        setPollOpsi(next);
    };

    const filteredPertemuan = tingkat
        ? pertemuanList.filter(p => p.tingkat === tingkat || p.tingkat === null)
        : pertemuanList;

    const filteredLinkMateri = tingkat
        ? materiList.filter(m => m.tingkat === tingkat || m.tingkat === null)
        : materiList;

    function handleTingkatChange(v: string) {
        setTingkat(v);

        if (pertemuanId) {
            const stillValid = v
                ? pertemuanList.some(p => String(p.id) === pertemuanId && (p.tingkat === v || p.tingkat === null))
                : true;

            if (!stillValid) {
                setPertemuanId('');
            }
        }

        if (linkMateriId) {
            const stillValid = v
                ? materiList.some(m => String(m.id) === linkMateriId && (m.tingkat === v || m.tingkat === null))
                : true;

            if (!stillValid) {
                setLinkMateriId('');
            }
        }
    }

    function handleLinkMateriChange(v: string) {
        setLinkMateriId(v);
        const source = materiList.find(m => String(m.id) === v);

        if (source) {
            setJudul(source.judul);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setUploadProgress(0);

        if (mode === 'link') {
            const form = new FormData();
            form.append('pertemuan_id', pertemuanId);
            form.append('linked_materi_id', linkMateriId);
            form.append('judul', judul);

            if (tingkat) {
                form.append('tingkat', tingkat);
            }

            router.post('/materi', form, {
                preserveScroll: true,
                forceFormData: true,
                onFinish: () => setProcessing(false),
            });

            return;
        }

        const form = new FormData();
        form.append('pertemuan_id', pertemuanId);
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);

        if (tingkat) {
            form.append('tingkat', tingkat);
        }

        if (thumbRef.current?.files?.[0]) {
            form.append('thumbnail', thumbRef.current.files[0]);
        }

        if (fileRef.current?.files?.[0]) {
            form.append('pdf_file', fileRef.current.files[0]);
        }

        form.append('video_url', videoUrl);
        form.append('drive_link', driveLink);

        folders.forEach((folder, idx) => {
            form.append(`folders[${idx}][nama]`, folder.nama);
            folder.files.forEach((file) => {
                form.append(`folders[${idx}][files][]`, file, file.name);
                form.append(`folders[${idx}][names][]`, file.webkitRelativePath);
            });
        });

        files.forEach((f) => {
            form.append('files[]', f.file, f.file.name);
        });

        if (pollPertanyaan.trim()) {
            form.append('poll_pertanyaan', pollPertanyaan.trim());
            pollOpsi.forEach((opsi, idx) => {
                if (opsi.trim()) {
                    form.append(`poll_opsi[${idx}]`, opsi.trim());
                }
            });
        }

        router.post('/materi', form, {
            preserveScroll: true,
            forceFormData: true,
            onProgress: (progress) => setUploadProgress(progress?.percentage ?? 0),
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

                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
                    <button
                        type="button"
                        onClick={() => setMode('new')}
                        className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                            mode === 'new'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Buat Materi Baru
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('link')}
                        className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                            mode === 'link'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        Tautkan Materi Sebelumnya
                    </button>
                </div>

                {mode === 'link' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Link Materi Sebelumnya</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submit}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div className="col-span-2 rounded-xl border border-blue-100 bg-blue-50/40 p-4 text-xs text-blue-700">
                                    Materi yang dibuat akan menampilkan konten,
                                    file, quiz, dan tugas dari materi sumber.
                                    Perubahan pada materi sumber akan otomatis
                                    terlihat di sini. Progress siswa tetap
                                    dicatat terpisah per pertemuan.
                                </div>

                                <div>
                                    <Label>Kelas</Label>
                                    <Select
                                        value={tingkat}
                                        onValueChange={handleTingkatChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Semua kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua kelas</SelectItem>
                                            <SelectItem value="10">Genesis 10</SelectItem>
                                            <SelectItem value="11">Ascend 11</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Pertemuan Tujuan</Label>
                                    {filteredPertemuan.length > 0 ? (
                                        <Select
                                            value={pertemuanId}
                                            onValueChange={(v) =>
                                                setPertemuanId(v)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih pertemuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredPertemuan.map((p) => (
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
                                    {errors.pertemuan_id && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.pertemuan_id}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label>Materi Sumber</Label>
                                    {filteredLinkMateri.length > 0 ? (
                                        <Select
                                            value={linkMateriId}
                                            onValueChange={handleLinkMateriChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih materi sebelumnya" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredLinkMateri.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={String(m.id)}
                                                    >
                                                        {m.pertemuan} · {m.judul}
                                                        {m.roadmap !== '-' ? ` (${m.roadmap})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">
                                            Tidak ada materi yang bisa ditautkan
                                        </p>
                                    )}
                                    {errors.linked_materi_id && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.linked_materi_id}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <Label>Judul Materi</Label>
                                    <Input
                                        value={judul}
                                        onChange={(e) =>
                                            setJudul(e.target.value)
                                        }
                                        placeholder="Terisi otomatis dari materi sumber"
                                    />
                                    {errors.judul && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.judul}
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
                                        {processing ? 'Menyimpan...' : 'Tautkan Materi'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {mode === 'new' && (
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
                                    <Label>Kelas</Label>
                                    <Select
                                        value={tingkat}
                                        onValueChange={handleTingkatChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Semua kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Semua kelas</SelectItem>
                                            <SelectItem value="10">Genesis 10</SelectItem>
                                            <SelectItem value="11">Ascend 11</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Pertemuan (opsional)</Label>
                                    {filteredPertemuan.length > 0 ? (
                                        <Select
                                            value={pertemuanId}
                                            onValueChange={(v) =>
                                                setPertemuanId(v)
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih pertemuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredPertemuan.map((p) => (
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
                                    {thumbPreview && (
                                        <div className="mb-2 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                            <img
                                                src={thumbPreview}
                                                alt=""
                                                className="h-auto w-full"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        ref={thumbRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (thumbPreview) {
                                                URL.revokeObjectURL(thumbPreview);
                                            }

                                            setThumbPreview(file ? URL.createObjectURL(file) : null);
                                        }}
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

                                {/* Polling / Voting Section */}
                                <div className="col-span-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-indigo-900">
                                            Tambah Polling / Voting (Opsional)
                                        </h3>
                                        <p className="text-xs text-indigo-700">
                                            Buat pertanyaan polling untuk dijawab oleh siswa di dalam materi
                                        </p>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Pertanyaan Polling</Label>
                                        <Input
                                            value={pollPertanyaan}
                                            onChange={(e) => setPollPertanyaan(e.target.value)}
                                            placeholder="Contoh: Manakah dari algoritma berikut yang memiliki kompleksitas O(1)?"
                                            className="bg-white text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2 pt-1">
                                        <Label className="text-xs">Pilihan Jawaban (Opsi)</Label>
                                        {pollOpsi.map((opsi, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-indigo-700 w-5">
                                                    {String.fromCharCode(65 + idx)}.
                                                </span>
                                                <Input
                                                    value={opsi}
                                                    onChange={(e) => updateOpsi(idx, e.target.value)}
                                                    placeholder={`Opsi ${idx + 1}`}
                                                    className="bg-white text-xs flex-1"
                                                />
                                                {pollOpsi.length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeOpsi(idx)}
                                                        className="text-red-500 hover:bg-red-50 text-xs px-2"
                                                    >
                                                        Hapus
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addOpsi}
                                            className="text-xs font-semibold mt-1"
                                        >
                                            + Tambah Opsi Jawaban
                                        </Button>
                                    </div>
                                </div>

                                {/* Folder Materi Section */}
                                <div className="col-span-2">
                                    <MateriFolderUpload
                                        folders={folders}
                                        files={files}
                                        onFoldersChange={setFolders}
                                        onFilesChange={setFiles}
                                    />
                                    {errors.folders && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.folders}
                                        </p>
                                    )}
                                    {errors.files && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.files}
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
                )}
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