import { Head } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    Calendar,
    GraduationCap,
    Shield,
    Sparkles,
    Trophy,
    UserCheck,
    Users,
    Zap,
} from 'lucide-react';
import type { Auth } from '@/types';

type Stats = {
    totalSiswa: number;
    totalGuru: number;
    totalAdmin: number;
    totalSiswaWithKelas: number;
    totalKelas: number;
    totalAssessment: number;
    totalChallenge: number;
    totalUsers: number;
};

type RecentUser = {
    id: number;
    name: string;
    email: string;
    role_name: string;
    created_at: string;
};
type RecentLog = {
    id: number;
    user_name: string;
    activity: string;
    created_at: string;
};

type KelasAttendance = { kelas: string; kehadiran: number };

type Props = {
    auth: { user: Auth['user'] };
    stats: Stats;
    recentUsers: RecentUser[];
    recentLogs: RecentLog[];
    kelasAttendance?: KelasAttendance[];
};

const statCards = [
    {
        title: 'Total User',
        key: 'totalUsers' as const,
        icon: Users,
        color: '#3b82f6',
    },
    {
        title: 'Siswa',
        key: 'totalSiswa' as const,
        icon: GraduationCap,
        color: '#8b5cf6',
    },
    {
        title: 'Guru',
        key: 'totalGuru' as const,
        icon: UserCheck,
        color: '#10b981',
    },
    {
        title: 'Kelas',
        key: 'totalKelas' as const,
        icon: BookOpen,
        color: '#f59e0b',
    },
    {
        title: 'Assessment',
        key: 'totalAssessment' as const,
        icon: Zap,
        color: '#14b8a6',
    },
    {
        title: 'Challenge',
        key: 'totalChallenge' as const,
        icon: Trophy,
        color: '#f43f5e',
    },
];

const roleBadge: Record<string, { label: string; color: string; bg: string }> =
    {
        super_admin: {
            label: 'Super Admin',
            color: 'text-rose-600',
            bg: 'bg-rose-50',
        },
        admin: { label: 'Admin', color: 'text-purple-700', bg: 'bg-purple-50' },
        guru: { label: 'Guru', color: 'text-emerald-700', bg: 'bg-emerald-50' },
        siswa: { label: 'Siswa', color: 'text-sky-700', bg: 'bg-sky-50' },
    };

const quickActions = [
    {
        title: 'Kelola Users',
        href: '/admin/users',
        icon: Users,
        color: '#3b82f6',
    },
    {
        title: 'Kelola Kelas',
        href: '/admin/kelas',
        icon: BookOpen,
        color: '#f59e0b',
    },
    {
        title: 'Pengaturan Sistem',
        href: '/admin/settings',
        icon: Shield,
        color: '#436391',
    },
    {
        title: 'Log Aktivitas',
        href: '/admin/logs',
        icon: Activity,
        color: '#8b5cf6',
    },
];

function StatCard({
    title,
    value,
    icon: Icon,
    color,
}: {
    title: string;
    value: number;
    icon: any;
    color: string;
}) {
    return (
        <div className="group relative min-h-[120px] overflow-hidden rounded-xl border border-[#e9edf3] bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {title}
                </span>
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: color + '18', color }}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
                {(value ?? 0).toLocaleString()}
            </div>
        </div>
    );
}

