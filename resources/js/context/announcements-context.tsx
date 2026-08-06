import { createContext, useContext, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useAnnouncementsSse } from '@/hooks/use-announcements-sse';

export type AnnouncementItem = {
    id: string;
    judul: string;
    isi: string;
    type: 'info' | 'warning' | 'maintenance';
    source: 'announcements' | 'global_announcements';
    created_at: string;
};

export type UnreadCounts = {
    pengumuman: number;
    materi: number;
    assessment: number;
};

const EMPTY_UNREAD: UnreadCounts = {
    pengumuman: 0,
    materi: 0,
    assessment: 0,
};

type AnnouncementsContextValue = {
    announcements: AnnouncementItem[];
    unreadCounts: UnreadCounts;
};

const AnnouncementsContext = createContext<AnnouncementsContextValue | null>(
    null,
);

export function AnnouncementsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const props = usePage().props as {
        announcements?: AnnouncementItem[];
        unreadCounts?: UnreadCounts;
    };

    const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(
        props.announcements ?? [],
    );
    const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>(
        props.unreadCounts ?? EMPTY_UNREAD,
    );

    useEffect(() => {
        setAnnouncements(props.announcements ?? []);
        setUnreadCounts(props.unreadCounts ?? EMPTY_UNREAD);
    }, [props.announcements, props.unreadCounts]);

    useAnnouncementsSse(async () => {
        try {
            const [announcementRes, unreadRes] = await Promise.all([
                fetch('/api/announcements'),
                fetch('/api/unread-counts'),
            ]);
            const announcementData = await announcementRes.json();
            const unreadData = await unreadRes.json();

            if (Array.isArray(announcementData.list)) {
                setAnnouncements(announcementData.list);
            }
            if (unreadData.unreadCounts) {
                setUnreadCounts(unreadData.unreadCounts);
            }
        } catch {
            /* network error, retry on next SSE event */
        }
    });

    return (
        <AnnouncementsContext.Provider value={{ announcements, unreadCounts }}>
            {children}
        </AnnouncementsContext.Provider>
    );
}

export function useAnnouncements(): AnnouncementsContextValue {
    const ctx = useContext(AnnouncementsContext);
    if (!ctx) {
        throw new Error(
            'useAnnouncements must be used within AnnouncementsProvider',
        );
    }
    return ctx;
}
