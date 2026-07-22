import { Head, router } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    Bell,
    BookOpen,
    Brain,
    ClipboardCheck,
    ClipboardList,
    GraduationCap,
    Library,
    Scroll,
    Settings2,
    Shield,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Feature = {
    id: number;
    key: string;
    label: string;
    description: string;
    group: string;
    enabled: boolean;
};

type PageProps = { features: Feature[] };

/* ─── Group configuration ─────────────────────────────────────── */
const groupConfig: Record<
    string,
    {
        label: string;
        icon: React.ElementType;
        color: string;
        bgLight: string;
        borderGlow: string;
        pill: string;
    }
> = {
    Pembelajaran: {
        label: 'Pembelajaran',
        icon: GraduationCap,
        color: '#436391',
        bgLight: 'rgba(67,99,145,0.06)',
        borderGlow: 'rgba(67,99,145,0.25)',
        pill: 'bg-[#436391]/10 text-[#436391]',
    },
    Gamifikasi: {
        label: 'Gamifikasi',
        icon: Trophy,
        color: '#d97706',
        bgLight: 'rgba(217,119,6,0.06)',
        borderGlow: 'rgba(217,119,6,0.25)',
        pill: 'bg-amber-100 text-amber-700',
    },
    Administrasi: {
        label: 'Administrasi',
        icon: ClipboardCheck,
        color: '#0d9488',
        bgLight: 'rgba(13,148,136,0.06)',
        borderGlow: 'rgba(13,148,136,0.25)',
        pill: 'bg-teal-100 text-teal-700',
    },
};

/* ─── Icon & accent maps ───────────────────────────────────────── */
const featureIconMap: Record<string, React.ElementType> = {
    portfolio: BookOpen,
    ai_assistant: Brain,
    modul_belajar: Library,
    tugas: ClipboardList,
    challenge: Trophy,
    ranking: TrendingUp,
    poin_reward: Award,
    badge: Shield,
    sertifikat: Scroll,
    presensi: ClipboardCheck,
    laporan_akademik: BarChart3,
    notifikasi: Bell,
};

type AccentConfig = { icon: string; bg: string; ring: string; bar: string };

const accentMap: Record<string, AccentConfig> = {
    portfolio: {
        icon: '#3b82f6',
        bg: 'rgba(59,130,246,0.08)',
        ring: 'rgba(59,130,246,0.2)',
        bar: '#3b82f6',
    },
    ai_assistant: {
        icon: '#06b6d4',
        bg: 'rgba(6,182,212,0.08)',
        ring: 'rgba(6,182,212,0.2)',
        bar: '#06b6d4',
    },
    modul_belajar: {
        icon: '#6366f1',
        bg: 'rgba(99,102,241,0.08)',
        ring: 'rgba(99,102,241,0.2)',
        bar: '#6366f1',
    },
    tugas: {
        icon: '#0ea5e9',
        bg: 'rgba(14,165,233,0.08)',
        ring: 'rgba(14,165,233,0.2)',
        bar: '#0ea5e9',
    },
    challenge: {
        icon: '#8b5cf6',
        bg: 'rgba(139,92,246,0.08)',
        ring: 'rgba(139,92,246,0.2)',
        bar: '#8b5cf6',
    },
    ranking: {
        icon: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        ring: 'rgba(245,158,11,0.2)',
        bar: '#f59e0b',
    },
    poin_reward: {
        icon: '#f97316',
        bg: 'rgba(249,115,22,0.08)',
        ring: 'rgba(249,115,22,0.2)',
        bar: '#f97316',
    },
    badge: {
        icon: '#e11d48',
        bg: 'rgba(225,29,72,0.08)',
        ring: 'rgba(225,29,72,0.2)',
        bar: '#e11d48',
    },
    sertifikat: {
        icon: '#0d9488',
        bg: 'rgba(13,148,136,0.08)',
        ring: 'rgba(13,148,136,0.2)',
        bar: '#0d9488',
    },
    presensi: {
        icon: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        ring: 'rgba(16,185,129,0.2)',
        bar: '#10b981',
    },
    laporan_akademik: {
        icon: '#0ea5e9',
        bg: 'rgba(14,165,233,0.08)',
        ring: 'rgba(14,165,233,0.2)',
        bar: '#0ea5e9',
    },
    notifikasi: {
        icon: '#7c3aed',
        bg: 'rgba(124,58,237,0.08)',
        ring: 'rgba(124,58,237,0.2)',
        bar: '#7c3aed',
    },
};

