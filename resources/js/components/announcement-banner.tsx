import { usePage } from '@inertiajs/react';
import { AlertTriangle, Info, X, Wrench } from 'lucide-react';
import { useState } from 'react';

type AnnouncementItem = {
    id: string;
    judul: string;
    isi: string;
    type: 'info' | 'warning' | 'maintenance';
    source: 'announcements' | 'global_announcements';
    created_at: string;
};

const typeConfig = {
    info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', sub: 'text-blue-600', iconBg: 'bg-blue-100', iconColor: 'text-blue-700' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', sub: 'text-amber-600', iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
    maintenance: { icon: Wrench, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', sub: 'text-red-600', iconBg: 'bg-red-100', iconColor: 'text-red-700' },
};

function loadDismissed(): string[] {
    try {
        const stored = localStorage.getItem('dismissed_announcements');

        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // ignore
    }

    return [];
}

export default function AnnouncementBanner() {
    const { announcements } = usePage().props as { announcements: AnnouncementItem[] };
    const [dismissed, setDismissed] = useState<string[]>(loadDismissed);

    if (!announcements || announcements.length === 0) {
        return null;
    }

    const dismissedSet = new Set(dismissed);
    const visible = announcements.filter((a) => !dismissedSet.has(a.id));

    if (visible.length === 0) {
        return null;
    }

    function dismiss(id: string) {
        const next = [...dismissed, id];
        setDismissed(next);
        localStorage.setItem('dismissed_announcements', JSON.stringify(next));
    }

    return (
        <div className="space-y-2 px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8">
            {visible.map((announcement) => {
                const cfg = typeConfig[announcement.type] ?? typeConfig.info;
                const Icon = cfg.icon;

                return (
                    <div
                        key={announcement.id}
                        className={`relative overflow-hidden rounded-xl border ${cfg.border} ${cfg.bg}`}
                    >
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }} />
                        <div className="relative flex gap-3 px-4 py-3.5">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg} ${cfg.iconColor}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm font-bold ${cfg.text}`}>{announcement.judul}</p>
                                <p className={`mt-0.5 text-xs leading-relaxed ${cfg.sub}`}>{announcement.isi}</p>
                            </div>
                            <button
                                onClick={() => dismiss(announcement.id)}
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${cfg.iconBg} ${cfg.iconColor} hover:opacity-70`}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
