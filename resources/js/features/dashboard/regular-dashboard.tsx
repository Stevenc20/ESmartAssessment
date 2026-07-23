import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CheckCircle,
    Clock,
    FileText,
    GraduationCap,
    Sparkles,
    TrendingUp,
    Users,
    ClipboardList,
    AlertCircle,
} from 'lucide-react';
import type { Auth } from '@/types';

type GuruActivity = {
    id: string;
    type: 'submission' | 'absensi';
    user: string;
    description: string;
    time: string;
};

type GuruDashboard = {
    totalSiswa: number;
    tugasAktif: number;
    menungguPenilaian: number;
    rataNilai: number;
    recentActivity: GuruActivity[];
} | null;

type PageProps = {
    auth: Auth;
    guruDashboard: GuruDashboard;
};

const quickActions = [
    {
        title: 'Buat Assessment',
        description: 'Buat assessment baru',
        href: '/assessment/create',
        icon: GraduationCap,
    },
    {
        title: 'Lihat Semua Tugas',
        description: 'Kelola tugas yang sudah dibuat',
        href: '/assessment',
        icon: ClipboardList,
    },
];

export default function RegularDashboard() {
    const { auth, guruDashboard } = usePage<PageProps>().props;
    const userName = auth.user?.name ?? 'User';
    const initials = userName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const stats = [
        {
            title: 'Total Siswa',
            value: guruDashboard?.totalSiswa ?? 0,
            icon: Users,
            color: '#436391',
        },
        {
            title: 'Tugas Aktif',
            value: guruDashboard?.tugasAktif ?? 0,
            icon: FileText,
            color: '#7c3aed',
        },
        {
            title: 'Menunggu Penilaian',
            value: guruDashboard?.menungguPenilaian ?? 0,
            icon: AlertCircle,
            color: '#d97706',
        },
        {
            title: 'Rata-rata Nilai',
            value: (guruDashboard?.rataNilai ?? 0).toFixed(1),
            icon: TrendingUp,
            color: '#059669',
        },
    ];

    const activities = guruDashboard?.recentActivity ?? [];

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, #436391 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white shadow-sm"
                            style={{
                                background:
                                    'linear-gradient(135deg, #436391 0%, #5a7aaa 100%)',
                            }}
                        >
                            {initials}
                        </div>
                        <div>
                            <div className="mb-1 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                                <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
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
                        <Link href="/assessment/create">
                            <button
                                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #436391 0%, #2d4f7a 100%)',
                                }}
                            >
                                <GraduationCap className="h-4 w-4" />
                                Buat Assessment
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
                    </div>
                ))}
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Recent Activity */}
                <div className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <Clock className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Aktivitas Terbaru
                            </h2>
                        </div>
                    </div>
                    <div className="p-0">
                        {activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <p className="mt-3 text-sm font-medium text-slate-500">
                                    Belum ada aktivitas
                                </p>
                                <p className="text-xs text-slate-400">
                                    Aktivitas siswa akan muncul di sini
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {activities.map((activity) => (
                                    <li
                                        key={activity.id}
                                        className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                            {activity.type === 'submission' ? (
                                                <CheckCircle className="h-4 w-4" />
                                            ) : (
                                                <BookOpen className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                {activity.user}
                                            </p>
                                            <p className="truncate text-xs text-slate-500">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs whitespace-nowrap text-slate-400">
                                            {activity.time}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                <Sparkles className="h-4 w-4" />
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
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
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
                                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
