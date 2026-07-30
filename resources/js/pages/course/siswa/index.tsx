import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Library, GraduationCap, ArrowRight } from 'lucide-react';

type CourseItem = {
    id: number;
    judul: string;
    deskripsi: string | null;
    thumbnail: string | null;
    guru: string;
    pertemuan_count: number;
    created_at: string;
};

type Stats = { total: number };

const BRAND = {
    blue: '#436391',
    blueDeep: '#2d4a6e',
    blueLight: '#6B8ABF',
    pink: '#F2AEBC',
    pinkDeep: '#e8889a',
    surface: '#F2DCDB',
};

export default function CourseSiswaIndex({
    courses,
    stats,
}: {
    courses: CourseItem[];
    stats: Stats;
}) {
    const { errors } = usePage().props;

    return (
        <>
            <Head title="Materi Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    {/* Hero */}
                    <div
                        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
                        style={{
                            background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueDeep} 60%, ${BRAND.blueLight} 100%)`,
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }}
                        />
                        <div
                            className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-10"
                            style={{ background: BRAND.pink }}
                        />
                        <div className="relative flex items-center gap-4">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.15)' }}
                            >
                                <Library className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white md:text-2xl">
                                    Materi Saya
                                </h1>
                                <p className="mt-0.5 text-sm text-white/60">
                                    Pilih course untuk mulai belajar
                                </p>
                            </div>
                        </div>
                    </div>

                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* Course Grid */}
                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/materi-saya/${course.id}`}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-slate-300 hover:shadow-lg"
                                >
                                    {/* Thumbnail */}
                                    {course.thumbnail ? (
                                        <div className="aspect-video w-full overflow-hidden">
                                            <img
                                                src={course.thumbnail}
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className="flex aspect-video w-full items-center justify-center"
                                            style={{ background: `${BRAND.pink}25` }}
                                        >
                                            <BookOpen
                                                className="h-10 w-10"
                                                style={{ color: BRAND.pinkDeep }}
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col gap-2 p-4">
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                                            {course.judul}
                                        </h3>
                                        {course.deskripsi && (
                                            <p className="line-clamp-2 text-xs text-slate-500">
                                                {course.deskripsi}
                                            </p>
                                        )}
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <span className="text-xs text-slate-400">
                                                {course.pertemuan_count} pertemuan
                                            </span>
                                            <span
                                                className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
                                                style={{ color: BRAND.blue }}
                                            >
                                                Mulai
                                                <ArrowRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-20 text-center">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${BRAND.pink}30 0%, ${BRAND.surface} 100%)`,
                                }}
                            >
                                <GraduationCap
                                    className="h-8 w-8"
                                    style={{ color: BRAND.blue }}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">
                                    Belum Ada Course
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    Course akan muncul di sini setelah guru menambahkannya.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

CourseSiswaIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
    ],
};
