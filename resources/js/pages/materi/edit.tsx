import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import TiptapEditor from '@/components/editor/tiptap-editor';

type PertemuanItem = { id: number; judul: string; tingkat: string | null };

type QuizItem = {
    id: number;
    soal: string;
    opsi: string[];
    jawaban_benar: string;
    urutan: number;
};

type MateriItem = {
    id: number;
    pertemuan_id: number | null;
    judul: string;
    deskripsi: string | null;
    konten: string | null;
    thumbnail: string | null;
    video_url: string | null;
    pdf_file: string | null;
    pdf_file_name: string | null;
    drive_link: string | null;
    tingkat: string | null;
};

export default function MateriEdit({
    materi,
    pertemuanList,
    quiz: quizList,
}: {
    materi: MateriItem;
    pertemuanList: PertemuanItem[];
    quiz: QuizItem[];
}) {
    const { errors } = usePage().props;
    const thumbRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [judul, setJudul] = useState(materi.judul);
    const [deskripsi, setDeskripsi] = useState(materi.deskripsi ?? '');
    const [konten, setKonten] = useState(materi.konten ?? '');
    const [pertemuanId, setPertemuanId] = useState(
        materi.pertemuan_id ? String(materi.pertemuan_id) : '',
    );
    const [tingkat, setTingkat] = useState(materi.tingkat ?? '');
    const [videoUrl, setVideoUrl] = useState(materi.video_url ?? '');
    const [driveLink, setDriveLink] = useState(materi.drive_link ?? '');
    const [processing, setProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [showQuizForm, setShowQuizForm] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
    const [quizSoal, setQuizSoal] = useState('');
    const [quizOpsi, setQuizOpsi] = useState<string[]>(['', '']);
    const [quizJawaban, setQuizJawaban] = useState('');

    const filteredPertemuan = tingkat
        ? pertemuanList.filter(p => p.tingkat === tingkat || p.tingkat === null)
        : pertemuanList;

    useEffect(() => {
        if (tingkat && !pertemuanId) {
            return;
        }
        if (pertemuanId) {
            const stillValid = tingkat
                ? pertemuanList.some(p => String(p.id) === pertemuanId && (p.tingkat === tingkat || p.tingkat === null))
                : true;
            if (!stillValid) setPertemuanId('');
        }
    }, [tingkat]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setUploadProgress(0);

        const form = new FormData();
        form.append('_method', 'PUT');
        form.append('pertemuan_id', pertemuanId);
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);
        form.append('konten', konten);
        if (tingkat) form.append('tingkat', tingkat);

        if (thumbRef.current?.files?.[0]) {
            form.append('thumbnail', thumbRef.current.files[0]);
        }

        if (fileRef.current?.files?.[0]) {
            form.append('pdf_file', fileRef.current.files[0]);
        }

        form.append('video_url', videoUrl);
        form.append('drive_link', driveLink);

        router.post(`/materi/${materi.id}`, form, {
            preserveScroll: true,
            forceFormData: true,
            onProgress: (progress) => setUploadProgress(progress?.percentage ?? 0),
            onFinish: () => {
                setProcessing(false);
                setUploadProgress(0);
            },
        });
    }

    function openQuizForm(quiz?: QuizItem) {
        if (quiz) {
            setEditingQuizId(quiz.id);
            setQuizSoal(quiz.soal);
            setQuizOpsi([...quiz.opsi]);
            setQuizJawaban(quiz.jawaban_benar);
        } else {
            setEditingQuizId(null);
            setQuizSoal('');
            setQuizOpsi(['', '']);
            setQuizJawaban('');
        }
        setShowQuizForm(true);
    }

    function closeQuizForm() {
        setShowQuizForm(false);
        setEditingQuizId(null);
        setQuizSoal('');
        setQuizOpsi(['', '']);
        setQuizJawaban('');
    }

    function submitQuiz(e: React.FormEvent) {
        e.preventDefault();
        const payload = {
            soal: quizSoal,
            opsi: quizOpsi.filter(o => o.trim() !== ''),
            jawaban_benar: quizJawaban,
        };

        if (editingQuizId) {
            router.put(`/materi/${materi.id}/quiz/${editingQuizId}`, payload, {
                preserveScroll: true,
                onFinish: () => closeQuizForm(),
            });
        } else {
            router.post(`/materi/${materi.id}/quiz`, payload, {
                preserveScroll: true,
                onFinish: () => closeQuizForm(),
            });
        }
    }

    function deleteQuiz(quizId: number) {
        if (!confirm('Hapus soal ini?')) return;
        router.delete(`/materi/${materi.id}/quiz/${quizId}`, {
            preserveScroll: true,
        });
    }

    function addOpsi() {
        if (quizOpsi.length >= 5) return;
        setQuizOpsi([...quizOpsi, '']);
    }

    function removeOpsi(idx: number) {
        if (quizOpsi.length <= 2) return;
        const newOpsi = quizOpsi.filter((_, i) => i !== idx);
        setQuizOpsi(newOpsi);
        if (quizJawaban === quizOpsi[idx]) {
            setQuizJawaban('');
        }
    }

    function updateOpsi(idx: number, value: string) {
        const newOpsi = [...quizOpsi];
        newOpsi[idx] = value;
        setQuizOpsi(newOpsi);
    }

    const validOpsi = quizOpsi.filter(o => o.trim() !== '');
    const canSaveQuiz = quizSoal.trim() && validOpsi.length >= 2 && quizJawaban;

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
                            <h1 className="text-xl font-bold text-slate-900">
                                Edit Materi
                            </h1>
                            <p className="text-sm text-slate-500">
                                {materi.judul}
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

                                <div className="col-span-2">
                                    <Label>Konten</Label>
                                    <TiptapEditor
                                        key={materi.id}
                                        initialContent={materi.konten ?? ''}
                                        onChange={setKonten}
                                        placeholder="Tulis konten materi di sini..."
                                    />
                                    {errors.konten && (
                                        <p className="mt-1 text-sm text-red-500">
                                            {errors.konten}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Kelas</Label>
                                    <Select
                                        value={tingkat}
                                        onValueChange={setTingkat}
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
                                    {materi.thumbnail && (
                                        <p className="mb-1 truncate text-xs text-slate-500">
                                            File: {materi.thumbnail}
                                        </p>
                                    )}
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
                                    {materi.pdf_file && (
                                        <p className="mb-1 truncate text-xs text-slate-500">
                                            File: {materi.pdf_file_name}
                                        </p>
                                    )}
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

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Quiz / Kuis</CardTitle>
                                {!showQuizForm && (
                                    <Button
                                        type="button"
                                        onClick={() => openQuizForm()}
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                    >
                                        <Plus className="h-4 w-4" /> Tambah Soal
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {errors.quiz && (
                                <p className="text-sm text-red-500">{errors.quiz}</p>
                            )}

                            {showQuizForm && (
                                <form
                                    onSubmit={submitQuiz}
                                    className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div>
                                        <Label>Soal</Label>
                                        <Textarea
                                            value={quizSoal}
                                            onChange={(e) =>
                                                setQuizSoal(e.target.value)
                                            }
                                            placeholder="Masukkan soal"
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Opsi Jawaban (min 2, max 5)</Label>
                                        {quizOpsi.map((o, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="w-5 text-xs font-semibold text-slate-400">
                                                    {i + 1}.
                                                </span>
                                                <Input
                                                    value={o}
                                                    onChange={(e) =>
                                                        updateOpsi(
                                                            i,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={`Opsi ${i + 1}`}
                                                    className="flex-1"
                                                />
                                                {quizOpsi.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeOpsi(i)
                                                        }
                                                        className="px-1 text-sm font-bold text-red-400 hover:text-red-600"
                                                    >
                                                        X
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {quizOpsi.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={addOpsi}
                                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                + Tambah opsi
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Jawaban Benar</Label>
                                        {validOpsi.length >= 2 ? (
                                            <Select
                                                value={quizJawaban}
                                                onValueChange={setQuizJawaban}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih jawaban benar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {validOpsi.map((o, i) => (
                                                        <SelectItem
                                                            key={i}
                                                            value={o}
                                                        >
                                                            {o}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-xs italic text-slate-400">
                                                Tambahkan minimal 2 opsi terlebih
                                                dahulu
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={closeQuizForm}
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={!canSaveQuiz}
                                            className="bg-orange-600 text-white hover:bg-orange-700"
                                        >
                                            {editingQuizId
                                                ? 'Simpan Perubahan'
                                                : 'Tambah Soal'}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {quizList.length === 0 && !showQuizForm && (
                                <p className="py-4 text-center text-sm italic text-slate-400">
                                    Belum ada soal quiz
                                </p>
                            )}

                            {quizList.length > 0 && (
                                <div className="space-y-3">
                                    {quizList.map((q, idx) => (
                                        <div
                                            key={q.id}
                                            className="rounded-lg border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        <span className="mr-1 text-slate-400">
                                                            {idx + 1}.
                                                        </span>{' '}
                                                        {q.soal}
                                                    </p>
                                                    <ul className="mt-2 space-y-1">
                                                        {q.opsi.map((o, i) => (
                                                            <li
                                                                key={i}
                                                                className={`flex items-center gap-1.5 text-xs ${
                                                                    o ===
                                                                    q.jawaban_benar
                                                                        ? 'font-semibold text-emerald-600'
                                                                        : 'text-slate-600'
                                                                }`}
                                                            >
                                                                <span
                                                                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                                                        o ===
                                                                        q.jawaban_benar
                                                                            ? 'bg-emerald-100 text-emerald-600'
                                                                            : 'bg-slate-100 text-slate-400'
                                                                    }`}
                                                                >
                                                                    <span className="text-[10px]">
                                                                        {String.fromCharCode(
                                                                            65 + i,
                                                                        )}
                                                                    </span>
                                                                </span>
                                                                {o}
                                                                {o ===
                                                                    q.jawaban_benar && (
                                                                    <span className="text-[10px] text-emerald-500">
                                                                        (benar)
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openQuizForm(q)
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteQuiz(q.id)
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
