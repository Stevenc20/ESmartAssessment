import { useEffect, useRef } from 'react';

export function useAnnouncementsSse(onRefresh: () => void) {
    const onRefreshRef = useRef(onRefresh);
    onRefreshRef.current = onRefresh;

    useEffect(() => {
        let closed = false;
        let es: EventSource | null = null;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;
        let lastVersion = 0;

        const connect = () => {
            if (closed) return;

            es = new EventSource(`/api/announcements/stream?since=${lastVersion}`);

            es.addEventListener('connected', (event) => {
                try {
                    const data = JSON.parse(
                        (event as MessageEvent).data ?? '{}',
                    );
                    if (typeof data.version === 'number') {
                        lastVersion = data.version;
                    }
                } catch {
                    /* ignore malformed payload */
                }
            });

            es.addEventListener('refresh', (event) => {
                try {
                    const data = JSON.parse(
                        (event as MessageEvent).data ?? '{}',
                    );
                    if (typeof data.version === 'number') {
                        lastVersion = data.version;
                    }
                } catch {
                    /* ignore malformed payload */
                }
                onRefreshRef.current();
            });

            es.onerror = () => {
                if (es) {
                    es.close();
                    es = null;
                }
                if (!closed) {
                    retryTimer = setTimeout(connect, 3000);
                }
            };
        };

        connect();

        return () => {
            closed = true;
            if (retryTimer) clearTimeout(retryTimer);
            if (es) es.close();
        };
    }, []);
}
