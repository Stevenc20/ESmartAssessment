import { useState } from 'react';
import { AlertTriangle, Loader2, MonitorPlay, Radio, Square, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type LiveSessionData = {
    id: number;
    room_name: string;
    meet_url?: string | null;
    host_id?: number;
    host_name: string;
    status: string;
    started_at: string | null;
} | null;

type LiveScreenCardProps = {
    pertemuanId: number | null;
    isTeacher: boolean;
    liveSession: LiveSessionData;
    isBroadcasting: boolean;
    isLoading: boolean;
    error?: string | null;
    onStartShare: (meetUrl: string) => void;
    onStopShare: () => void;
};

export default function LiveScreenCard({
    isTeacher,
    liveSession,
    isBroadcasting,
    isLoading,
    error,
    onStartShare,
    onStopShare,
}: LiveScreenCardProps) {
    const [meetUrl, setMeetUrl] = useState('');
    const isLive = isBroadcasting || liveSession?.status === 'live';
    const hostName = liveSession?.host_name || 'Pengajar';

    const handleStart = () => {
        const url = meetUrl.trim();
        if (!url) return;
        onStartShare(url);
    };

    const handleJoinMeet = () => {
        if (!liveSession?.meet_url) return;
        window.open(liveSession.meet_url, 'esmart-gmeet', 'popup=yes,width=960,height=720');
    };

    return (
        <Card className="overflow-hidden border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/50 shadow-sm transition-all hover:border-indigo-200">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left Info */}
                    <div className="flex items-start gap-3.5">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                                isLive
                                    ? 'animate-pulse bg-red-100 text-red-600 shadow-sm'
                                    : 'bg-indigo-100 text-indigo-600'
                            }`}
                        >
                            {isLive ? <Radio className="h-6 w-6" /> : <MonitorPlay className="h-6 w-6" />}
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-slate-900">LIVE SCREEN</h3>
                                {isLive ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-extrabold text-red-700">
                                        <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                                        LIVE
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                        ● Offline
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                {isTeacher ? (
                                    isLive ? (
                                        <span className="font-semibold text-red-600">
                                            Anda sedang membagikan sesi Google Meet ke seluruh siswa.
                                        </span>
                                    ) : (
                                        <>
                                            Bagikan penjelasan secara realtime melalui Google Meet. Buka{' '}
                                            <strong>meet.google.com</strong> → <strong>Meeting baru</strong> → salin
                                            link, tempel di bawah, lalu klik <strong>Mulai</strong>.
                                        </>
                                    )
                                ) : isLive ? (
                                    <span>
                                        <strong className="font-semibold text-slate-900">{hostName}</strong> sedang
                                        membagikan sesi. Klik tombol di kanan untuk bergabung.
                                    </span>
                                ) : (
                                    'Belum dimulai. Guru belum membagikan sesi pada pertemuan ini.'
                                )}
                            </p>

                            {error && (
                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex shrink-0 flex-col items-stretch gap-2 self-start sm:self-center">
                        {isTeacher ? (
                            isLive ? (
                                <Button
                                    type="button"
                                    onClick={onStopShare}
                                    disabled={isLoading}
                                    variant="destructive"
                                    className="gap-2 bg-red-600 font-bold hover:bg-red-700 text-xs py-2 px-4 shadow-sm"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
                                    Stop Live Screen
                                </Button>
                            ) : (
                                <>
                                    <Input
                                        type="url"
                                        value={meetUrl}
                                        onChange={(e) => setMeetUrl(e.target.value)}
                                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                        className="w-full sm:w-80 bg-white text-xs"
                                        aria-label="Link Google Meet"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleStart}
                                        disabled={isLoading || !meetUrl.trim()}
                                        className="gap-2 bg-indigo-600 font-bold hover:bg-indigo-700 text-white text-xs py-2 px-4 shadow-sm"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                                        Mulai Live Screen
                                    </Button>
                                </>
                            )
                        ) : isLive ? (
                            liveSession?.meet_url ? (
                                <Button
                                    type="button"
                                    onClick={handleJoinMeet}
                                    className="gap-2 bg-gradient-to-r from-red-600 to-orange-600 font-extrabold hover:from-red-700 hover:to-orange-700 text-white text-xs py-2 px-5 shadow-md animate-pulse"
                                >
                                    <Video className="h-4 w-4" />
                                    Gabung Google Meet
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    disabled
                                    variant="outline"
                                    className="gap-2 text-xs font-semibold opacity-60 cursor-not-allowed"
                                >
                                    <Loader2 className="h-4 w-4" />
                                    Menunggu Link
                                </Button>
                            )
                        ) : (
                            <Button
                                type="button"
                                disabled
                                variant="outline"
                                className="gap-2 text-xs font-semibold opacity-60 cursor-not-allowed"
                            >
                                <MonitorPlay className="h-4 w-4" />
                                Belum Dimulai
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
