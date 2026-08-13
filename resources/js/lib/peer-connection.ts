function formatTurnHost(host: string): string {
    return host.includes(':') ? `[${host}]` : host;
}

export function peerConnectionOptions() {
    const turnHost = formatTurnHost(import.meta.env.VITE_TURN_HOST ?? 'CHANGE_ME_VPS_IP');
    return {
        host: window.location.hostname,
        port: 443,
        path: '/peerjs',
        secure: true,
        key: 'peerjs',
        debug: 1,
        config: {
            iceServers: [
                { urls: `stun:${turnHost}:3478` },
                {
                    urls: `turn:${turnHost}:3478`,
                    username: import.meta.env.VITE_TURN_USERNAME ?? 'esmart',
                    credential: import.meta.env.VITE_TURN_CREDENTIAL ?? 'CHANGE_ME_TURN_PASSWORD',
                },
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
                { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
                { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
            ],
            sdpSemantics: 'unified-plan',
        },
    };
}
