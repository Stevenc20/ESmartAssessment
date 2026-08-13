import { useCallback, useEffect, useRef, useState } from 'react';
import { peerConnectionOptions } from '../lib/peer-connection';

const CONNECT_TIMEOUT_MS = 25000;

export function useLiveScreenViewer(roomName: string | null, active: boolean) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const peerRef = useRef<any>(null);
    const callRef = useRef<any>(null);
    const timeoutRef = useRef<number | null>(null);

    const clearConnectTimeout = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const connectToBroadcaster = useCallback(async () => {
        if (!roomName || !active) return;

        setIsConnecting(true);
        setError(null);
        clearConnectTimeout();

        try {
            if (callRef.current) {
                callRef.current.close();
                callRef.current = null;
            }
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }

            const { default: Peer } = await import('peerjs');

            // Initialize student peer (random ID)
            const peer = new Peer(peerConnectionOptions());
            peerRef.current = peer;

            timeoutRef.current = window.setTimeout(() => {
                if (callRef.current) {
                    callRef.current.close();
                    callRef.current = null;
                }
                if (peerRef.current) {
                    peerRef.current.destroy();
                    peerRef.current = null;
                }
                setIsConnecting(false);
                setError('Waktu koneksi habis. Periksa jaringanmu, lalu tekan Hubungkan Ulang.');
            }, CONNECT_TIMEOUT_MS);

            peer.on('open', () => {
                // Call teacher room ID
                const fakeStream = new MediaStream();
                const call = peer.call(roomName, fakeStream);
                callRef.current = call;

                call.on('stream', (remoteStream: MediaStream) => {
                    clearConnectTimeout();
                    setStream(remoteStream);
                    setIsConnected(true);
                    setIsConnecting(false);
                });

                call.on('close', () => {
                    clearConnectTimeout();
                    setStream(null);
                    setIsConnected(false);
                    setIsConnecting(false);
                });

                call.on('error', (err: any) => {
                    clearConnectTimeout();
                    console.error('Call viewer error:', err);
                    setError('Gagal menerima tayangan layar.');
                    setIsConnecting(false);
                });
            });

            peer.on('error', (err: any) => {
                clearConnectTimeout();
                console.error('PeerJS Viewer error:', err);
                setIsConnecting(false);
                if (err.type === 'peer-unavailable') {
                    setError('Pengajar belum memulai tayangan atau koneksi terputus.');
                } else {
                    setError('Koneksi terputus. Mencoba reconnect...');
                }
            });
        } catch (err: any) {
            clearConnectTimeout();
            console.error('Connect viewer error:', err);
            setError('Gagal menghubungkan ke tayangan layar.');
            setIsConnecting(false);
        }
    }, [roomName, active, clearConnectTimeout]);

    const disconnect = useCallback(() => {
        clearConnectTimeout();
        if (callRef.current) {
            callRef.current.close();
            callRef.current = null;
        }
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setStream(null);
        setIsConnected(false);
        setIsConnecting(false);
    }, [clearConnectTimeout]);

    useEffect(() => {
        if (active && roomName) {
            connectToBroadcaster();
        } else {
            disconnect();
        }

        return () => {
            disconnect();
        };
    }, [active, roomName, connectToBroadcaster, disconnect]);

    return {
        stream,
        isConnected,
        isConnecting,
        error,
        reconnect: connectToBroadcaster,
        disconnect,
    };
}
