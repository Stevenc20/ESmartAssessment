import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            announcements: {
                id: string;
                judul: string;
                isi: string;
                type: 'info' | 'warning' | 'maintenance';
                source: 'announcements' | 'global_announcements';
                created_at: string;
            }[];
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
