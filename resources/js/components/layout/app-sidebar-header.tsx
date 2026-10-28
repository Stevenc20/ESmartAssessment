import { MousePointerClick } from 'lucide-react';
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
                {/* On mobile, hide the breadcrumbs to avoid truncation clutter like 'Profile Set' */}
                {breadcrumbs.length > 0 && (
                    <div className="hidden min-w-0 items-center gap-2 sm:flex">
                        <div className="h-4 w-px bg-slate-200" />
                        <div className="truncate text-sm font-medium text-slate-600">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    </div>
                )}
            </div>

            {isMobile && (
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 active:scale-95"
                    title="Ketuk untuk membuka menu navigasi"
                    aria-label="Ketuk untuk membuka menu navigasi"
                >
                    <MousePointerClick className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-blue-600" />
                    <span>Menu navigasi</span>
                </button>
            )}
        </header>
    );
}
