import { useCallback, useRef, useState } from 'react';

type LiveSessionInfo = {
    id: number;
    room_name: string;
    host_name: string;
    status: string;
    started_at: string | null;
};

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
                await fetch(`/pertemuan/${pertemuanId}/live-screen/stop`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN':
                            (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                });
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
            const response = await fetch(`/pertemuan/${pertemuanId}/live-screen/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            const data = await response.json();

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Gagal memulai Sesi Live Screen.');
            }

            const roomName = data.live_session.room_name;
            setLiveSession(data.live_session);

            // 3. Dynamically import PeerJS and create Host Peer with roomName as peer ID
            const { default: Peer } = await import('peerjs');

            const peer = new Peer(roomName, {
                debug: 1,
            });

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
                if (err.type === 'unavailable-id') {
                    // ID already taken, peer reconnect or handle
                }
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

    return {
        isBroadcasting,
        isLoading,
        liveSession,
        error,
        startBroadcasting,
        stopBroadcasting,
    };
}
