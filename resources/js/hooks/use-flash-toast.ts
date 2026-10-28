import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

interface InertiaPageProps {
    props?: {
        flash?: {
            success?: string | null;
            error?: string | null;
            status?: string | null;
            toast?: FlashToast | null;
        };
    };
}

export function useFlashToast(): void {
    useEffect(() => {
        // Listen to Inertia finish / success events safely without needing usePage() context
        const unsubscribeSuccess = router.on('success', (event) => {
            const pageProps = (event?.detail?.page as unknown as InertiaPageProps)?.props;
            const flash = pageProps?.flash;

            if (flash?.success) {
                toast.success(flash.success);
            }
            if (flash?.error) {
                toast.error(flash.error);
            }
            if (flash?.status) {
                toast.info(flash.status);
            }
            if (flash?.toast) {
                toast[flash.toast.type](flash.toast.message);
            }
        });

        // Listen to custom Inertia flash events
        const unsubscribeFlash = router.on('flash', (event) => {
            const flashData = (event as CustomEvent).detail?.flash;
            const data = flashData?.toast as FlashToast | undefined;

            if (data?.type && data?.message) {
                toast[data.type](data.message);
            }
        });

        return () => {
            unsubscribeSuccess();
            unsubscribeFlash();
        };
    }, []);
}
