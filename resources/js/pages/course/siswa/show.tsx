import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ArrowLeft,
    CheckCircle2,
    PlayCircle,
    ArrowRight,
} from 'lucide-react';

type CourseData = {
    id: number;
    judul: string;
    deskripsi: string | null;
    thumbnail: string | null;
};

type PertemuanItem = {
    id: number;
    judul: string;
    deskripsi: string | null;
    gambar: string | null;
    urutan: number;
    sections_count: number;
    quiz_count: number;
    completed: boolean;
    quiz_score: number | null;
    quiz_attempts: number;
};

type Stats = { total: number; completed: number };

const BRAND = {
    blue: '#436391',
    blueDeep: '#2d4a6e',
    blueLight: '#6B8ABF',
    pink: '#F2AEBC',
    pinkDeep: '#e8889a',
    surface: '#F2DCDB',
};

export default function CourseSiswaShow({
    course,
    pertemuanList,
    stats,
}: {
    course: CourseData;
    pertemuanList: PertemuanItem[];
    stats: Stats;
}) {
    const { errors } = usePage().props;
    const persen = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <>
            <Head title={course.judul} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                    <Link
                        href="/materi-saya"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Link>

                    {/* Course Header */}
                    <div className="flex items-start gap-4">
                        {course.thumbnail ? (
                            <img
                                src={course.thumbnail}
                                alt=""
                                className="h-16 w-24 shrink-0 rounded-xl object-cover"
                            />
                        ) : (
                            <div
                                className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: `${BRAND.pink}25` }}
                            >
                                <BookOpen className="h-8 w-8" style={{ color: BRAND.pinkDeep }} />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl font-bold text-slate-900">{course.judul}</h1>
                            {course.deskripsi && (
                                <p className="mt-1 text-sm text-slate-500">{course.deskripsi}</p>
                            )}
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${persen}%`,
                                                background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueLight})`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">
                                        {stats.completed}/{stats.total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* Pertemuan List */}
                    <div className="space-y-3">
                        {pertemuanList.map((p) => (
                            <Link
                                key={p.id}
                                href={`/materi-saya/${course.id}/${p.id}`}
                                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-all hover:border-slate-300 hover:shadow-md"
                            >
                                {/* Status */}
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${
                                        p.completed
                                            ? 'bg-emerald-500'
                                            : 'bg-slate-200 text-slate-500'
                                    }`}
                                >
                                    {p.completed ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        p.urutan
                                    )}
                                </div>

                                {/* Pertemuan info */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900">
                                        Pertemuan {p.urutan}: {p.judul}
                                    </p>
                                    {p.deskripsi && (
                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                                            {p.deskripsi}
                                        </p>
                                    )}
                                    <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                                        <span>{p.sections_count} section</span>
                                        {p.quiz_count > 0 && <span>{p.quiz_count} soal quiz</span>}
                                        {p.completed && p.quiz_score !== null && (
                                            <span className="font-semibold text-emerald-600">
                                                Nilai: {p.quiz_score}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className={`shrink-0 transition-colors ${
                                        p.completed ? 'text-emerald-400' : 'text-slate-300'
                                    }`}
                                >
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </Link>
                        ))}

                        {pertemuanList.length === 0 && (
                            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">
                                    Belum ada pertemuan
                                </p>
                                <p className="text-xs text-slate-400">
                                    Guru belum menambahkan pertemuan untuk course ini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

CourseSiswaShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
        { title: 'Course', href: '#' },
    ],
};
