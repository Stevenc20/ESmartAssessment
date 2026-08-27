import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    HelpCircle,
    Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PertemuanProgressItem = {
    pertemuan_id: number;
    pertemuan_judul: string;
    roadmap_judul: string;
    absensi_status: string; // 'hadir' | 'terlambat' | 'alpa'
    quiz_score: number | null;
    quiz_attempts: number;
    tugas_score: number | null;
    tugas_submitted: boolean;
    combined_score: number | null;
    has_quiz: boolean;
    has_tugas: boolean;
};

type Props = {
    stats: {
        overall_avg: number;
        total_pertemuan: number;
        completed_quizzes: number;
        submitted_tasks: number;
    };
    pertemuanProgress: PertemuanProgressItem[];
};

export default function NilaiSaya({ stats, pertemuanProgress }: Props) {
    return (
        <>
            <Head title="Nilai & Progress Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/materi-saya">
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                                    Nilai & Progress Saya
                                </h1>
                                <p className="text-xs text-slate-500">
                                    Pantau nilai quiz, tugas, dan kehadiran Anda di setiap pertemuan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Rata-Rata Nilai
                                </CardTitle>
                                <Trophy className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-emerald-600">
                                    {stats.overall_avg}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Total Pertemuan
                                </CardTitle>
                                <BookOpen className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">
                                    {stats.total_pertemuan}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Quiz Selesai
                                </CardTitle>
                                <HelpCircle className="h-4 w-4 text-purple-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">
                                    {stats.completed_quizzes}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-semibold text-slate-500">
                                    Tugas Disubmit
                                </CardTitle>
                                <FileText className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-slate-900">
                                    {stats.submitted_tasks}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pertemuan Progress Cards List */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-900">
                            Rekap Evaluasi Per Pertemuan
                        </h2>

                        {pertemuanProgress.length === 0 ? (
                            <Card className="border-slate-200 p-8 text-center text-xs text-slate-400 italic">
                                Belum ada data pertemuan
                            </Card>
                        ) : (
                            pertemuanProgress.map((p, idx) => (
                                <Card key={p.pertemuan_id} className="border-slate-200 shadow-sm overflow-hidden">
                                    <div className="p-4 md:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        {/* Left Side: Pertemuan Info & Absensi Badge */}
                                        <div className="space-y-1.5 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                                                    Pertemuan {idx + 1}
                                                </span>
                                                <span className="text-xs text-slate-400">·</span>
                                                <span className="text-xs font-medium text-slate-500">
                                                    {p.roadmap_judul}
                                                </span>
                                                <span className="text-xs text-slate-400">·</span>

                                                {/* Absensi Status Badge */}
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        p.absensi_status === 'hadir'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : p.absensi_status === 'terlambat'
                                                            ? 'bg-amber-50 text-amber-700'
                                                            : 'bg-red-50 text-red-700'
                                                    }`}
                                                >
                                                    {p.absensi_status === 'hadir' && (
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    )}
                                                    {p.absensi_status === 'terlambat' && (
                                                        <Clock className="h-3 w-3" />
                                                    )}
                                                    {p.absensi_status === 'alpa' && (
                                                        <AlertCircle className="h-3 w-3" />
                                                    )}
                                                    {p.absensi_status === 'hadir'
                                                        ? 'Hadir'
                                                        : p.absensi_status === 'terlambat'
                                                        ? 'Terlambat'
                                                        : 'Tidak Hadir (Bolong)'}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-bold text-slate-900 truncate">
                                                {p.pertemuan_judul}
                                            </h3>

                                            {/* Sub Details: Quiz & Tugas */}
                                            <div className="flex items-center gap-4 text-xs text-slate-600 pt-1 flex-wrap">
                                                <div className="flex items-center gap-1.5">
                                                    <HelpCircle className="h-3.5 w-3.5 text-purple-600" />
                                                    <span>Quiz:</span>
                                                    {!p.has_quiz ? (
                                                        <span className="text-slate-400 italic">Tidak ada</span>
                                                    ) : p.quiz_score !== null ? (
                                                        <span className="font-bold text-purple-700">
                                                            {p.quiz_score} ({p.quiz_attempts}x coba)
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Belum dikerjakan</span>
                                                    )}
                                                </div>

                                                <span className="text-slate-300">|</span>

                                                <div className="flex items-center gap-1.5">
                                                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                                                    <span>Tugas:</span>
                                                    {!p.has_tugas ? (
                                                        <span className="text-slate-400 italic">Tidak ada</span>
                                                    ) : p.tugas_score !== null ? (
                                                        <span className="font-bold text-amber-700">
                                                            {p.tugas_score} (Dinilai)
                                                        </span>
                                                    ) : p.tugas_submitted ? (
                                                        <span className="font-semibold text-blue-600">Disubmit</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">Belum disubmit</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Combined Final Score */}
                                        <div className="shrink-0 pt-2 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-6 text-left sm:text-right">
                                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                                                Nilai Akhir Pertemuan
                                            </p>
                                            <div className="mt-1 flex sm:justify-end items-center gap-2">
                                                {p.combined_score !== null ? (
                                                    <span
                                                        className={`inline-block rounded-xl px-4 py-1.5 text-xl font-black ${
                                                            p.combined_score >= 70
                                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                                : 'bg-amber-500 text-white shadow-xs'
                                                        }`}
                                                    >
                                                        {p.combined_score}
                                                    </span>
                                                ) : (
                                                    <span className="text-2xl font-bold text-slate-300">
                                                        -
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

NilaiSaya.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Materi Saya', href: '/materi-saya' },
        { title: 'Nilai & Progress', href: '' },
    ],
};
