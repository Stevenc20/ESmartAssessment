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
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e9edf3] bg-white/95 px-3 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                    <SidebarTrigger className="-ml-1 h-8 w-8 rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700" />
                    {isMobile && (
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            className="hidden text-[11px] font-medium text-slate-500 hover:text-slate-800 sm:inline"
                            title="Buka menu navigasi"
                        >
                            Menu
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
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200"
                    title="Ketuk untuk membuka menu navigasi"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span>Ketuk ikon untuk menu</span>
                </button>
            )}
        </header>
    );
}
