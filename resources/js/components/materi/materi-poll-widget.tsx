import { useForm } from '@inertiajs/react';
import { BarChart2, CheckCircle2, Loader2, Vote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type PollOption = {
    id: number;
    opsi_text: string;
    vote_count: number;
    percentage: number;
};

export type PollData = {
    id: number;
    pertanyaan: string;
    is_active: boolean;
    options: PollOption[];
    total_votes: number;
    my_vote_option_id: number | null;
};

type Props = {
    materiId: number;
    poll: PollData;
};

export default function MateriPollWidget({ materiId, poll }: Props) {
    const [selectedOption, setSelectedOption] = useState<number | null>(
        poll.my_vote_option_id
    );

    const { data, setData, post, processing } = useForm({
        option_id: poll.my_vote_option_id as number | null,
    });

    const hasVoted = poll.my_vote_option_id !== null;

    const handleSelectOption = (optionId: number) => {
        setSelectedOption(optionId);
        setData('option_id', optionId);
    };

    const handleVoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const optionToSubmit = data.option_id || selectedOption;
        if (!optionToSubmit) return;

        post(`/materi-saya/${materiId}/poll/vote`, {
            preserveScroll: true,
        });
    };

    return (
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 p-5 md:p-6 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-100/80 mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                        <Vote className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                            Polling & Voting
                        </span>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {poll.pertanyaan}
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                    <BarChart2 className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="font-semibold text-slate-700">{poll.total_votes} Suara</span>
                </div>
            </div>

            {!hasVoted && poll.is_active ? (
                /* Form Selecting Option */
                <form onSubmit={handleVoteSubmit} className="space-y-3">
                    <div className="space-y-2">
                        {poll.options.map((opt) => (
                            <label
                                key={opt.id}
                                onClick={() => handleSelectOption(opt.id)}
                                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                    selectedOption === opt.id
                                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 font-semibold text-indigo-900'
                                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="poll_option"
                                        value={opt.id}
                                        checked={selectedOption === opt.id}
                                        onChange={() => handleSelectOption(opt.id)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                    />
                                    <span className="text-sm">{opt.opsi_text}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button
                            type="submit"
                            disabled={!selectedOption || processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-10 rounded-xl shadow-xs"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim Vote...
                                </>
                            ) : (
                                'Kirim Vote Saya'
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                /* Results Live Progress Bars */
                <div className="space-y-3">
                    {poll.options.map((opt) => {
                        const isMyChoice = poll.my_vote_option_id === opt.id;
                        return (
                            <div key={opt.id} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 font-medium text-slate-800">
                                        <span>{opt.opsi_text}</span>
                                        {isMyChoice && (
                                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" /> Pilihan Anda
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-indigo-700">
                                        {opt.percentage}% ({opt.vote_count} suara)
                                    </span>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 rounded-full ${
                                            isMyChoice ? 'bg-indigo-600' : 'bg-indigo-400/80'
                                        }`}
                                        style={{ width: `${opt.percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
