import { Link } from '@inertiajs/react';
import {
    Activity,
    Archive,
    BookOpen,
    Calendar,
    CalendarDays,
    Database,
    LayoutGrid,
    Megaphone,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/layout/app-logo';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const items: NavItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
    { title: 'Management Users', href: '/admin/users', icon: Users },
    { title: 'Role & Permission', href: '/admin/roles', icon: Shield },
    { title: 'Tahun Ajaran', href: '/admin/tahun-ajaran', icon: Calendar },
    { title: 'Management Kelas', href: '/admin/kelas', icon: BookOpen },
    { title: 'Pertemuan', href: '/pertemuan', icon: CalendarDays },
    { title: 'Pengumuman', href: '/admin/announcements', icon: Megaphone },
    { title: 'Log Aktivitas', href: '/admin/logs', icon: Activity },
    { title: 'Backup Database', href: '/admin/backup', icon: Database },
    { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
    { title: 'Arsip Siswa', href: '/admin/inactive-students', icon: Archive },
];

export function AppSidebarAdmin() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-4 py-4 transition-all duration-200 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-transparent focus-visible:ring-0"
                        >
                            <Link href="/admin/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <div
                    className="group-data-[collapsible=icon]:hidden"
                    style={{
                        height: '1px',
                        background:
                            'linear-gradient(90deg, rgba(242,174,188,0.6) 0%, rgba(242,174,188,0.15) 100%)',
                        margin: '4px 0 6px',
                    }}
                />
                <div className="px-1 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2">
                        <span
                            className="h-2 w-2 flex-shrink-0 rounded-full"
                            style={{ background: '#7c3aed' }}
                        />
                        <span
                            className="text-xs font-medium"
                            style={{ color: '#7c3aed' }}
                        >
                            Administrator
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-2">
                <NavMain items={items} label="Administration" />
            </SidebarContent>
            <SidebarFooter className="px-3 py-3 transition-all duration-200 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-1">
                <div
                    style={{
                        height: '1px',
                        background:
                            'linear-gradient(90deg, rgba(242,174,188,0.5) 0%, rgba(242,174,188,0.1) 100%)',
                        marginBottom: '8px',
                    }}
                />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
