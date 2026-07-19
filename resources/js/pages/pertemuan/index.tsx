import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, ChevronDown, ChevronRight, FileText, Plus, Save, Sparkles, QrCode, X, Users, Clock, Check, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PertemuanItem = {
    id: number;
    judul: string;
    urutan: number;
    tanggal: string | null;
    status: string;
};

type RoadmapItem = {
    id: number;
    judul: string;
    bulan: number;
    tahun: number;
    bulan_nama: string;
    pertemuan: PertemuanItem[];
};

type QrAttendee = {
    id: number;
    siswa_id: number;
    nama: string;
    status: string;
    scan_time: string;
};

type QrSessionData = {
    pertemuanId: number;
    pertemuanJudul: string;
    session: { id: number; token: string; expired_at: string; expires_in: number };
    qrUrl: string;
    qrDataUrl: string;
    attendees: QrAttendee[];
    total_scanned: number;
};

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
    published: { label: 'Published', bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function PertemuanIndex({ roadmaps }: { roadmaps: RoadmapItem[] }) {
    const { errors } = usePage().props;
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});
    const [qrSession, setQrSession] = useState<QrSessionData | null>(null);
    const [qrLoading, setQrLoading] = useState<number | null>(null);

    const { data, setData, post, processing } = useForm({
        judul: '',
        bulan: '',
        tahun: String(new Date().getFullYear()),
    });

    const groupedByYear = roadmaps.reduce<Record<number, RoadmapItem[]>>((acc, r) => {
        if (!acc[r.tahun]) acc[r.tahun] = [];
        acc[r.tahun].push(r);
        return acc;
    }, {});

    const years = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

    function toggleYear(year: number) {
        setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
    }

    function submitAddRoadmap(e: React.FormEvent) {
        e.preventDefault();
        post('/pertemuan/roadmap', {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddDialog(false);
                setData({ judul: '', bulan: '', tahun: String(new Date().getFullYear()) });
            },
        });
    }

    function generatePertemuan(roadmapId: number) {
        router.post(`/pertemuan/generate/${roadmapId}`, {}, { preserveScroll: true });
    }

    async function bukaAbsen(pertemuan: PertemuanItem) {
        setQrLoading(pertemuan.id);
        try {
            const res = await fetch(`/pertemuan/${pertemuan.id}/absen/buka`, { method: 'POST' });
            const data = await res.json();
            const qrDataUrl = await QRCode.toDataURL(data.qr_url, { width: 300, margin: 2 });

            setQrSession({
                pertemuanId: pertemuan.id,
                pertemuanJudul: pertemuan.judul,
                session: {
                    ...data.session,
                    expired_at: data.session.expired_at,
                    expires_in: Math.max(1, Math.floor((new Date(data.session.expired_at).getTime() - Date.now()) / 1000)),
                },
                qrUrl: data.qr_url,
                qrDataUrl,
                attendees: [],
                total_scanned: 0,
            });
        } catch (e) {
            console.error('Gagal buka absen:', e);
        }
        setQrLoading(null);
    }

    async function tutupAbsen() {
        if (!qrSession) return;
        try {
            await fetch(`/pertemuan/${qrSession.pertemuanId}/absen/tutup`, { method: 'POST' });
            setQrSession(null);
        } catch (e) {
            console.error('Gagal tutup absen:', e);
        }
    }

    const pollStatus = useCallback(async () => {
        if (!qrSession) return;
        try {
            const res = await fetch(`/pertemuan/${qrSession.pertemuanId}/absen/status`);
            const data = await res.json();
            if (!data.active) {
                setQrSession(null);
                return;
            }
            setQrSession(prev => prev ? {
                ...prev,
                session: {
                    ...prev.session,
                    expired_at: data.session.expired_at,
                    expires_in: data.session.expires_in,
                },
                attendees: data.attendees,
                total_scanned: data.total_scanned,
            } : null);
        } catch (e) {
            console.error('Polling error:', e);
        }
    }, [qrSession?.pertemuanId]);

    useEffect(() => {
        if (!qrSession) return;
        const interval = setInterval(pollStatus, 3000);
        return () => clearInterval(interval);
    }, [qrSession?.pertemuanId, pollStatus]);

    useEffect(() => {
        if (!qrSession) return;
        if (qrSession.session.expires_in <= 0) {
            setQrSession(null);
            return;
        }
        const timer = setInterval(() => {
            setQrSession(prev => {
                if (!prev) return null;
                const remaining = prev.session.expires_in - 1;
                if (remaining <= 0) return null;
                return { ...prev, session: { ...prev.session, expires_in: remaining } };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [qrSession?.pertemuanId]);

    const totalPertemuan = roadmaps.reduce((sum, r) => sum + r.pertemuan.length, 0);

    const formatTime = (raw: number) => {
        const seconds = Math.floor(raw);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Head title="Pertemuan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">

                    {/* Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Pertemuan</h1>
                                <p className="text-sm text-slate-500">Kelola sesi pertemuan per bulan</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-700">
                            <Plus className="h-4 w-4" />
                            Tambah Roadmap
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Total Roadmap', value: roadmaps.length, color: '#436391', icon: FileText },
                            { label: 'Total Pertemuan', value: totalPertemuan, color: '#0891b2', icon: Calendar },
                        ].map((s) => (
                            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: s.color + '18', color: s.color }}>
                                        <s.icon className="h-4 w-4" />
                                    </div>
                                </div>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Flash Messages */}
                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{errors.success}</div>
                    )}
                    {errors.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{errors.error}</div>
                    )}

                    {/* Roadmap List */}
                    {years.length > 0 ? years.map(year => (
                        <div key={year} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <button
                                onClick={() => toggleYear(year)}
                                className="flex w-full items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-left transition-colors hover:bg-slate-100"
                            >
                                {expandedYears[year] !== false ? (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                )}
                                <span className="text-sm font-bold text-slate-700">Tahun {year}</span>
                                <span className="text-xs text-slate-400">({groupedByYear[year].length} roadmap)</span>
                            </button>

                            {(expandedYears[year] !== false) && (
                                <div className="divide-y divide-slate-100">
                                    {groupedByYear[year].map(roadmap => (
                                        <div key={roadmap.id} className="px-4 py-4 sm:px-5">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900">{roadmap.bulan_nama} {roadmap.tahun}</h3>
                                                    {roadmap.judul && roadmap.judul !== `${roadmap.bulan_nama} ${roadmap.tahun}` && (
                                                        <p className="text-xs text-slate-500">{roadmap.judul}</p>
                                                    )}
                                                </div>
                                                {roadmap.pertemuan.length === 0 && (
                                                    <Button
                                                        onClick={() => generatePertemuan(roadmap.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-sky-700"
                                                    >
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        Generate
                                                    </Button>
                                                )}
                                            </div>

                                            {roadmap.pertemuan.length > 0 ? (
                                                <div className="grid gap-2.5">
                                                    {roadmap.pertemuan.map(p => (
                                                        <PertemuanCard
                                                            key={p.id}
                                                            pertemuan={p}
                                                            onBukaAbsen={bukaAbsen}
                                                            isQrActive={qrSession?.pertemuanId === p.id}
                                                            qrLoading={qrLoading === p.id}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-xs text-slate-400 italic py-4">
                                                    Belum ada pertemuan. Klik "Generate" untuk membuat.
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">
                            <Calendar className="h-10 w-10 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-500">Belum ada roadmap</p>
                            <p className="text-xs text-slate-400">Tambah roadmap baru untuk mulai mengelola pertemuan.</p>
                            <Button onClick={() => setShowAddDialog(true)} className="mt-2 bg-sky-600 text-white hover:bg-sky-700">
                                <Plus className="mr-1 h-4 w-4" /> Tambah Roadmap
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Attendance Modal */}
            <Dialog open={qrSession !== null} onOpenChange={(o) => { if (!o) tutupAbsen(); }}>
                <DialogContent className="sm:max-w-sm p-4 gap-3">
                    <DialogHeader className="gap-1">
                        <DialogTitle className="flex items-center gap-2 text-sm">
                            <QrCode className="h-4 w-4 text-sky-600" />
                            Absen — {qrSession?.pertemuanJudul}
                        </DialogTitle>
                        <DialogDescription className="text-[11px]">
                            Tampilkan QR ini agar siswa bisa scan untuk absensi.
                        </DialogDescription>
                    </DialogHeader>

                    {qrSession && (
                        <div className="flex flex-col items-center gap-2.5 min-w-0">
                            {/* Timer pill */}
                            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                qrSession.session.expires_in <= 60
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-slate-100 text-slate-600'
                            }`}>
                                <Clock className="h-3 w-3" />
                                {formatTime(qrSession.session.expires_in)}
                            </div>

                            {/* QR Code - fixed small size */}
                            <div className="rounded-lg border border-sky-200 bg-white p-2">
                                <img src={qrSession.qrDataUrl} alt="QR Code Absen" className="h-44 w-44" />
                            </div>

                            {/* URL - properly hidden overflow */}
                            <div className="w-full overflow-hidden rounded bg-slate-50 px-2.5 py-1">
                                <p className="truncate text-[10px] text-slate-400 font-mono">{qrSession.qrUrl}</p>
                            </div>

                            {/* Scanned count */}
                            <div className="flex w-full items-center justify-between rounded-lg bg-sky-50 px-3 py-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                                    <Users className="h-3.5 w-3.5" />
                                    Sudah absen
                                </div>
                                <span className="text-base font-bold text-sky-700">{qrSession.total_scanned}</span>
                            </div>

                            {/* Attendee list */}
                            {qrSession.attendees.length > 0 && (
                                <div className="w-full max-h-28 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                                    {qrSession.attendees.map(a => (
                                        <div key={a.id} className="flex items-center justify-between px-2.5 py-1.5">
                                            <span className="min-w-0 truncate text-[11px] font-medium text-slate-700">{a.nama}</span>
                                            <div className="ml-2 flex items-center gap-1 shrink-0">
                                                <span className="text-[10px] text-slate-400">{a.scan_time}</span>
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                                    a.status === 'hadir' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                }`}>{a.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Close button */}
                            <Button onClick={tutupAbsen} size="sm" className="w-full bg-red-500 text-white hover:bg-red-600 text-xs">
                                <X className="mr-1 h-3.5 w-3.5" />
                                Tutup Absen
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Roadmap Dialog */}
            <Dialog open={showAddDialog} onOpenChange={(o) => { if (!o) setShowAddDialog(false); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Roadmap Baru</DialogTitle>
                        <DialogDescription>
                            Buat roadmap baru untuk satu bulan. 4 pertemuan default akan otomatis dibuat.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAddRoadmap} className="flex flex-col gap-4">
                        <div>
                            <Label>Judul (opsional)</Label>
                            <Input value={data.judul} onChange={e => setData('judul', e.target.value)} placeholder="Misal: Semester 1 - Bulan 1" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Bulan</Label>
                                <Select value={data.bulan} onValueChange={v => setData('bulan', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih bulan" /></SelectTrigger>
                                    <SelectContent>
                                        {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((nama, i) => (
                                            <SelectItem key={i + 1} value={String(i + 1)}>{nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.bulan && <p className="mt-1 text-xs text-red-500">{errors.bulan}</p>}
                            </div>
                            <div>
                                <Label>Tahun</Label>
                                <Input type="number" min={2020} max={2099} value={data.tahun} onChange={e => setData('tahun', e.target.value)} />
                                {errors.tahun && <p className="mt-1 text-xs text-red-500">{errors.tahun}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={processing} className="bg-sky-600 text-white hover:bg-sky-700">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

/* ── Card-based Pertemuan Row ── */
function PertemuanCard({
    pertemuan,
    onBukaAbsen,
    isQrActive,
    qrLoading,
}: {
    pertemuan: PertemuanItem;
    onBukaAbsen: (p: PertemuanItem) => void;
    isQrActive: boolean;
    qrLoading: boolean;
}) {
    const { data, setData, put, processing } = useForm({
        judul: pertemuan.judul,
        tanggal: pertemuan.tanggal ?? '',
        status: pertemuan.status,
    });

    const [saved, setSaved] = useState(false);

    function save() {
        put(`/pertemuan/${pertemuan.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            },
        });
    }

    const sc = statusConfig[data.status] ?? statusConfig.draft;

    return (
        <div className={`rounded-lg border p-3 transition-all ${
            isQrActive
                ? 'border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200'
                : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm'
        }`}>
            {/* Top row: number badge + status + actions */}
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-100 text-[11px] font-bold text-sky-700">
                        {pertemuan.urutan}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc.bg} ${sc.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={save}
                        disabled={processing}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
                            saved
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                        title="Simpan"
                    >
                        {processing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : saved ? (
                            <Check className="h-3 w-3" />
                        ) : (
                            <Save className="h-3 w-3" />
                        )}
                        {saved ? 'Saved' : 'Simpan'}
                    </button>
                    <button
                        onClick={() => onBukaAbsen(pertemuan)}
                        disabled={qrLoading}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition-all ${
                            isQrActive
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sm'
                        }`}
                        title="Buka Absen"
                    >
                        {qrLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <QrCode className="h-3 w-3" />
                        )}
                        {isQrActive ? 'Aktif' : 'Absen'}
                    </button>
                </div>
            </div>

            {/* Fields row - responsive grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="sm:col-span-1">
                    <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Judul</label>
                    <Input
                        value={data.judul}
                        onChange={e => setData('judul', e.target.value)}
                        className="h-8 text-xs"
                        placeholder="Judul pertemuan"
                    />
                </div>
                <div>
                    <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Tanggal</label>
                    <Input
                        type="date"
                        value={data.tanggal}
                        onChange={e => setData('tanggal', e.target.value)}
                        className="h-8 text-xs"
                    />
                </div>
                <div>
                    <label className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</label>
                    <Select value={data.status} onValueChange={v => setData('status', v)}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

PertemuanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pertemuan', href: '/pertemuan' },
    ],
};
