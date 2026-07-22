import { Link } from '@inertiajs/react';
import { GraduationCap, LayoutGrid, Library, Megaphone, QrCode } from 'lucide-react';
import AppLogo from '@/components/layout/app-logo';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const items: NavItem[] = [
    { title: 'Dashboard',           href: dashboard(),                  icon: LayoutGrid    },
    { title: 'Pengumuman',          href: '/pengumuman',                icon: Megaphone     },
    { title: 'Materi',              href: '/materi-saya',               icon: Library       },
    { title: 'Absensi',             href: '/absen',                     icon: QrCode        },
    { title: 'Assessment',          href: '/assessment',                icon: GraduationCap },
];

export function AppSidebarSiswa() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-4 py-4 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-1 transition-all duration-200">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent focus-visible:ring-0">
                            <Link href={dashboard()}><AppLogo /></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="group-data-[collapsible=icon]:hidden" style={{ height: '1px', background: 'linear-gradient(90deg, rgba(242,174,188,0.6) 0%, rgba(242,174,188,0.15) 100%)', margin: '4px 0 6px' }} />
                <div className="group-data-[collapsible=icon]:hidden px-1">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: '#e8889a' }} />
                        <span className="text-xs font-medium" style={{ color: '#e8889a' }}>Siswa</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-2">
                <NavMain items={items} label="Belajar" />
            </SidebarContent>
            <SidebarFooter className="px-3 py-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-1 transition-all duration-200">
                <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(242,174,188,0.5) 0%, rgba(242,174,188,0.1) 100%)', marginBottom: '8px' }} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
