import { Link, usePage, router } from '@inertiajs/react';
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
    AlertTriangle,
} from 'lucide-react';
import type { Auth } from '@/types';

type GuruActivity = {
    id: string;
    type: 'submission' | 'absensi';
    user: string;
    description: string;
    time: string;
};

type AttendanceAlertItem = {
    siswa_id: number;
    nama: string;
    persentase: number;
    roadmap_id: number;
    roadmap_judul: string;
};

type NewlyDeactivatedItem = {
    id: number;
    name: string;
    kelas: string;
    tanggal: string;
};

type GuruDashboard = {
    totalSiswa: number;
    tugasAktif: number;
    menungguPenilaian: number;
    rataNilai: number;
    recentActivity: GuruActivity[];
    attendanceRiskCount: number;
    attendanceAlerts: AttendanceAlertItem[];
    attendanceThreshold: number;
    newlyDeactivatedCount?: number;
    newlyDeactivated?: NewlyDeactivatedItem[];
} | null;

type PageProps = {
    auth: Auth;
    guruDashboard: GuruDashboard;
};

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

    const [showInactiveModal, setShowInactiveModal] = useState(false);

    const [deactivateTarget, setDeactivateTarget] = useState<{ id: number, nama: string } | null>(null);
    const [isDeactivating, setIsDeactivating] = useState(false);

    function confirmDeactivate(target: { id: number, nama: string }) {
        setDeactivateTarget(target);
    }

    function processDeactivate() {
        if (!deactivateTarget) return;
        setIsDeactivating(true);
        router.post(`/guru/siswa-pasif/${deactivateTarget.id}/deactivate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setDeactivateTarget(null);
                setIsDeactivating(false);
            },
            onError: () => {
                setIsDeactivating(false);
            }
        });
    }

    useEffect(() => {
        if (guruDashboard?.newlyDeactivatedCount && guruDashboard.newlyDeactivatedCount > 0) {
            const hasSeenModal = sessionStorage.getItem('hasSeenInactiveModal');
            if (!hasSeenModal) {
                setShowInactiveModal(true);
                sessionStorage.setItem('hasSeenInactiveModal', 'true');
                
                // Play simple notification sound
                try {
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
                    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1); // A4
                    
                    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);

                    oscillator.start();
                    oscillator.stop(audioCtx.currentTime + 0.2);
                } catch (e) {
                    console.error("Failed to play audio", e);
                }
            }
        }
    }, [guruDashboard]);

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
            <Dialog open={showInactiveModal} onOpenChange={setShowInactiveModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Peringatan Sistem: Siswa Dinonaktifkan
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Terdapat <strong>{guruDashboard?.newlyDeactivatedCount} siswa</strong> yang baru saja dinonaktifkan secara otomatis oleh sistem karena aktivitas kuis dan kehadiran yang sangat rendah.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 my-2 max-h-48 overflow-y-auto">
                        <ul className="space-y-2">
                            {guruDashboard?.newlyDeactivated?.map((siswa) => (
                                <li key={siswa.id} className="text-sm flex justify-between items-center border-b border-slate-200 last:border-0 pb-1 last:pb-0">
                                    <span className="font-semibold text-slate-700">{siswa.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{siswa.kelas ?? '-'}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInactiveModal(false)}>
                            Tutup
                        </Button>
                        <Link href="/guru/siswa-pasif">
                            <Button className="bg-red-600 hover:bg-red-700 text-white">
                                Lihat Daftar Lengkap
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deactivateTarget} onOpenChange={(open) => !open && !isDeactivating && setDeactivateTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Konfirmasi Penonaktifan Siswa
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Apakah Anda yakin ingin memasukkan <strong>{deactivateTarget?.nama}</strong> ke daftar Siswa Pasif?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeactivateTarget(null)} disabled={isDeactivating}>
                            Batal
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={processDeactivate} disabled={isDeactivating}>
                            {isDeactivating ? 'Memproses...' : 'Ya, Nonaktifkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

            {/* ── Attendance Risk Indicator ── */}
            {guruDashboard &&
                guruDashboard.attendanceAlerts.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700">
                                    <AlertTriangle className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-red-900">
                                        Peringatan Kehadiran Rendah
                                    </h2>
                                    <p className="text-xs text-red-600">
                                        {
                                            guruDashboard.attendanceRiskCount
                                        }{' '}
                                        siswa di bawah {guruDashboard.attendanceThreshold}
                                        % kehadiran
                                    </p>
                                </div>
                            </div>
                            <Link href="/laporan/absensi?mode=roadmap">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-700">
                                    Lihat Laporan
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {guruDashboard.attendanceAlerts.map((a) => (
                                <div
                                    key={a.siswa_id}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-white px-3 py-2.5 transition-colors hover:border-red-300"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-slate-900">
                                            {a.nama}
                                        </p>
                                        <p className="truncate text-[11px] text-slate-500">
                                            {a.roadmap_judul}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                            {a.persentase}%
                                        </span>
                                        <button
                                            onClick={() => confirmDeactivate({ id: a.siswa_id, nama: a.nama })}
                                            className="rounded border border-red-600 px-2 py-1 text-[10px] font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                                        >
                                            Nonaktifkan
                                        </button>
                                        <Link 
                                            href={`/laporan/absensi?mode=roadmap&roadmap_id=${a.roadmap_id}`}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
