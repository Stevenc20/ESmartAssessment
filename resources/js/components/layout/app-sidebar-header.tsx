import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { isMobile, toggleSidebar } = useSidebar();

    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#e9edf3] bg-white/95 px-3 backdrop-blur-md shadow-xs md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <div className="flex items-center gap-1.5">
                    <SidebarTrigger
                        className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all"
                        aria-label="Buka/Tutup Menu Navigasi"
                        title="Buka menu navigasi"
                    />
                    {isMobile && (
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                            title="Buka menu navigasi"
                        >
                            <span>Menu</span>
                        </button>
                    )}
                </div>
                {breadcrumbs.length > 0 && (
                    <div className="hidden h-4 w-px bg-slate-200 sm:block" />
                )}
                <div className="min-w-0 truncate text-sm font-medium text-slate-600">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {isMobile && (
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs transition-all hover:bg-blue-100 active:scale-95"
                    title="Menu lainnya ada di sini — ketuk untuk membuka navigasi"
                    aria-label="Menu lainnya ada di sini — ketuk untuk membuka navigasi"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                    </span>
                    <span className="truncate max-w-[200px] xs:max-w-none">
                        Menu navigasi &bull; Ketuk di sini
                    </span>
                </button>
            )}
        </header>
    );
}
