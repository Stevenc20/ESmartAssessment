import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type CourseData = { id: number; judul: string };

export default function PertemuanCreate({
    course,
    nextUrutan,
}: {
    course: CourseData;
    nextUrutan: number;
}) {
    const { errors } = usePage().props;
    const [judul, setJudul] = useState('');
    const [deskripsi, setDeskripsi] = useState('');
    const [urutan, setUrutan] = useState(nextUrutan);
    const [gambar, setGambar] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const form = new FormData();
        form.append('judul', judul);
        form.append('deskripsi', deskripsi);
        form.append('urutan', String(urutan));
        if (gambar) form.append('gambar', gambar);

        router.post(`/materi/${course.id}/pertemuan`, form, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <>
            <Head title="Tambah Pertemuan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
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
                                Tambah Pertemuan
                            </h1>
                            <p className="text-sm text-slate-500">
                                Course: {course.judul}
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
                                <Label htmlFor="judul">Judul Pertemuan</Label>
                                <Input
                                    id="judul"
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    placeholder="Contoh: Bilangan Real"
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
                                    placeholder="Deskripsi singkat pertemuan ini"
                                    rows={2}
                                />
                                {errors.deskripsi && (
                                    <p className="text-xs text-red-500">{errors.deskripsi}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="urutan">Urutan</Label>
                                <Input
                                    id="urutan"
                                    type="number"
                                    min={1}
                                    value={urutan}
                                    onChange={(e) => setUrutan(Number(e.target.value))}
                                    className="w-24"
                                />
                                {errors.urutan && (
                                    <p className="text-xs text-red-500">{errors.urutan}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Gambar</Label>
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => setGambar(e.target.files?.[0] ?? null)}
                                />
                                {errors.gambar && (
                                    <p className="text-xs text-red-500">{errors.gambar}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href={`/materi/${course.id}/pertemuan`}>
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

PertemuanCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Pembelajaran', href: '/materi' },
        { title: 'Tambah Pertemuan', href: '#' },
    ],
};