const fallbackAccent: AccentConfig = {
    icon: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    ring: 'rgba(148,163,184,0.2)',
    bar: '#94a3b8',
};

/* ─── Toggle switch ────────────────────────────────────────────── */
function ToggleSwitch({
    enabled,
    loading,
    onToggle,
}: {
    enabled: boolean;
    loading: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            disabled={loading}
            aria-label={enabled ? 'Nonaktifkan fitur' : 'Aktifkan fitur'}
            style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: enabled
                    ? 'linear-gradient(90deg,#436391,#6b8abf)'
                    : '#cbd5e1',
                position: 'relative',
                transition: 'background 0.3s ease',
                outline: 'none',
                opacity: loading ? 0.5 : 1,
                flexShrink: 0,
                boxShadow: enabled ? '0 0 0 3px rgba(67,99,145,0.15)' : 'none',
            }}
        >
            <span
                style={{
                    position: 'absolute',
                    top: 3,
                    left: enabled ? 23 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    transition: 'left 0.25s cubic-bezier(.4,0,.2,1)',
                    display: 'block',
                }}
            />
        </button>
    );
}

/* ─── Feature Card ─────────────────────────────────────────────── */
function FeatureCard({
    feature,
    toggling,
    onToggle,
}: {
    feature: Feature;
    toggling: boolean;
    onToggle: () => void;
}) {
    const key = feature.key.replace('feature_', '');
    const Icon = featureIconMap[key] ?? Zap;
    const accent = feature.enabled
        ? (accentMap[key] ?? fallbackAccent)
        : fallbackAccent;

    return (
        <div
            style={{
                background: '#fff',
                border: '1px solid #e9edf3',
                borderRadius: 16,
                overflow: 'hidden',
                transition:
                    'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                opacity: toggling ? 0.5 : feature.enabled ? 1 : 0.72,
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow =
                    '0 8px 24px rgba(67,99,145,0.1), 0 2px 8px rgba(242,174,188,0.1)';
                el.style.borderColor = feature.enabled
                    ? accent.ring
                    : '#e9edf3';
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = '';
                el.style.boxShadow = '';
                el.style.borderColor = '#e9edf3';
            }}
        >
            {/* Top colour bar */}
            <div
                style={{
                    height: 3,
                    background: feature.enabled
                        ? `linear-gradient(90deg, ${accent.bar}, ${accent.bar}cc)`
                        : '#e9edf3',
                    transition: 'background 0.3s ease',
                }}
            />

            <div
                style={{
                    padding: '18px 18px 16px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                }}
            >
                {/* Icon + Toggle row */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: accent.bg,
                            border: `1px solid ${accent.ring}`,
                            transition: 'background 0.3s, border 0.3s',
                        }}
                    >
                        <Icon
                            style={{
                                width: 18,
                                height: 18,
                                color: accent.icon,
                                transition: 'color 0.3s',
                            }}
                        />
                    </div>
                    <ToggleSwitch
                        enabled={feature.enabled}
                        loading={toggling}
                        onToggle={onToggle}
                    />
                </div>

                {/* Label + Description */}
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 4,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 13.5,
                                fontWeight: 700,
                                color: '#1a2236',
                                lineHeight: 1.3,
                            }}
                        >
                            {feature.label}
                        </span>
                        {feature.enabled && (
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                    </div>
                    <p
                        style={{
                            fontSize: 12,
                            color: '#64748b',
                            lineHeight: 1.55,
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {feature.description}
                    </p>
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: 10,
                    }}
                >
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: feature.enabled
                                ? 'rgba(16,185,129,0.1)'
                                : 'rgba(148,163,184,0.12)',
                            color: feature.enabled ? '#059669' : '#94a3b8',
                            transition: 'all 0.3s',
                        }}
                    >
                        {feature.enabled ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <span style={{ fontSize: 10.5, color: '#94a3b8' }}>
                        {feature.enabled
                            ? 'Klik untuk nonaktifkan'
                            : 'Klik untuk aktifkan'}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function FeaturesIndex({ features }: PageProps) {
    const [toggling, setToggling] = useState<number | null>(null);

    const grouped = features.reduce<Record<string, Feature[]>>((acc, f) => {
        const g = f.group || 'Lainnya';

        if (!acc[g]) {
acc[g] = [];
}

        acc[g].push(f);

        return acc;
    }, {});

    const activeCount = features.filter((f) => f.enabled).length;
    const totalCount = features.length;
    const activePct =
        totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
    const groupOrder = [
        'Pembelajaran',
        'Gamifikasi',
        'Administrasi',
        'Lainnya',
    ];

    function toggleFeature(feature: Feature) {
        setToggling(feature.id);
        router.put(
            `/admin/features/${feature.id}`,
            { enabled: !feature.enabled },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `${feature.label} ${!feature.enabled ? 'diaktifkan' : 'dinonaktifkan'}`,
                    );
                    setToggling(null);
                },
                onError: () => {
                    toast.error('Gagal mengubah fitur');
                    setToggling(null);
                },
            },
        );
    }

    return (
        <>
            <Head title="Feature Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {/* ── Page Hero Header ────────────────────────────── */}
                <div
                    style={{
                        position: 'relative',
                        overflow: 'hidden',
                        background: '#fff',
                        border: '1px solid #e9edf3',
                        borderRadius: 16,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    }}
                >
                    {/* Dot pattern background */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0.04,
                            backgroundImage:
                                'radial-gradient(circle, #f7cad0 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                        }}
                    />
                    {/* Pink accent blob */}
                    <div
                        style={{
                            position: 'absolute',
                            right: -40,
                            top: -40,
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background:
                                'radial-gradient(circle, rgba(242,174,188,0.18) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }}
                    />

                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 16,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                        }}
                    >
                        {/* Left: title block */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16,
                            }}
                        >
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 15,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    background:
                                        'linear-gradient(135deg, #f7cad0 0%, #f9dde1 100%)',
                                    boxShadow:
                                        '0 4px 14px rgba(242,174,188,0.35)',
                                }}
                            >
                                <Settings2
                                    style={{
                                        width: 24,
                                        height: 24,
                                        color: '#436391',
                                    }}
                                />
                            </div>
                            <div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 3,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.07em',
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            background: 'rgba(67,99,145,0.08)',
                                            color: '#436391',
                                        }}
                                    >
                                        Super Admin
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.07em',
                                            padding: '2px 8px',
                                            borderRadius: 999,
                                            background: 'rgba(16,185,129,0.08)',
                                            color: '#059669',
                                        }}
                                    >
                                        System Control
                                    </span>
                                </div>
                                <h1
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: '#1a2236',
                                        margin: 0,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Feature Management
                                </h1>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: '#64748b',
                                        margin: '2px 0 0',
                                        lineHeight: 1.4,
                                    }}
                                >
                                    Aktifkan atau nonaktifkan fitur platform
                                    secara real-time
                                </p>
                            </div>
                        </div>

                        {/* Right: stat pill */}
                        <div
                            style={{
                                background: 'rgba(248,250,252,0.8)',
                                border: '1px solid #e9edf3',
                                borderRadius: 14,
                                padding: '12px 20px',
                                minWidth: 210,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.06em',
                                    }}
                                >
                                    Fitur Aktif
                                </span>
                                <span
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: '#1a2236',
                                    }}
                                >
                                    <span style={{ color: '#10b981' }}>
                                        {activeCount}
                                    </span>
                                    <span style={{ color: '#94a3b8' }}>
                                        {' '}
                                        / {totalCount}
                                    </span>
                                </span>
                            </div>
                            {/* Progress bar */}
                            <div
                                style={{
                                    height: 6,
                                    background: '#e9edf3',
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        height: '100%',
                                        width: `${activePct}%`,
                                        background:
                                            'linear-gradient(90deg, #436391, #F2AEBC)',
                                        borderRadius: 999,
                                        transition:
                                            'width 0.6s cubic-bezier(.4,0,.2,1)',
                                    }}
                                />
                            </div>
                            <p
                                style={{
                                    fontSize: 10.5,
                                    color: '#94a3b8',
                                    margin: '5px 0 0',
                                }}
                            >
                                {activePct}% fitur diaktifkan
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Grouped Sections ────────────────────────────── */}
                {groupOrder.map((group) => {
                    const items = grouped[group];

                    if (!items?.length) {
return null;
}

                    const cfg = groupConfig[group];
                    const GroupIcon = cfg?.icon ?? Zap;
                    const activeInGroup = items.filter((f) => f.enabled).length;

                    return (
                        <div key={group}>
                            {/* Section label bar */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 14,
                                }}
                            >
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 9,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: cfg
                                            ? cfg.bgLight
                                            : 'rgba(148,163,184,0.08)',
                                        border: `1px solid ${cfg ? cfg.borderGlow : 'rgba(148,163,184,0.2)'}`,
                                    }}
                                >
                                    <GroupIcon
                                        style={{
                                            width: 15,
                                            height: 15,
                                            color: cfg?.color ?? '#94a3b8',
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span
                                        style={{
                                            fontSize: 13.5,
                                            fontWeight: 700,
                                            color: '#1a2236',
                                        }}
                                    >
                                        {cfg?.label ?? group}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 11.5,
                                            color: '#94a3b8',
                                            marginLeft: 6,
                                        }}
                                    >
                                        {activeInGroup} / {items.length} aktif
                                    </span>
                                </div>
                                {/* mini divider line */}
                                <div
                                    style={{
                                        flex: 1,
                                        height: 1,
                                        background:
                                            'linear-gradient(to right, #e9edf3, transparent)',
                                    }}
                                />
                                <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg?.pill ?? 'bg-slate-100 text-slate-500'}`}
                                >
                                    {items.length} fitur
                                </span>
                            </div>

                            {/* Cards grid */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                        'repeat(auto-fill, minmax(220px, 1fr))',
                                    gap: 14,
                                }}
                            >
                                {items.map((feature) => (
                                    <FeatureCard
                                        key={feature.id}
                                        feature={feature}
                                        toggling={toggling === feature.id}
                                        onToggle={() => toggleFeature(feature)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* ── Info Footer ─────────────────────────────────── */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 14,
                        background:
                            'linear-gradient(135deg, rgba(67,99,145,0.04) 0%, rgba(242,174,188,0.06) 100%)',
                        border: '1px solid rgba(67,99,145,0.12)',
                        borderRadius: 14,
                        padding: '16px 20px',
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            background: 'rgba(67,99,145,0.1)',
                            border: '1px solid rgba(67,99,145,0.18)',
                        }}
                    >
                        <Zap
                            style={{ width: 16, height: 16, color: '#436391' }}
                        />
                    </div>
                    <div>
                        <p
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#1a2236',
                                margin: '0 0 3px',
                            }}
                        >
                            Bagaimana cara kerja Feature Management?
                        </p>
                        <p
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                margin: 0,
                                lineHeight: 1.6,
                            }}
                        >
                            Fitur yang dinonaktifkan akan menyembunyikan menu
                            dan akses terkait dari seluruh pengguna.&nbsp; Data
                            tetap aman dan tidak akan hilang — aktifkan kembali
                            kapan saja tanpa kehilangan data.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

FeaturesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Feature Management', href: '/admin/features' },
    ],
};
