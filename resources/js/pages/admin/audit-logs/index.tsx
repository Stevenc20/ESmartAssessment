import { Head, router, usePage } from '@inertiajs/react';
import { ClipboardList, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AuditLog = {
    id: number;
    user_name: string;
    action: string;
    description: string | null;
    subject_type: string | null;
    created_at: string;
    ip_address: string | null;
};

type PageProps = {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    actions: string[];
};

const actionStyles: Record<string, string> = {
    create: 'bg-emerald-50 text-emerald-700',
    update: 'bg-amber-50 text-amber-700',
    delete: 'bg-red-50 text-red-700',
    restore: 'bg-blue-50 text-blue-700',
    login: 'bg-teal-50 text-teal-700',
    logout: 'bg-slate-100 text-slate-600',
    backup: 'bg-purple-50 text-purple-700',
};

export default function AuditLogsIndex({ logs, actions }: PageProps) {
    const { props } = usePage();
    const search = (props as any).filters?.search ?? '';
    const actionFilter = (props as any).filters?.action ?? '';

    function handleSearch(val: string) {
        router.get(
            '/admin/audit-logs',
            { search: val, action: actionFilter },
            { preserveScroll: true, preserveState: true },
        );
    }

    function handleAction(val: string) {
        router.get(
            '/admin/audit-logs',
            { action: val, search },
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <>
            <Head title="Audit Log" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                                }}
                            >
                                <ClipboardList className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900">
                                    Audit Log
                                </h1>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Total{' '}
                                    <span className="font-semibold text-slate-700">
                                        {logs.total}
                                    </span>{' '}
                                    entri tercatat
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1 sm:max-w-sm">
                        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            defaultValue={search}
                            placeholder="Cari aktivitas..."
                            onKeyDown={(e) =>
                                e.key === 'Enter' &&
                                handleSearch(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={actionFilter}
                        onChange={(e) => handleAction(e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    >
                        <option value="">Semua Aksi</option>
                        {actions.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <Card className="gap-0 overflow-hidden border-slate-200 bg-white">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                        <th className="px-5 py-3">User</th>
                                        <th className="px-5 py-3">Aksi</th>
                                        <th className="px-5 py-3">Deskripsi</th>
                                        <th className="px-5 py-3">IP</th>
                                        <th className="px-5 py-3">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.data.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-3 font-semibold text-slate-900">
                                                {log.user_name}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase ${
                                                        actionStyles[
                                                            log.action
                                                        ] ??
                                                        'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-3 text-slate-600">
                                                {log.description ?? '-'}
                                            </td>
                                            <td className="px-5 py-3 font-mono text-xs text-slate-500">
                                                {log.ip_address ?? '-'}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap text-slate-500">
                                                {log.created_at}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-12 text-center"
                                            >
                                                <ClipboardList className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                                                <p className="text-sm text-slate-500">
                                                    Belum ada audit log
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {Array.from(
                            { length: logs.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <button
                                key={page}
                                onClick={() =>
                                    router.get(
                                        '/admin/audit-logs',
                                        { page, search, action: actionFilter },
                                        { preserveScroll: true },
                                    )
                                }
                                className={`flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors ${
                                    page === logs.current_page
                                        ? 'bg-slate-900 text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AuditLogsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Audit Log', href: '/admin/audit-logs' },
    ],
};
