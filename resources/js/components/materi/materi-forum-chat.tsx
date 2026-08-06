import { router, useForm } from '@inertiajs/react';
import {
    CornerDownRight,
    Loader2,
    MessageSquare,
    Send,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';

export type DiscussionReply = {
    id: number;
    user_id: number;
    user_name: string;
    user_role: string;
    user_avatar: string | null;
    pesan: string;
    created_at: string;
    is_mine: boolean;
};

export type DiscussionItem = {
    id: number;
    user_id: number;
    user_name: string;
    user_role: string;
    user_avatar: string | null;
    pesan: string;
    created_at: string;
    is_mine: boolean;
    replies: DiscussionReply[];
};

type Props = {
    materiId: number;
    discussions: DiscussionItem[];
    postUrl?: string;
    deleteUrl?: (discussionId: number) => string;
};

export default function MateriForumChat({ materiId, discussions, postUrl, deleteUrl }: Props) {
    const getInitials = useInitials();
    const [replyToId, setReplyToId] = useState<number | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        pesan: '',
        parent_id: null as number | null,
    });

    const handleSendPesan = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.pesan.trim()) return;

        post(postUrl ?? `/materi-saya/${materiId}/discussion`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setReplyToId(null);
            },
        });
    };

    const handleDeletePesan = (discussionId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
            router.delete(
                deleteUrl
                    ? deleteUrl(discussionId)
                    : `/materi-saya/discussion/${discussionId}`,
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <Card className="border-slate-200 bg-white p-5 md:p-6 shadow-sm rounded-2xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Forum Diskusi Terbuka (Open Discussion)
                        </h3>
                        <p className="text-xs text-slate-500">
                            Saling bertanya, memberikan pendapat, dan berdiskusi dengan kelas & guru
                        </p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {discussions.length} Diskusi
                </span>
            </div>

            {/* Input Form Box */}
            <form onSubmit={handleSendPesan} className="space-y-3">
                {replyToId && (
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                        <span className="font-semibold">Membalas Komentar #{replyToId}</span>
                        <button
                            type="button"
                            onClick={() => {
                                setReplyToId(null);
                                setData('parent_id', null);
                            }}
                            className="font-bold hover:underline"
                        >
                            Batal
                        </button>
                    </div>
                )}
                <div className="relative">
                    <Textarea
                        value={data.pesan}
                        onChange={(e) => setData('pesan', e.target.value)}
                        placeholder="Tulis tanggapan, pertanyaan, atau ide Anda di sini..."
                        className="min-h-[90px] border-slate-200 focus-visible:ring-blue-500 text-xs p-3.5 pr-12 rounded-xl"
                    />
                    <Button
                        type="submit"
                        disabled={!data.pesan.trim() || processing}
                        size="icon"
                        className="absolute bottom-3 right-3 h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>

            {/* Comment List */}
            <div className="space-y-4 pt-2">
                {discussions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                        Belum ada diskusi. Jadilah yang pertama memberikan tanggapan!
                    </div>
                ) : (
                    discussions.map((item) => (
                        <div key={item.id} className="space-y-3">
                            {/* Main Discussion Post */}
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <Avatar className="h-9 w-9 shrink-0 border border-slate-200">
                                    <AvatarImage src={item.user_avatar ?? undefined} alt={item.user_name} />
                                    <AvatarFallback className="bg-blue-100 text-xs font-bold text-blue-700">
                                        {getInitials(item.user_name)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-900">
                                                {item.user_name}
                                            </span>
                                            <span
                                                className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                                                    item.user_role === 'guru' || item.user_role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {item.user_role}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {item.created_at}
                                            </span>
                                        </div>

                                        {item.is_mine && (
                                            <button
                                                onClick={() => handleDeletePesan(item.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                        {item.pesan}
                                    </p>

                                    <div className="pt-1">
                                        <button
                                            onClick={() => {
                                                setReplyToId(item.id);
                                                setData('parent_id', item.id);
                                            }}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                                        >
                                            <CornerDownRight className="h-3 w-3" /> Balas
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Nested Replies */}
                            {item.replies && item.replies.length > 0 && (
                                <div className="pl-6 space-y-2.5 border-l-2 border-slate-200 ml-4">
                                    {item.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white"
                                        >
                                            <Avatar className="h-7 w-7 shrink-0 border border-slate-200">
                                                <AvatarImage src={reply.user_avatar ?? undefined} alt={reply.user_name} />
                                                <AvatarFallback className="bg-slate-200 text-[10px] font-bold text-slate-700">
                                                    {getInitials(reply.user_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {reply.user_name}
                                                        </span>
                                                        <span
                                                            className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full ${
                                                                reply.user_role === 'guru'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-slate-200 text-slate-700'
                                                            }`}
                                                        >
                                                            {reply.user_role}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {reply.created_at}
                                                        </span>
                                                    </div>
                                                    {reply.is_mine && (
                                                        <button
                                                            onClick={() => handleDeletePesan(reply.id)}
                                                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-700 whitespace-pre-line">
                                                    {reply.pesan}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
