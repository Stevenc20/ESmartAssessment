import { Head } from '@inertiajs/react';
import { Award, Lock, Medal, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type Condition = {
    type: string;
    operator: string;
    value: number | boolean;
};

type BadgeItem = {
    id: number;
    badge_name: string;
    icon: string | null;
    description: string | null;
    conditions: Condition | null;
    earned: boolean;
    condition_met: boolean;
    earned_at: string | null;
};

const conditionLabels: Record<string, string> = {
    assessment_count: 'Selesaikan assessment',
    assessment_avg_score: 'Rata-rata nilai',
    assessment_perfect: 'Nilai sempurna 100',
    points_earned: 'Kumpulkan poin',
};

export default function BadgeIndex({
    badges,
    stats,
}: {
    badges: BadgeItem[];
    stats: { assessment_count: number; assessment_avg_score: number; assessment_perfect: boolean; points_earned: number };
}) {
    const earnedCount = badges.filter((b) => b.earned).length;

    return (
        <>
            <Head title="Badge Saya" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    Badge Saya
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {earnedCount} dari {badges.length} badge diraih
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <Card>
                        <CardContent className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
                            <div className="rounded-lg bg-blue-50 p-3 text-center">
                                <p className="text-lg font-bold text-blue-700">{stats.assessment_count}</p>
                                <p className="text-[10px] font-semibold text-blue-500">Assessment Selesai</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3 text-center">
                                <p className="text-lg font-bold text-green-700">{stats.assessment_avg_score}</p>
                                <p className="text-[10px] font-semibold text-green-500">Rata-rata Nilai</p>
                            </div>
                            <div className="rounded-lg bg-purple-50 p-3 text-center">
                                <p className="text-lg font-bold text-purple-700">{stats.assessment_perfect ? 'Ya' : 'Belum'}</p>
                                <p className="text-[10px] font-semibold text-purple-500">Nilai Sempurna</p>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3 text-center">
                                <p className="text-lg font-bold text-amber-700">{stats.points_earned}</p>
                                <p className="text-[10px] font-semibold text-amber-500">Total Poin</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badges */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {badges.map((b) => {
                            const earned = b.earned;
                            const canEarn = !earned && b.condition_met;

                            return (
                                <div
                                    key={b.id}
                                    className={`relative overflow-hidden rounded-xl border p-4 transition-all ${
                                        earned
                                            ? 'border-amber-200 bg-amber-50'
                                            : canEarn
                                              ? 'border-green-200 bg-green-50'
                                              : 'border-slate-200 bg-white opacity-60'
                                    }`}
                                >
                                    {earned && (
                                        <div className="absolute right-2 top-2">
                                            <Award className="h-5 w-5 text-amber-500" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                                                earned
                                                    ? 'bg-amber-100 text-amber-600'
                                                    : canEarn
                                                      ? 'bg-green-100 text-green-600'
                                                      : 'bg-slate-100 text-slate-400'
                                            }`}
                                        >
                                            {b.icon || (earned ? <Medal className="h-6 w-6" /> : <Lock className="h-6 w-6" />)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`truncate text-sm font-bold ${
                                                    earned ? 'text-amber-900' : 'text-slate-900'
                                                }`}
                                            >
                                                {b.badge_name}
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                                {b.description || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Condition */}
                                    {b.conditions && (
                                        <div className="mt-3 border-t border-slate-200 pt-2">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                                Syarat
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-600">
                                                {conditionLabels[b.conditions.type] || b.conditions.type}
                                                {b.conditions.type !== 'assessment_perfect' && (
                                                    <>
                                                        {' '}
                                                        {b.conditions.operator} {b.conditions.value as number}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {/* Status */}
                                    <div className="mt-2">
                                        {earned ? (
                                            <Badge className="bg-amber-100 text-[10px] text-amber-700 hover:bg-amber-100">
                                                Sudah diraih
                                            </Badge>
                                        ) : canEarn ? (
                                            <Badge className="bg-green-100 text-[10px] text-green-700 hover:bg-green-100">
                                                Bisa diraih!
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] text-slate-400">
                                                Belum memenuhi syarat
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {badges.length === 0 && (
                            <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center">
                                <Medal className="h-10 w-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">Belum ada badge</p>
                                <p className="text-xs text-slate-400">Admin belum membuat badge.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

BadgeIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Badge', href: '/badge' },
    ],
};
