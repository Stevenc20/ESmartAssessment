export function peerConnectionOptions() {
    return {
        host: window.location.hostname,
        port: 443,
        path: '/peerjs',
        secure: true,
        key: 'peerjs',
        debug: 1,
        config: {
            iceServers: [
                { urls: `stun:${import.meta.env.VITE_TURN_HOST ?? 'CHANGE_ME_VPS_IP'}:3478` },
                {
                    urls: `turn:${import.meta.env.VITE_TURN_HOST ?? 'CHANGE_ME_VPS_IP'}:3478`,
                    username: import.meta.env.VITE_TURN_USERNAME ?? 'esmart',
                    credential: import.meta.env.VITE_TURN_CREDENTIAL ?? 'CHANGE_ME_TURN_PASSWORD',
                },
            ],
            sdpSemantics: 'unified-plan',
        },
    };
}
