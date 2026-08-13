import { useCallback, useEffect, useRef, useState } from 'react';
import { peerConnectionOptions } from '../lib/peer-connection';

type LiveSessionInfo = {
    id: number;
    room_name: string;
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

    const peerRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopBroadcasting = useCallback(async () => {
        setIsLoading(true);
        try {
            // Stop media stream tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            // Destroy peer connection
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }

            // Notify backend stop
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

    const startBroadcasting = useCallback(async () => {
        if (!pertemuanId) {
            setError('Pertemuan ID tidak valid');
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            setError('Browser Anda tidak mendukung Screen Capture API. Pastikan menggunakan Chrome/Edge/Firefox di HTTPS.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Get Screen Stream from Browser Native Picker
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'monitor',
                } as any,
                audio: false,
            });

            streamRef.current = stream;

            // Handle user clicking native browser "Stop sharing" bar
            stream.getVideoTracks()[0].onended = () => {
                stopBroadcasting();
            };

            // 2. Call backend start endpoint to get unique room_name
            const response = await apiFetch(`/pertemuan/${pertemuanId}/live-screen/start`);

            const text = await response.text();
            let data: any;
            try {
                data = JSON.parse(text);
            } catch {
                console.error('Non-JSON response from server:', text.substring(0, 300));
                throw new Error(`Server error (${response.status}): Pastikan sudah login dan coba refresh halaman.`);
            }

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Gagal memulai Sesi Live Screen.');
            }

            const roomName = data.live_session.room_name;
            setLiveSession(data.live_session);

            // 3. Dynamically import PeerJS and create Host Peer with roomName as peer ID
            const { default: Peer } = await import('peerjs');

            const peer = new Peer(roomName, peerConnectionOptions());

            peerRef.current = peer;

            peer.on('open', () => {
                setIsBroadcasting(true);
                setIsLoading(false);
            });

            // Answer incoming call from student viewers with teacher's screen stream
            peer.on('call', (call: any) => {
                call.answer(stream);
            });

            peer.on('error', (err: any) => {
                console.error('PeerJS Broadcaster error:', err);
                setError(err.message || 'Gagal membuat koneksi share screen.');
                setIsLoading(false);
                setIsBroadcasting(false);
            });
        } catch (err: any) {
            console.error('Start broadcasting error:', err);
            setError(err.message || 'Gagal membagikan layar.');
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            setIsLoading(false);
        }
    }, [pertemuanId, stopBroadcasting]);

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
