import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Upload,
    ChevronUp,
    ChevronDown,
    HelpCircle,
    X,
    GripVertical,
    FileText,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import TiptapEditor from '@/components/editor/tiptap-editor';

type CourseData = { id: number; judul: string };

type PertemuanData = {
    id: number;
    judul: string;
    deskripsi: string | null;
    gambar: string | null;
    gambar_raw: string | null;
    urutan: number;
};

type SectionData = {
    id: number;
    judul: string;
    konten: string | null;
    urutan: number;
};

type FileData = {
    id: number;
    nama_file: string;
    file_path: string;
    file_path_raw: string;
};

type QuizData = {
    id: number;
    soal: string;
    opsi: string[];
    jawaban_benar: string;
    urutan: number;
};

const OPSI_LABEL = ['A', 'B', 'C', 'D', 'E'];

export default function PertemuanEdit({
    course,
    pertemuan,
    sections,
    files,
    quiz,
}: {
    course: CourseData;
    pertemuan: PertemuanData;
    sections: SectionData[];
    files: FileData[];
    quiz: QuizData[];
}) {
    const { errors } = usePage().props;

    const [judul, setJudul] = useState(pertemuan.judul);
    const [deskripsi, setDeskripsi] = useState(pertemuan.deskripsi ?? '');
    const [urutan, setUrutan] = useState(pertemuan.urutan);

    return (
        <>
            <Head title={`Edit ${pertemuan.judul}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    <Link
                        href={`/materi/${course.id}/pertemuan`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Edit Pertemuan: {pertemuan.judul}
                            </h1>
                            <p className="text-sm text-slate-500">
                                {course.judul}
                            </p>
                        </div>
                    </div>

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* ── Pertemuan Info Form ── */}
                    <PertemuanInfoForm
                        courseId={course.id}
                        pertemuanId={pertemuan.id}
                        judul={judul}
                        setJudul={setJudul}
                        deskripsi={deskripsi}
                        setDeskripsi={setDeskripsi}
                        urutan={urutan}
                        setUrutan={setUrutan}
                        gambar={pertemuan.gambar}
                    />

                    {/* ── Sections ── */}
                    <SectionManager
                        courseId={course.id}
                        pertemuanId={pertemuan.id}
                        sections={sections}
                    />

                    {/* ── Files ── */}
                    <FileManager
                        courseId={course.id}
                        pertemuanId={pertemuan.id}
                        files={files}
                    />

                    {/* ── Quiz ── */}
                    <QuizManager
                        courseId={course.id}
                        pertemuanId={pertemuan.id}
                        quiz={quiz}
                    />
                </div>
            </div>
        </>
    );
}

/* ── Pertemuan Info Form ── */
function PertemuanInfoForm({
    courseId,
    pertemuanId,
    judul,
    setJudul,
    deskripsi,
    setDeskripsi,
    urutan,
    setUrutan,
    gambar,
}: {
    courseId: number;
    pertemuanId: number;
    judul: string;
    setJudul: (v: string) => void;
    deskripsi: string;
    setDeskripsi: (v: string) => void;
    urutan: number;
    setUrutan: (v: number) => void;
    gambar: string | null;
}) {
    const [submitting, setSubmitting] = useState(false);
    const { errors } = usePage().props;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const form = new FormData();
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);
        form.append('urutan', String(urutan));
        form.append('_method', 'PUT');

        router.post(`/materi/${courseId}/pertemuan/${pertemuanId}`, form, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="text-sm font-bold text-slate-900">Informasi Pertemuan</h2>

                <div className="space-y-2">
                    <Label htmlFor="judul">Judul</Label>
                    <Input id="judul" value={judul} onChange={(e) => setJudul(e.target.value)} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="deskripsi">Deskripsi</Label>
                    <Textarea id="deskripsi" value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={2} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="urutan">Urutan</Label>
                    <Input id="urutan" type="number" min={1} value={urutan} onChange={(e) => setUrutan(Number(e.target.value))} className="w-24" />
                </div>

                {gambar && (
                    <div>
                        <Label>Gambar Saat Ini</Label>
                        <div className="mt-1">
                            <img src={gambar} alt="" className="h-20 w-36 rounded-lg object-cover" />
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <Button type="submit" disabled={submitting} className="bg-blue-600 text-white hover:bg-blue-700">
                        <Save className="h-4 w-4" />
                        {submitting ? 'Menyimpan...' : 'Simpan Informasi'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

/* ── Section Manager ── */
function SectionManager({
    courseId,
    pertemuanId,
    sections: initialSections,
}: {
    courseId: number;
    pertemuanId: number;
    sections: SectionData[];
}) {
    const [sections, setSections] = useState(initialSections);
    const [newJudul, setNewJudul] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    function addSection() {
        if (!newJudul.trim()) return;
        setAdding(true);
        router.post(
            `/materi/${courseId}/pertemuan/${pertemuanId}/section`,
            { judul: newJudul, konten: '' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewJudul('');
                    setAdding(false);
                    router.reload({ only: ['sections'] });
                },
                onError: () => setAdding(false),
            },
        );
    }

    function deleteSection(id: number) {
        router.delete(
            `/materi/${courseId}/pertemuan/${pertemuanId}/section/${id}`,
            { preserveScroll: true, onSuccess: () => router.reload({ only: ['sections'] }) },
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Section Konten</h2>
            </div>

            <div className="flex gap-2">
                <Input
                    value={newJudul}
                    onChange={(e) => setNewJudul(e.target.value)}
                    placeholder="Judul section baru..."
                    className="flex-1"
                />
                <Button
                    onClick={addSection}
                    disabled={adding || !newJudul.trim()}
                    className="bg-orange-600 text-white hover:bg-orange-700"
                >
                    <Plus className="h-4 w-4" /> Tambah
                </Button>
            </div>

            <div className="space-y-3">
                {sections.map((section, idx) => (
                    <div key={section.id} className="rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-slate-300" />
                                <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                                <span className="text-sm font-semibold text-slate-700">{section.judul}</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() =>
                                        setEditingId(editingId === section.id ? null : section.id)
                                    }
                                    className="rounded-md px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                >
                                    {editingId === section.id ? 'Tutup' : 'Edit'}
                                </button>
                                <button
                                    onClick={() => deleteSection(section.id)}
                                    className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                        {editingId === section.id && (
                            <div className="p-3">
                                <SectionEditor
                                    courseId={courseId}
                                    pertemuanId={pertemuanId}
                                    section={section}
                                />
                            </div>
                        )}
                    </div>
                ))}
                {sections.length === 0 && (
                    <p className="py-4 text-center text-sm text-slate-400">
                        Belum ada section. Tambah section untuk konten pembelajaran.
                    </p>
                )}
            </div>
        </div>
    );
}

function SectionEditor({
    courseId,
    pertemuanId,
    section,
}: {
    courseId: number;
    pertemuanId: number;
    section: SectionData;
}) {
    const [judul, setJudul] = useState(section.judul);
    const [konten, setKonten] = useState(section.konten ?? '');
    const [saving, setSaving] = useState(false);

    function save() {
        setSaving(true);
        router.put(
            `/materi/${courseId}/pertemuan/${pertemuanId}/section/${section.id}`,
            { judul, konten },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
                onSuccess: () => router.reload({ only: ['sections'] }),
            },
        );
    }

    return (
        <div className="space-y-3">
            <Input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Judul section" />
            <TiptapEditor initialContent={konten} onChange={setKonten} />
            <div className="flex justify-end">
                <Button onClick={save} disabled={saving} size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Menyimpan...' : 'Simpan Section'}
                </Button>
            </div>
        </div>
    );
}

/* ── File Manager ── */
function FileManager({
    courseId,
    pertemuanId,
    files: initialFiles,
}: {
    courseId: number;
    pertemuanId: number;
    files: FileData[];
}) {
    const [uploading, setUploading] = useState(false);
    const { errors } = usePage().props;

    function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append('file', file);

        router.post(
            `/materi/${courseId}/pertemuan/${pertemuanId}/file`,
            form,
            {
                preserveScroll: true,
                onFinish: () => {
                    setUploading(false);
                    e.target.value = '';
                    router.reload({ only: ['files'] });
                },
            },
        );
    }

    function deleteFile(id: number) {
        router.delete(
            `/materi/${courseId}/pertemuan/${pertemuanId}/file/${id}`,
            { preserveScroll: true, onSuccess: () => router.reload({ only: ['files'] }) },
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">File Lampiran (maks. 10)</h2>
                <span className="text-xs text-slate-400">{initialFiles.length}/10</span>
            </div>

            {initialFiles.length < 10 && (
                <div className="flex items-center gap-3">
                    <Input
                        type="file"
                        onChange={uploadFile}
                        disabled={uploading}
                        className="flex-1"
                    />
                    {uploading && <span className="text-sm text-slate-500">Mengupload...</span>}
                </div>
            )}
            {errors.file && (
                <p className="text-xs text-red-500">{errors.file}</p>
            )}

            <div className="space-y-2">
                {initialFiles.map((f) => (
                    <div
                        key={f.id}
                        className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="truncate text-sm text-slate-700">{f.nama_file}</span>
                            <a
                                href={f.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 text-xs text-blue-600 hover:underline"
                            >
                                Lihat
                            </a>
                        </div>
                        <button
                            onClick={() => deleteFile(f.id)}
                            className="shrink-0 rounded-md p-1 text-red-500 hover:bg-red-50"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
                {initialFiles.length === 0 && (
                    <p className="py-2 text-center text-sm text-slate-400">Belum ada file lampiran.</p>
                )}
            </div>
        </div>
    );
}

/* ── Quiz Manager ── */
function QuizManager({
    courseId,
    pertemuanId,
    quiz: initialQuiz,
}: {
    courseId: number;
    pertemuanId: number;
    quiz: QuizData[];
}) {
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Quiz</h2>
                {!showAdd && (
                    <Button
                        onClick={() => setShowAdd(true)}
                        size="sm"
                        className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                        <Plus className="h-3.5 w-3.5" /> Tambah Soal
                    </Button>
                )}
            </div>

            {showAdd && (
                <QuizForm
                    courseId={courseId}
                    pertemuanId={pertemuanId}
                    onClose={() => setShowAdd(false)}
                />
            )}

            <div className="space-y-3">
                {initialQuiz.map((q, idx) => (
                    <div key={q.id} className="rounded-lg border border-slate-200">
                        {editId === q.id ? (
                            <div className="p-4">
                                <QuizEditForm
                                    courseId={courseId}
                                    pertemuanId={pertemuanId}
                                    quiz={q}
                                    onClose={() => setEditId(null)}
                                />
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {idx + 1}. {q.soal}
                                        </p>
                                        <div className="mt-2 space-y-1">
                                            {q.opsi.map((o, oi) => (
                                                <p
                                                    key={oi}
                                                    className={`text-sm ${
                                                        OPSI_LABEL[oi] === q.jawaban_benar
                                                            ? 'font-semibold text-emerald-700'
                                                            : 'text-slate-600'
                                                    }`}
                                                >
                                                    {OPSI_LABEL[oi]}. {o}
                                                    {OPSI_LABEL[oi] === q.jawaban_benar && (
                                                        <span className="ml-1.5 text-[10px] text-emerald-500">(Benar)</span>
                                                    )}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-1">
                                        <button
                                            onClick={() => setEditId(q.id)}
                                            className="rounded-md px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Hapus soal ini?')) {
                                                    router.delete(
                                                        `/materi/${courseId}/pertemuan/${pertemuanId}/quiz/${q.id}`,
                                                        {
                                                            preserveScroll: true,
                                                            onSuccess: () =>
                                                                router.reload({ only: ['quiz'] }),
                                                        },
                                                    );
                                                }
                                            }}
                                            className="rounded-md px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {initialQuiz.length === 0 && !showAdd && (
                    <p className="py-4 text-center text-sm text-slate-400">
                        Belum ada soal quiz. Tambah soal untuk pertemuan ini.
                    </p>
                )}
            </div>
        </div>
    );
}

function QuizForm({
    courseId,
    pertemuanId,
    onClose,
}: {
    courseId: number;
    pertemuanId: number;
    onClose: () => void;
}) {
    const [soal, setSoal] = useState('');
    const [opsi, setOpsi] = useState<string[]>(['', '']);
    const [jawabanBenar, setJawabanBenar] = useState('');
    const [saving, setSaving] = useState(false);

    function addOpsi() {
        if (opsi.length < 5) setOpsi([...opsi, '']);
    }

    function removeOpsi(idx: number) {
        if (opsi.length <= 2) return;
        const newOpsi = opsi.filter((_, i) => i !== idx);
        setOpsi(newOpsi);
        if (OPSI_LABEL[idx] === jawabanBenar) setJawabanBenar('');
    }

    function save() {
        if (!soal.trim() || opsi.some((o) => !o.trim()) || !jawabanBenar) return;
        setSaving(true);
        router.post(
            `/materi/${courseId}/pertemuan/${pertemuanId}/quiz`,
            { soal, opsi, jawaban_benar: jawabanBenar },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    router.reload({ only: ['quiz'] });
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
            <Textarea
                value={soal}
                onChange={(e) => setSoal(e.target.value)}
                placeholder="Tulis soal..."
                rows={2}
            />

            <div className="space-y-2">
                {opsi.map((o, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 text-sm font-bold text-slate-500">{OPSI_LABEL[idx]}.</span>
                        <Input
                            value={o}
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[idx] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                            placeholder={`Opsi ${OPSI_LABEL[idx]}`}
                            className="flex-1"
                        />
                        {opsi.length > 2 && (
                            <button
                                onClick={() => removeOpsi(idx)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
                {opsi.length < 5 && (
                    <button
                        onClick={addOpsi}
                        className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                    >
                        + Tambah opsi
                    </button>
                )}
            </div>

            <div className="space-y-1">
                <Label>Jawaban Benar</Label>
                <Select value={jawabanBenar} onValueChange={setJawabanBenar}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                        {opsi.map((_, idx) => (
                            <SelectItem key={idx} value={OPSI_LABEL[idx]}>
                                {OPSI_LABEL[idx]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} size="sm">Batal</Button>
                <Button
                    onClick={save}
                    disabled={saving || !soal.trim() || opsi.some((o) => !o.trim()) || !jawabanBenar}
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Menyimpan...' : 'Simpan Soal'}
                </Button>
            </div>
        </div>
    );
}

function QuizEditForm({
    courseId,
    pertemuanId,
    quiz,
    onClose,
}: {
    courseId: number;
    pertemuanId: number;
    quiz: QuizData;
    onClose: () => void;
}) {
    const [soal, setSoal] = useState(quiz.soal);
    const [opsi, setOpsi] = useState(quiz.opsi);
    const [jawabanBenar, setJawabanBenar] = useState(quiz.jawaban_benar);
    const [saving, setSaving] = useState(false);

    function addOpsi() {
        if (opsi.length < 5) setOpsi([...opsi, '']);
    }

    function removeOpsi(idx: number) {
        if (opsi.length <= 2) return;
        const newOpsi = opsi.filter((_, i) => i !== idx);
        setOpsi(newOpsi);
        if (OPSI_LABEL[idx] === jawabanBenar) setJawabanBenar('');
    }

    function save() {
        if (!soal.trim() || opsi.some((o) => !o.trim()) || !jawabanBenar) return;
        setSaving(true);
        router.put(
            `/materi/${courseId}/pertemuan/${pertemuanId}/quiz/${quiz.id}`,
            { soal, opsi, jawaban_benar: jawabanBenar },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    router.reload({ only: ['quiz'] });
                },
                onFinish: () => setSaving(false),
            },
        );
    }

    return (
        <div className="space-y-3">
            <Textarea value={soal} onChange={(e) => setSoal(e.target.value)} rows={2} />

            <div className="space-y-2">
                {opsi.map((o, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 text-sm font-bold text-slate-500">{OPSI_LABEL[idx]}.</span>
                        <Input
                            value={o}
                            onChange={(e) => {
                                const newOpsi = [...opsi];
                                newOpsi[idx] = e.target.value;
                                setOpsi(newOpsi);
                            }}
                            className="flex-1"
                        />
                        {opsi.length > 2 && (
                            <button onClick={() => removeOpsi(idx)} className="text-red-400 hover:text-red-600">
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
                {opsi.length < 5 && (
                    <button onClick={addOpsi} className="text-sm font-semibold text-purple-600">
                        + Tambah opsi
                    </button>
                )}
            </div>

            <div className="space-y-1">
                <Label>Jawaban Benar</Label>
                <Select value={jawabanBenar} onValueChange={setJawabanBenar}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                        {opsi.map((_, idx) => (
                            <SelectItem key={idx} value={OPSI_LABEL[idx]}>
                                {OPSI_LABEL[idx]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose} size="sm">Batal</Button>
                <Button
                    onClick={save}
                    disabled={saving || !soal.trim() || opsi.some((o) => !o.trim()) || !jawabanBenar}
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </div>
    );
}

PertemuanEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Edit Pertemuan', href: '#' },
    ],
};
