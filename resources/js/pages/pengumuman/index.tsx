import { Head } from '@inertiajs/react';
import { AlertTriangle, Info, Megaphone, Wrench } from 'lucide-react';

type AnnouncementItem = {
    id: string;
    judul: string;
    isi: string;
    type: 'info' | 'warning' | 'maintenance';
    source: 'announcements' | 'global_announcements';
    created_at: string;
};

const typeConfig = {
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', sub: 'text-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-700', label: 'Info' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', sub: 'text-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', label: 'Warning' },
    maintenance: { icon: Wrench, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', sub: 'text-red-600', iconBg: 'bg-red-100', iconColor: 'text-red-700', label: 'Maintenance' },
};

export default function PengumumanIndex({ list }: { list: AnnouncementItem[] }) {
    return (
        <>
            <Head title="Pengumuman" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Pengumuman</h1>
                            <p className="text-sm text-slate-500">Informasi dan pengumuman terbaru</p>
                        </div>
                    </div>

                    {/* List */}
                    {list.length > 0 ? (
                        <div className="space-y-3">
                            {list.map((item) => {
                                const cfg = typeConfig[item.type] ?? typeConfig.info;
                                const Icon = cfg.icon;

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative overflow-hidden rounded-xl border ${cfg.border} ${cfg.bg}`}
                                    >
                                        <div className="absolute inset-0 opacity-[0.03]" style={{
                                            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                                            backgroundSize: '20px 20px',
                                        }} />
                                        <div className="relative flex gap-4 px-5 py-4">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg} ${cfg.iconColor}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-bold ${cfg.text}`}>{item.judul}</p>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${cfg.bg} ${cfg.sub}`}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <p className={`mt-1 text-sm leading-relaxed ${cfg.sub}`}>{item.isi}</p>
                                                <p className="mt-1.5 text-xs text-slate-400">{item.created_at}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
                            <Megaphone className="h-10 w-10 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-500">Belum ada pengumuman</p>
                            <p className="text-xs text-slate-400">Pengumuman akan muncul di sini setelah dibuat oleh admin.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PengumumanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pengumuman', href: '/pengumuman' },
    ],
};
