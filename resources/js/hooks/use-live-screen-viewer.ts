import { useCallback, useEffect, useRef, useState } from 'react';
import { peerConnectionOptions } from '../lib/peer-connection';

const CONNECT_TIMEOUT_MS = 25000;
const MAX_AUTO_RETRIES = 5;
const AUTO_RETRY_DELAY_MS = 5000;

function stopTracks(stream: MediaStream | null) {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
}

export function useLiveScreenViewer(roomName: string | null, active: boolean) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const peerRef = useRef<any>(null);
    const callRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const retryCountRef = useRef(0);

    const clearConnectTimeout = useCallback(() => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const teardown = useCallback(() => {
        clearConnectTimeout();
        if (callRef.current) {
            callRef.current.close();
            callRef.current = null;
        }
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        stopTracks(streamRef.current);
        streamRef.current = null;
    }, [clearConnectTimeout]);

    const connectToBroadcaster = useCallback(async () => {
        if (!roomName || !active) return;

        setIsConnecting(true);
        setError(null);
        teardown();

        try {
            const { default: Peer } = await import('peerjs');

            // Initialize student peer (random ID)
            const peer = new Peer(peerConnectionOptions());
            peerRef.current = peer;

            timeoutRef.current = window.setTimeout(() => {
                teardown();
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
                    retryCountRef.current = 0;
                    streamRef.current = remoteStream;
                    setStream(remoteStream);
                    setIsConnected(true);
                    setIsConnecting(false);
                });

                call.on('close', () => {
                    teardown();
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
                console.error('PeerJS Viewer error:', err);
                const retryable = err?.type === 'peer-unavailable' || err?.type === 'network';

                if (retryable && retryCountRef.current < MAX_AUTO_RETRIES) {
                    retryCountRef.current += 1;
                    teardown();
                    clearConnectTimeout();
                    timeoutRef.current = window.setTimeout(() => {
                        connectToBroadcaster();
                    }, AUTO_RETRY_DELAY_MS);
                    return;
                }

                clearConnectTimeout();
                setIsConnecting(false);
                if (err?.type === 'peer-unavailable') {
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
    }, [roomName, active, clearConnectTimeout, teardown]);

    const disconnect = useCallback(() => {
        teardown();
        setStream(null);
        setIsConnected(false);
        setIsConnecting(false);
    }, [teardown]);

    useEffect(() => {
        if (active && roomName) {
            retryCountRef.current = 0;
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
