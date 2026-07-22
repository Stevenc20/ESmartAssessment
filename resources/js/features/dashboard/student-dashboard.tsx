import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Clock,
    GraduationCap,
    Sparkles,
    Star,
    Trophy,
    TrendingUp,
    Zap,
    Award,
} from 'lucide-react';
import type { Auth } from '@/types';

type PageProps = { auth: Auth };

type StudentData = {
    assessmentSelesai: number;
    rataNilai: number | null;
    grade: string | null;
    badgeCount: number;
    ranking: number | null;
    totalPoints: number;
    totalSiswa: number;
    progressMateri: { total: number; completed: number; persen: number };
    kehadiran: number;
    certificateCount: number;
    recentActivity: {
        id: string;
        type: string;
        description: string;
        time: string;
    }[];
};

const activityIconMap: Record<string, typeof GraduationCap> = {
    assessment: GraduationCap,
    portfolio: BookOpen,
    challenge: Trophy,
};

export default function StudentDashboard({
    studentData,
}: {
    studentData: StudentData;
}) {
    const { auth } = usePage<PageProps>().props;
    const userName = auth.user?.name ?? 'User';
    const initials = userName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const stats = [
        {
            title: 'Assessment Selesai',
            value: String(studentData.assessmentSelesai),
            change: 'Total dikerjakan',
            icon: GraduationCap,
            color: '#7c3aed',
        },
        {
            title: 'Rata-rata Nilai',
            value:
                studentData.rataNilai != null
                    ? String(studentData.rataNilai)
                    : '-',
            change: studentData.grade
                ? `Grade: ${studentData.grade}`
                : 'Belum ada nilai',
            icon: TrendingUp,
            color: '#059669',
        },
        {
            title: 'Badge',
            value: String(studentData.badgeCount),
            change: 'Badge diraih',
            icon: Star,
            color: '#d97706',
        },
        ...(studentData.ranking != null
            ? [
                  {
                      title: 'Peringkat',
                      value: `#${studentData.ranking}`,
                      change: `Dari ${studentData.totalSiswa} siswa`,
                      icon: Trophy,
                      color: '#436391',
                  },
              ]
            : []),
    ];

    const quickActions = [
        {
            title: 'Ikuti Assessment',
            description: 'Kerjakan assessment tersedia',
            href: '/assessment',
            icon: GraduationCap,
        },
    ];

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white shadow-sm"
                            style={{
                                background:
                                    'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                            }}
                        >
                            {initials}
                        </div>
                        <div>
                            <div className="mb-1 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                                <span className="text-[10px] font-bold tracking-wider text-violet-700 uppercase">
                                    Selamat Datang Kembali
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                                {userName}!
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {new Date().toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        <Link href="/assessment">
                            <button
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                                }}
                            >
                                <GraduationCap className="h-4 w-4" />
                                Mulai Assessment
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.title}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                {stat.title}
                            </span>
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                                style={{
                                    backgroundColor: stat.color + '18',
                                    color: stat.color,
                                }}
                            >
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">
                            {stat.value}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                            <span className="font-bold text-emerald-600">
                                {stat.change}
                            </span>
                        </p>
                    </div>
                ))}
            </div>

            {/* ── Progress Cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Progress Materi */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Progress Materi
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {studentData.progressMateri.completed}/
                                {studentData.progressMateri.total}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                                width: `${studentData.progressMateri.persen}%`,
                            }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                        {studentData.progressMateri.persen}% selesai
                    </p>
                </div>

                {/* Kehadiran */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Award className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Kehadiran
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {studentData.kehadiran}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-emerald-600 transition-all"
                            style={{ width: `${studentData.kehadiran}%` }}
                        />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                        Kehadiran kelas
                    </p>
                </div>

                {/* Sertifikat */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                            <Award className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                Sertifikat
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {studentData.certificateCount}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-amber-600 transition-all"
                                style={{
                                    width: `${Math.min(studentData.certificateCount * 20, 100)}%`,
                                }}
                            />
                        </div>
                        <span className="text-xs font-bold text-amber-600">
                            {studentData.certificateCount}
                        </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                        Sertifikat diperoleh
                    </p>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Recent Activity */}
                <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                                <Clock className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Aktivitas Terbaru
                            </h2>
                        </div>
                        <Link
                            href="/analytics"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700"
                        >
                            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="p-0">
                        {studentData.recentActivity.length > 0 ? (
                            <ul className="divide-y divide-slate-100">
                                {studentData.recentActivity.map((activity) => {
                                    const Icon =
                                        activityIconMap[activity.type] ?? Clock;

                                    return (
                                        <li
                                            key={activity.id}
                                            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-slate-900">
                                                    {activity.description}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs whitespace-nowrap text-slate-400">
                                                {activity.time}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                                <Clock className="h-8 w-8 text-slate-300" />
                                <p className="text-sm text-slate-500">
                                    Belum ada aktivitas
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                                <Zap className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Quick Actions
                            </h2>
                        </div>
                    </div>
                    <div className="p-3">
                        <div className="space-y-1">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                                        <action.icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {action.title}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {action.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-violet-600" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
