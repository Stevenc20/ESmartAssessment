import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ArrowLeft, Save, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type KelasGroup = {
    tingkat: string;
    kelas: { id: number; nama: string }[];
};

export default function CourseCreate({
    kelasOptions,
}: {
    kelasOptions: KelasGroup[];
}) {
    const { errors } = usePage().props;
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [assignToAll, setAssignToAll] = useState(false);
    const [classLevels, setClassLevels] = useState<string[]>([]);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const form = new FormData();
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);
        form.append('assign_to_all', assignToAll ? '1' : '0');
        if (!assignToAll) {
            classLevels.forEach((l) => form.append('class_levels[]', l));
        }
        if (thumbnail) {
            form.append('thumbnail', thumbnail);
        }

        router.post('/materi', form, {
            onFinish: () => setSubmitting(false),
        });
    }

    function toggleLevel(level: string) {
        setClassLevels((prev) =>
            prev.includes(level)
                ? prev.filter((l) => l !== level)
                : [...prev, level],
        );
    }

    return (
        <>
            <Head title="Tambah Course" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                    <Link
                        href="/materi"
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
                                Tambah Course Baru
                            </h1>
                            <p className="text-sm text-slate-500">
                                Buat course pembelajaran baru
                            </p>
                        </div>
                    </div>

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="judul">Judul Course</Label>
                                <Input
                                    id="judul"
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    placeholder="Contoh: Matematika Kelas 10"
                                    required
                                />
                                {errors.judul && (
                                    <p className="text-xs text-red-500">{errors.judul}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={deskripsi}
                                    onChange={(e) => setDeskripsi(e.target.value)}
                                    placeholder="Deskripsi singkat tentang course ini"
                                    rows={3}
                                />
                                {errors.deskripsi && (
                                    <p className="text-xs text-red-500">{errors.deskripsi}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Thumbnail</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
                                        className="flex-1"
                                    />
                                    {thumbnail && (
                                        <span className="text-xs text-slate-500">
                                            {thumbnail.name}
                                        </span>
                                    )}
                                </div>
                                {errors.thumbnail && (
                                    <p className="text-xs text-red-500">{errors.thumbnail}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Target Kelas</Label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={assignToAll}
                                        onChange={(e) => {
                                            setAssignToAll(e.target.checked);
                                            if (e.target.checked) setClassLevels([]);
                                        }}
                                        className="h-4 w-4 rounded border-slate-300"
                                    />
                                    <span className="text-sm text-slate-700">
                                        Semua tingkat (10, 11, 12)
                                    </span>
                                </label>

                                {!assignToAll && (
                                    <div className="ml-6 flex flex-wrap gap-3">
                                        {['10', '11', '12'].map((level) => (
                                            <label
                                                key={level}
                                                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={classLevels.includes(level)}
                                                    onChange={() => toggleLevel(level)}
                                                    className="h-4 w-4 rounded border-slate-300"
                                                />
                                                Tingkat {level}
                                            </label>
                                        ))}
                                    </div>
                                )}
                                {errors.class_levels && (
                                    <p className="text-xs text-red-500">{errors.class_levels}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href="/materi">
                                <Button type="button" variant="outline">Batal</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-orange-600 text-white hover:bg-orange-700"
                            >
                                <Save className="h-4 w-4" />
                                {submitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

CourseCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Tambah Course', href: '/materi/create' },
    ],
};