export default function SuperadminDashboard({
    auth,
    stats,
    recentUsers,
    recentLogs,
    kelasAttendance = [],
}: Props) {
    if (!stats) {
return null;
}

    const userName = auth.user?.name ?? 'Super Admin';
    const initials = userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    const role =
        roleBadge[auth.user?.role?.role_name ?? ''] ?? roleBadge['super_admin'];
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <>
            <Head title="Dashboard" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                {/* ── Hero ── */}
                <div className="relative overflow-hidden rounded-xl border border-[#e9edf3] bg-white p-6 shadow-sm md:p-8">
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, #f7cad0 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white shadow-sm"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #f7cad0 0%, #f9dde1 100%)',
                                }}
                            >
                                {initials}
                            </div>
                            <div>
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${role.bg} ${role.color}`}
                                    >
                                        <Shield className="h-2.5 w-2.5" />
                                        {role.label}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-600 uppercase">
                                        <Sparkles className="h-2.5 w-2.5" />
                                        Control Center
                                    </span>
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                                    Selamat Datang, {userName}!
                                </h1>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    {today}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {statCards.map((stat) => (
                        <StatCard
                            key={stat.title}
                            {...stat}
                            value={stats[stat.key]}
                        />
                    ))}
                </div>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-[#e9edf3] bg-white lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Users className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Pendaftaran Terbaru
                                </h2>
                            </div>
                        </div>
                        <div className="p-0">
                            <ul className="divide-y divide-[#e9edf3]">
                                {recentUsers.map((u) => {
                                    const rb = roleBadge[u.role_name] ?? {
                                        label: u.role_name,
                                        color: 'text-slate-600',
                                        bg: 'bg-slate-100',
                                    };

                                    return (
                                        <li
                                            key={u.id}
                                            className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                                        >
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                                                style={{
                                                    background: '#436391',
                                                }}
                                            >
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                    {u.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {u.email}
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${rb.bg} ${rb.color}`}
                                            >
                                                {rb.label}
                                            </span>
                                            <span className="hidden shrink-0 text-xs whitespace-nowrap text-slate-400 sm:inline">
                                                {u.created_at}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-[#e9edf3] bg-white">
                            <div className="border-b border-[#e9edf3] px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
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
                                        <a
                                            key={action.title}
                                            href={action.href}
                                            className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-slate-50"
                                        >
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        action.color + '18',
                                                    color: action.color,
                                                }}
                                            >
                                                <action.icon className="h-4 w-4" />
                                            </div>
                                            <span className="flex-1 text-sm font-semibold text-slate-900">
                                                {action.title}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#e9edf3] bg-white">
                            <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Kehadiran Global
                                    </h2>
                                </div>
                                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                    Per Kelas
                                </span>
                            </div>
                            <div className="p-5">
                                {kelasAttendance.length > 0 ? (
                                    <div className="space-y-3">
                                        {kelasAttendance.map((k) => (
                                            <div
                                                key={k.kelas}
                                                className="space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-slate-700">
                                                        {k.kelas}
                                                    </span>
                                                    <span
                                                        className="font-bold"
                                                        style={{
                                                            color:
                                                                k.kehadiran >= 85
                                                                    ? '#059669'
                                                                    : k.kehadiran >=
                                                                        70
                                                                      ? '#d97706'
                                                                      : '#dc2626',
                                                        }}
                                                    >
                                                        {k.kehadiran}%
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${k.kehadiran}%`,
                                                            background:
                                                                k.kehadiran >= 85
                                                                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                                    : k.kehadiran >=
                                                                        70
                                                                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                                      : 'linear-gradient(90deg, #ef4444, #f87171)',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                                        <Calendar className="h-10 w-10 text-slate-300" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500">
                                                Belum ada data kehadiran
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Absensi pertama akan muncul di sini
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Activity Log ── */}
                <div className="rounded-xl border border-[#e9edf3] bg-white">
                    <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Activity className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-slate-900">
                                Aktivitas Terbaru
                            </h2>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {recentLogs.length}
                            </span>
                        </div>
                    </div>
                    <div className="p-0">
                        {recentLogs.length > 0 ? (
                            <ul className="divide-y divide-[#e9edf3]">
                                {recentLogs.map((log) => (
                                    <li
                                        key={log.id}
                                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                                    >
                                        <div
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                            style={{ background: '#436391' }}
                                        >
                                            {log.user_name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm">
                                                <span className="font-semibold text-slate-900">
                                                    {log.user_name}
                                                </span>
                                                <span className="text-slate-500">
                                                    {' '}
                                                    · {log.activity}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-slate-400">
                                            {log.created_at}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <Activity className="h-8 w-8 text-slate-300" />
                                <p className="text-sm text-slate-400">
                                    Belum ada aktivitas
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
