import { useEffect, useRef } from 'react';

const POLL_INTERVAL_MS = 45000;

export function useAnnouncementsPolling(onRefresh: () => void) {
    const onRefreshRef = useRef(onRefresh);
    onRefreshRef.current = onRefresh;

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | null = null;

        const run = async () => {
            if (cancelled) return;
            try {
                await onRefreshRef.current();
            } catch {
                /* transient error; next poll retries */
            }
        };

        const schedule = () => {
            if (cancelled) return;
            timer = setTimeout(async () => {
                await run();
                schedule();
            }, POLL_INTERVAL_MS);
        };

        const refreshNow = () => {
            if (cancelled) return;
            run();
            if (timer) clearTimeout(timer);
            schedule();
        };

        window.addEventListener('focus', refreshNow);
        document.addEventListener('visibilitychange', refreshNow);
        run();
        schedule();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
            window.removeEventListener('focus', refreshNow);
            document.removeEventListener('visibilitychange', refreshNow);
        };
    }, []);
}
