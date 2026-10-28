import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

interface PageFlash {
    success?: string | null;
    error?: string | null;
    status?: string | null;
    toast?: FlashToast | null;
}

export function useFlashToast(): void {
    const { flash } = usePage<{ flash?: PageFlash }>().props;
    const lastFlashRef = useRef<string | null>(null);

    // Handle session flash props (e.g. from with('success', ...))
    useEffect(() => {
        if (!flash) return;

        const currentKey = `${flash.success || ''}|${flash.error || ''}|${flash.status || ''}`;
        if (currentKey !== lastFlashRef.current) {
            lastFlashRef.current = currentKey;

            if (flash.success) {
                toast.success(flash.success);
            }
            if (flash.error) {
                toast.error(flash.error);
            }
            if (flash.status) {
                toast.info(flash.status);
            }
        }
    }, [flash]);

    // Handle custom Inertia router flash events
    useEffect(() => {
        return router.on('flash', (event) => {
            const flashData = (event as CustomEvent).detail?.flash;
            const data = flashData?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            toast[data.type](data.message);
        });
    }, []);
}
