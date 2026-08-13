import { useCallback, useEffect, useRef, useState } from 'react';

type LiveSessionInfo = {
    id: number;
    room_name: string;
    meet_url: string | null;
    host_name: string;
    status: string;
    started_at: string | null;
};

function getCsrfToken(): string {
    // Try meta tag first (Inertia standard)
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    if (meta?.content) return meta.content;
    // Fallback: read from XSRF-TOKEN cookie (Laravel default)
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

async function apiFetch(url: string, method: 'POST' | 'GET' = 'POST', body?: object) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': getCsrfToken(),
    };

    return fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
    });
}

export function useLiveScreenBroadcaster(pertemuanId: number | null) {
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [liveSession, setLiveSession] = useState<LiveSessionInfo | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopBroadcasting = useCallback(async () => {
        setIsLoading(true);
        try {
            if (pertemuanId) {
                await apiFetch(`/pertemuan/${pertemuanId}/live-screen/stop`);
            }
        } catch (err: any) {
            console.error('Failed to stop live screen:', err);
        } finally {
            setIsBroadcasting(false);
            setIsLoading(false);
            setLiveSession(null);
        }
    }, [pertemuanId]);

    const startBroadcasting = useCallback(
        async (meetUrl: string) => {
            if (!pertemuanId) {
                setError('Pertemuan ID tidak valid');
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await apiFetch(`/pertemuan/${pertemuanId}/live-screen/start`, 'POST', {
                    meet_url: meetUrl,
                });

                const text = await response.text();
                let data: any;
                try {
                    data = JSON.parse(text);
                } catch {
                    console.error('Non-JSON response from server:', text.substring(0, 300));
                    throw new Error(
                        `Server error (${response.status}): Pastikan sudah login dan coba refresh halaman.`,
                    );
                }

                if (!response.ok || data.status !== 'success') {
                    throw new Error(data.message || 'Gagal memulai Sesi Live Screen.');
                }

                setLiveSession(data.live_session);
                setIsBroadcasting(true);
            } catch (err: any) {
                console.error('Start live screen error:', err);
                setError(err.message || 'Gagal membagikan link Google Meet.');
            } finally {
                setIsLoading(false);
            }
        },
        [pertemuanId],
    );

    useEffect(() => {
        return () => {
            stopBroadcasting();
        };
    }, [stopBroadcasting]);

    return {
        isBroadcasting,
        isLoading,
        liveSession,
        error,
        startBroadcasting,
        stopBroadcasting,
    };
}
