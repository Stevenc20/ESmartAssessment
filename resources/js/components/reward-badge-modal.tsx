import { usePage } from '@inertiajs/react';
import { Award, Sparkles, Trophy, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type EarnedBadge = {
    id: number;
    badge_name: string;
    icon: string | null;
    description: string | null;
    points: number;
};

export default function RewardBadgeModal() {
    const { flash } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [badges, setBadges] = useState<EarnedBadge[]>([]);

    useEffect(() => {
        if (flash?.new_badges && Array.isArray(flash.new_badges) && flash.new_badges.length > 0) {
            setBadges(flash.new_badges);
            setOpen(true);
        }
    }, [flash]);

    if (!open || badges.length === 0) return null;

    const totalPoints = badges.reduce((acc, b) => acc + (b.points || 100), 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-2 border-amber-200 bg-white shadow-2xl">
                {/* Header Banner */}
                <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-6 text-center text-white">
                    <button
                        onClick={() => setOpen(false)}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg text-3xl animate-bounce">
                        🏆
                    </div>

                    <h2 className="text-xl font-extrabold tracking-tight">
                        SELAMAT! BADGE BARU DIRAIIH!
                    </h2>
                    <p className="text-xs text-amber-100 mt-1">
                        Anda telah berhasil membuka {badges.length} Badge Reward Baru!
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 shadow-sm"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-2xl shadow-inner font-extrabold">
                                {badge.icon || <Award className="h-6 w-6 text-amber-600" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                                    {badge.badge_name}
                                </h4>
                                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                                    {badge.description || 'Pencapaian pembelajaran luar biasa!'}
                                </p>
                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-extrabold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full">
                                    <Sparkles className="h-3 w-3 text-amber-600" />
                                    +{badge.points || 100} Reward Points
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
                    <p className="text-xs font-semibold text-slate-600">
                        Total Bonus Poin Diperoleh: <span className="font-extrabold text-amber-600 text-sm">+{totalPoints} Poin</span>
                    </p>
                    <Button
                        onClick={() => setOpen(false)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm py-2.5 rounded-xl shadow-md"
                    >
                        🎉 Klaim Badge & Poin Ini!
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
