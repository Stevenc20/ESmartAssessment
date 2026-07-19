import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileText, GraduationCap, Users, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type AssessmentInfo = {
    id: number;
    judul: string;
    materi: string;
    deadline: string;
};

type Submission = {
    id: number;
    siswa_id: number;
    siswa_nama: string;
    file_tugas: string | null;
    revisi_ke: number;
    submitted_at: string;
    nilai: number | null;
    feedback: string | null;
    penilaian_id: number | null;
};

export default function AssessmentSubmissions({ assessment, submissions, stats }: {
    assessment: AssessmentInfo;
    submissions: Submission[];
    stats: { total: number; dinilai: number; belum_dinilai: number };
}) {
    const { errors } = usePage().props;

    return (
        <>
            <Head title={`Pengumpulan - ${assessment.judul}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">

                    {/* Header */}
                    <div className="flex items-center gap-3">
                        <Link href="/assessment" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{assessment.judul}</h1>
                            <p className="text-sm text-slate-500">{assessment.materi} · Deadline: {assessment.deadline}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Total Pengumpulan', value: stats.total, color: '#436391', icon: Users },
                            { label: 'Sudah Dinilai', value: stats.dinilai, color: '#059669', icon: CheckCircle2 },
                            { label: 'Belum Dinilai', value: stats.belum_dinilai, color: '#d97706', icon: Clock },
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

                    {/* Success Message */}
                    {errors.success && (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {errors.success}
                        </div>
                    )}

                    {/* Submissions List */}
                    <div className="rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-900">Pengumpulan Siswa</h2>
                            </div>
                        </div>
                        {submissions.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {submissions.map((sub) => (
                                    <SubmissionCard key={sub.id} submission={sub} assessmentId={assessment.id} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
                                <XCircle className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">Belum ada pengumpulan</p>
                                <p className="text-xs text-slate-400">
                                    Siswa belum mengumpulkan tugas ini.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AssessmentSubmissions.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessment', href: '/assessment' },
        { title: 'Pengumpulan', href: '' },
    ],
};

function SubmissionCard({ submission, assessmentId }: { submission: Submission; assessmentId: number }) {
    const { errors } = usePage().props;
    const [isEditing, setIsEditing] = useState(!submission.nilai && submission.nilai !== 0);
    const { data, setData, post, processing } = useForm({
        nilai: submission.nilai != null ? String(submission.nilai) : '',
        feedback: submission.feedback ?? '',
    });

    function submitGrade(e: React.FormEvent) {
        e.preventDefault();
        post(`/assessment/${assessmentId}/submissions/${submission.id}/grade`, {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    }

    return (
        <div className="px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{submission.siswa_nama}</p>
                        {submission.nilai != null && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                                Nilai: {submission.nilai}
                            </span>
                        )}
                        {submission.nilai == null && (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600">
                                Belum Dinilai
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Revisi ke-{submission.revisi_ke} · {submission.submitted_at}
                    </p>
                    {submission.feedback && (
                        <p className="mt-1 text-xs text-slate-400 italic">Feedback: {submission.feedback}</p>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {submission.file_tugas && (
                        <a href={`/storage/${submission.file_tugas}`} target="_blank" rel="noopener noreferrer"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                            Lihat File
                        </a>
                    )}
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700">
                            {submission.nilai != null ? 'Edit Nilai' : 'Beri Nilai'}
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(false)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                            Batal
                        </button>
                    )}
                </div>
            </div>

            {isEditing && (
                <form onSubmit={submitGrade} className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4">
                    <div>
                        <Label>Nilai (0-100)</Label>
                        <Input type="number" min="0" max="100" value={data.nilai} onChange={e => setData('nilai', e.target.value)} placeholder="Nilai" />
                        {errors.nilai && <p className="mt-1 text-xs text-red-500">{errors.nilai}</p>}
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" disabled={processing} className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs">
                            {processing ? 'Menyimpan...' : 'Simpan Nilai'}
                        </Button>
                    </div>
                    <div className="col-span-2">
                        <Label>Feedback</Label>
                        <Textarea value={data.feedback} onChange={e => setData('feedback', e.target.value)} placeholder="Feedback untuk siswa (opsional)" rows={2} />
                    </div>
                </form>
            )}
        </div>
    );
}
