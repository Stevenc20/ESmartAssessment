import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Clock,
    GraduationCap,
    Sparkles,
    Star,
    TrendingUp,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import type { Auth } from '@/types';

type PageProps = { auth: Auth };

const stats = [
    {
        title: 'Total Siswa',
        value: '128',
        change: '+12%',
        icon: Users,
        color: '#436391',
        bgColor: 'bg-white',
    },
    {
        title: 'Assessment Selesai',
        value: '45',
        change: '+8%',
        icon: GraduationCap,
        color: '#7c3aed',
        bgColor: 'bg-white',
    },
    {
        title: 'Challenge Aktif',
        value: '12',
        change: '+3',
        icon: Trophy,
        color: '#d97706',
        bgColor: 'bg-white',
    },
    {
        title: 'Rata-rata Nilai',
        value: '82.5',
        change: '+2.3',
        icon: TrendingUp,
        color: '#059669',
        bgColor: 'bg-white',
    },
];

const recentActivities = [
    {
        id: 1,
        user: 'Ahmad Rizki',
        action: 'Menyelesaikan Assessment',
        detail: 'Pemrograman Web - Bagian 3',
        time: '5 menit lalu',
        icon: GraduationCap,
    },
    {
        id: 2,
        user: 'Siti Nurhaliza',
        action: 'Mengirim Portfolio',
        detail: 'Project Akhir - E-Commerce App',
        time: '15 menit lalu',
        icon: BookOpen,
    },
    {
        id: 3,
        user: 'Budi Santoso',
        action: 'Menyelesaikan Challenge',
        detail: 'Algorithm Challenge #12',
        time: '30 menit lalu',
        icon: Trophy,
    },
    {
        id: 4,
        user: 'Dewi Lestari',
        action: 'Mendapatkan Badge',
        detail: 'Fast Learner Badge',
        time: '1 jam lalu',
        icon: Star,
    },
    {
        id: 5,
        user: 'Fajar Nugroho',
        action: 'Memulai Learning Path',
        detail: 'Data Science Fundamentals',
        time: '2 jam lalu',
        icon: BookOpen,
    },
];

const quickActions = [
    {
        title: 'Buat Assessment',
        description: 'Buat assessment baru',
        href: '/assessment/create',
        icon: GraduationCap,
    },
];

export default function RegularDashboard() {
    const { auth } = usePage<PageProps>().props;
    const userName = auth.user?.name ?? 'User';
    const initials = userName
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

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
                        className={`${stat.bgColor} group relative overflow-hidden rounded-xl border border-slate-200 p-5 transition-all hover:border-slate-300 hover:shadow-md`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                {stat.title}
                            </span>
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110`}
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
                            </span>{' '}
                            dari bulan lalu
                        </p>
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
                        <Link
                            href="/analytics"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                            Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <div className="p-0">
                        <ul className="divide-y divide-slate-100">
                            {recentActivities.map((activity) => (
                                <li
                                    key={activity.id}
                                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <activity.icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {activity.user}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {activity.action} ·{' '}
                                            {activity.detail}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs whitespace-nowrap text-slate-400">
                                        {activity.time}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
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
