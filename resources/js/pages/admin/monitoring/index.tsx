import { Head } from '@inertiajs/react';
import { Activity, AlertTriangle, LogIn, Monitor } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LoginSession = {
    id: number;
    user_name: string;
    ip_address: string | null;
    login_at: string;
    device_type: string | null;
};
type ActivityItem = {
    id: number;
    user_name: string;
    activity: string;
    created_at: string;
    ip_address: string | null;
};
type ErrorItem = {
    id: number;
    level: string;
    message: string;
    file: string | null;
    line: number | null;
    occurred_at: string;
    user_name: string;
};

type Props = {
    recentLogins: LoginSession[];
    recentActivities: ActivityItem[];
    recentErrors: ErrorItem[];
};

const tabs = [
    { id: 'login', label: 'Login Activity', icon: LogIn, countKey: null },
    { id: 'system', label: 'System Activity', icon: Activity, countKey: null },
    {
        id: 'errors',
        label: 'Error Monitoring',
        icon: AlertTriangle,
        countKey: 'recentErrors' as const,
    },
] as const;

type TabId = (typeof tabs)[number]['id'];

const levelColors: Record<string, { bg: string; text: string; ring: string }> =
    {
        error: { bg: 'bg-red-50', text: 'text-red-700', ring: 'bg-red-500' },
        warning: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            ring: 'bg-amber-500',
        },
        critical: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            ring: 'bg-red-600',
        },
    };

export default function MonitoringIndex({
    recentLogins,
    recentActivities,
    recentErrors,
}: Props) {
    const [activeTab, setActiveTab] = useState<TabId>('login');

    const errorCount = recentErrors.length;
    const loginCount = recentLogins.length;
    const activityCount = recentActivities.length;

    return (
        <>
            <Head title="Monitoring Center" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, #dc2626 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="relative flex items-center gap-4">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                            style={{
                                background:
                                    'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                            }}
                        >
                            <Monitor className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900">
                                Monitoring Center
                            </h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Pantau login, aktivitas sistem, dan error secara
                                real-time.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex w-fit gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                    {tabs.map((tab) => {
                        const count =
                            tab.id === 'login'
                                ? loginCount
                                : tab.id === 'system'
                                  ? activityCount
                                  : errorCount;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                                {count > 0 && (
                                    <span
                                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                                            activeTab === tab.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <Card className="border-slate-200 bg-white">
                    {activeTab === 'login' && (
                        <>
                            <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                        <LogIn className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-sm font-bold text-slate-900">
                                        Login Terbaru
                                    </CardTitle>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {recentLogins.length} entri
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                <th className="px-5 py-3">
                                                    User
                                                </th>
                                                <th className="px-5 py-3">
                                                    IP Address
                                                </th>
                                                <th className="px-5 py-3">
                                                    Device
                                                </th>
                                                <th className="px-5 py-3">
                                                    Waktu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentLogins.map((s) => (
                                                <tr
                                                    key={s.id}
                                                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-3 font-semibold text-slate-900">
                                                        {s.user_name}
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                                                        {s.ip_address ?? '-'}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-600">
                                                        {s.device_type ?? '-'}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-500">
                                                        {s.login_at}
                                                    </td>
                                                </tr>
                                            ))}
                                            {recentLogins.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-5 py-12 text-center text-slate-400"
                                                    >
                                                        Belum ada data login
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {activeTab === 'system' && (
                        <>
                            <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-sm font-bold text-slate-900">
                                        Aktivitas Sistem
                                    </CardTitle>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {recentActivities.length} entri
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                <th className="px-5 py-3">
                                                    User
                                                </th>
                                                <th className="px-5 py-3">
                                                    Aktivitas
                                                </th>
                                                <th className="px-5 py-3">
                                                    IP
                                                </th>
                                                <th className="px-5 py-3">
                                                    Waktu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentActivities.map((a) => (
                                                <tr
                                                    key={a.id}
                                                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                                                >
                                                    <td className="px-5 py-3 font-semibold text-slate-900">
                                                        {a.user_name}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-600">
                                                        {a.activity}
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                                        {a.ip_address ?? '-'}
                                                    </td>
                                                    <td className="px-5 py-3 text-slate-500">
                                                        {a.created_at}
                                                    </td>
                                                </tr>
                                            ))}
                                            {recentActivities.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-5 py-12 text-center text-slate-400"
                                                    >
                                                        Belum ada aktivitas
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {activeTab === 'errors' && (
                        <>
                            <CardHeader className="flex-row items-center justify-between border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-700">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <CardTitle className="text-sm font-bold text-slate-900">
                                        Error Log
                                    </CardTitle>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {recentErrors.length} error
                                </span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                <th className="px-5 py-3">
                                                    Level
                                                </th>
                                                <th className="px-5 py-3">
                                                    Pesan
                                                </th>
                                                <th className="px-5 py-3">
                                                    File
                                                </th>
                                                <th className="px-5 py-3">
                                                    User
                                                </th>
                                                <th className="px-5 py-3">
                                                    Waktu
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentErrors.map((e) => {
                                                const lc = levelColors[
                                                    e.level
                                                ] ?? {
                                                    bg: 'bg-slate-100',
                                                    text: 'text-slate-700',
                                                    ring: 'bg-slate-500',
                                                };

                                                return (
                                                    <tr
                                                        key={e.id}
                                                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                                                    >
                                                        <td className="px-5 py-3">
                                                            <Badge
                                                                className={`${lc.bg} ${lc.text} border-0 font-semibold capitalize`}
                                                            >
                                                                {e.level}
                                                            </Badge>
                                                        </td>
                                                        <td className="max-w-xs truncate px-5 py-3 font-medium text-slate-900">
                                                            {e.message}
                                                        </td>
                                                        <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                                            {e.file
                                                                ? `${e.file}${e.line ? `:${e.line}` : ''}`
                                                                : '-'}
                                                        </td>
                                                        <td className="px-5 py-3 text-slate-600">
                                                            {e.user_name}
                                                        </td>
                                                        <td className="px-5 py-3 text-slate-500">
                                                            {e.occurred_at}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {recentErrors.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-5 py-12 text-center text-slate-400"
                                                    >
                                                        <div className="flex flex-col items-center gap-2">
                                                            <AlertTriangle className="h-8 w-8 text-slate-300" />
                                                            <p>
                                                                Tidak ada error
                                                                tercatat
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </>
    );
}

MonitoringIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Monitoring', href: '/admin/monitoring' },
    ],
};
