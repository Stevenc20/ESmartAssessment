import { Head } from '@inertiajs/react';
import { Activity, BookOpen, Calendar, GraduationCap, LogIn, Shield, Sparkles, Trophy, Upload, UserCheck, UserMinus, Users } from 'lucide-react';

type Stats = {
    totalUser: number; totalGuru: number; totalSiswa: number; totalAdmin: number;
    totalMateri: number; totalChallenge: number; totalCertificate: number;
    siswaAktif: number; siswaTidakAktif: number;
};

type ActivityToday = { login: number; uploadTugas: number; materiBaru: number; challengeBaru: number };
type KelasAttendance = { kelas: string; kehadiran: number };
type MonthlyGrowth = { bulan: string; total: number };

type Props = {
    stats: Stats;
    recentLogs: Array<{ id: number; user_name: string; activity: string; created_at: string }>;
    activityToday: ActivityToday;
    kelasAttendance: KelasAttendance[];
    monthlyGrowth: MonthlyGrowth[];
};

type KpiCard = {
    title: string;
    value: number;
    icon: typeof Users;
    color: string;
    delta: string;
    deltaUp: boolean;
    subtitle?: string;
};

function KpiCard({ k, size }: { k: KpiCard; size: 'lg' | 'sm' }) {
    const isLg = size === 'lg';
    return (
        <div className="group relative overflow-hidden rounded-xl border border-[#e9edf3] bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md min-h-[130px]">
            <div className="flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k.title}</span>
                <div
                    className={`flex items-center justify-center rounded-lg transition-transform group-hover:scale-110 ${isLg ? 'h-10 w-10' : 'h-9 w-9'}`}
                    style={{ backgroundColor: k.color + '18', color: k.color }}
                >
                    <k.icon className={isLg ? 'h-5 w-5' : 'h-4 w-4'} />
                </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <span className={`font-bold text-slate-900 ${isLg ? 'text-3xl' : 'text-2xl'}`}>{k.value.toLocaleString()}</span>
                {k.subtitle && <span className="text-xs text-slate-400">{k.subtitle}</span>}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
                <span className={`inline-flex items-center text-xs font-semibold ${k.deltaUp ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {k.deltaUp ? (
                        <svg className="mr-0.5 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
                    ) : null}
                    {k.delta}
                </span>
                {isLg && <span className="text-xs text-slate-400">bulan ini</span>}
            </div>
        </div>
    );
}

export default function SuperAdminDashboard({ stats, recentLogs, activityToday, kelasAttendance, monthlyGrowth }: Props) {
    const primaryKpis: KpiCard[] = [
        { title: 'Total User',  value: stats.totalUser,  icon: Users,        color: '#3b82f6', delta: '+18%', deltaUp: true },
        { title: 'Total Siswa', value: stats.totalSiswa, icon: GraduationCap, color: '#8b5cf6', delta: '+12%', deltaUp: true },
        { title: 'Total Guru',  value: stats.totalGuru,  icon: UserCheck,    color: '#10b981', delta: '+8%',  deltaUp: true },
        { title: 'Total Materi', value: stats.totalMateri, icon: BookOpen,    color: '#f59e0b', delta: '+3',   deltaUp: true },
    ];

    const secondaryKpis: KpiCard[] = [
        { title: 'Challenge',      value: stats.totalChallenge,  icon: Trophy,    color: '#f43f5e', delta: '0%',   deltaUp: false, subtitle: 'Total' },
        { title: 'Sertifikat',     value: stats.totalCertificate, icon: Shield,    color: '#14b8a6', delta: '0%',   deltaUp: false, subtitle: 'Diterbitkan' },
        { title: 'Siswa Aktif',    value: stats.siswaAktif,       icon: UserCheck, color: '#22c55e', delta: String(stats.siswaAktif), deltaUp: true, subtitle: 'Sedang belajar' },
        { title: 'Siswa Non-aktif', value: stats.siswaTidakAktif, icon: UserMinus, color: '#ef4444', delta: '0%',   deltaUp: false, subtitle: 'Perlu follow-up' },
    ];

    const maxGrowth = Math.max(...monthlyGrowth.map(x => x.total), 1);

    const activities = [
        { label: 'Login',         value: activityToday.login,         icon: LogIn,   color: '#3b82f6' },
        { label: 'Upload Tugas',  value: activityToday.uploadTugas,   icon: Upload,  color: '#10b981' },
        { label: 'Materi Baru',   value: activityToday.materiBaru,    icon: BookOpen, color: '#f59e0b' },
        { label: 'Challenge',     value: activityToday.challengeBaru, icon: Trophy,  color: '#8b5cf6' },
    ];

    return (
        <>
            <Head title="Control Center" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                {/* ── Hero ── */}
                <div className="relative overflow-hidden rounded-xl border border-[#e9edf3] bg-white shadow-sm">
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'radial-gradient(circle, #f7cad0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                    <div className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-sm"
                                style={{ background: 'linear-gradient(135deg, #f7cad0 0%, #f9dde1 100%)' }}>
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                                        <Shield className="h-2.5 w-2.5" />Super Admin
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                        <Sparkles className="h-2.5 w-2.5" />Control Center
                                    </span>
                                </div>
                                <h1 className="text-xl font-bold text-slate-900 md:text-2xl">Ringkasan Sistem</h1>
                                <p className="mt-0.5 text-sm text-slate-500">Pantau seluruh aktivitas platform dalam satu layar</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-lg border border-[#e9edf3] bg-slate-50 px-3 py-1.5 font-semibold text-slate-600">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Primary KPIs ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {primaryKpis.map((k) => (
                        <KpiCard key={k.title} k={k} size="lg" />
                    ))}
                </div>

                {/* ── Secondary KPIs ── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {secondaryKpis.map((k) => (
                        <KpiCard key={k.title} k={k} size="sm" />
                    ))}
                </div>

                {/* ── Charts + Aktivitas Hari Ini ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Pertumbuhan Siswa */}
                    <div className="rounded-xl border border-[#e9edf3] bg-white lg:col-span-7">
                        <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">Pertumbuhan Siswa</h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">6 Bulan</span>
                        </div>
                        <div className="p-5">
                            {monthlyGrowth.length > 0 ? (
                                <div className="space-y-3">
                                    {monthlyGrowth.map((m) => (
                                        <div key={m.bulan} className="flex items-center gap-3">
                                            <span className="w-10 shrink-0 text-xs font-semibold text-slate-600">{m.bulan}</span>
                                            <div className="h-7 flex-1 overflow-hidden rounded-md bg-slate-100">
                                                <div className="h-full rounded-md transition-all duration-500"
                                                    style={{
                                                        width: `${Math.min((m.total / maxGrowth) * 100, 100)}%`,
                                                        background: 'linear-gradient(90deg, #436391, #5a7aaa)',
                                                    }} />
                                            </div>
                                            <span className="w-8 shrink-0 text-right text-xs font-bold text-slate-700">{m.total}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex h-32 flex-col items-center justify-center text-center">
                                    <Activity className="mb-2 h-6 w-6 text-slate-300" />
                                    <p className="text-xs text-slate-400">Belum ada data pertumbuhan</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aktivitas Hari Ini — Compact List */}
                    <div className="rounded-xl border border-[#e9edf3] bg-white lg:col-span-5">
                        <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">Aktivitas Hari Ini</h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Live</span>
                        </div>
                        <div className="divide-y divide-[#e9edf3]">
                            {activities.map((a) => (
                                <div key={a.label} className="flex items-center justify-between px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: a.color + '18', color: a.color }}>
                                            <a.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm text-slate-600">{a.label}</span>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">{a.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Kehadiran Global + Aktivitas Terbaru ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Kehadiran Global */}
                    <div className="rounded-xl border border-[#e9edf3] bg-white lg:col-span-6">
                        <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">Kehadiran Global</h2>
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Per Kelas</span>
                        </div>
                        <div className="p-5">
                            {kelasAttendance.length > 0 ? (
                                <div className="space-y-3">
                                    {kelasAttendance.map((k) => (
                                        <div key={k.kelas} className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-700">{k.kelas}</span>
                                                <span className="font-bold"
                                                    style={{ color: k.kehadiran >= 85 ? '#059669' : k.kehadiran >= 70 ? '#d97706' : '#dc2626' }}>
                                                    {k.kehadiran}%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${k.kehadiran}%`,
                                                        background: k.kehadiran >= 85
                                                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                                                            : k.kehadiran >= 70
                                                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                                : 'linear-gradient(90deg, #ef4444, #f87171)',
                                                    }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-8 text-center">
                                    <Calendar className="h-10 w-10 text-slate-300" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-500">Belum ada data kehadiran</p>
                                        <p className="mt-1 text-xs text-slate-400">Absensi pertama akan muncul di sini</p>
                                    </div>
                                    <button disabled
                                        className="mt-1 rounded-lg border border-[#e9edf3] bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400 transition-colors">
                                        + Buat Absensi
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Aktivitas Terbaru */}
                    <div className="rounded-xl border border-[#e9edf3] bg-white lg:col-span-6">
                        <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                    <Activity className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">Aktivitas Terbaru</h2>
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    {recentLogs.length}
                                </span>
                            </div>
                        </div>
                        <div className="p-0">
                            {recentLogs.length > 0 ? (
                                <ul className="divide-y divide-[#e9edf3]">
                                    {recentLogs.map((log) => (
                                        <li key={log.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                                style={{ background: '#436391' }}>
                                                {log.user_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm text-slate-900">
                                                    <span className="font-semibold">{log.user_name}</span>
                                                    <span className="text-slate-500"> · {log.activity}</span>
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs text-slate-400">{log.created_at}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-10 text-center">
                                    <Activity className="h-8 w-8 text-slate-300" />
                                    <p className="text-sm text-slate-400">Belum ada aktivitas tercatat</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SuperAdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/admin/dashboard' }],
};
