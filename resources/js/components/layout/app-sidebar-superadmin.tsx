import { Link } from '@inertiajs/react';
import {
    Activity,
    Archive,
    Award,
    BookOpen,
    Calendar,
    ClipboardList,
    Database,
    LayoutGrid,
    Megaphone,
    Monitor,
    Settings,
    Shield,
    ToggleLeft,
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

const sections: { label: string; items: NavItem[] }[] = [
    {
        label: 'Overview',
        items: [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid }],
    },
    {
        label: 'Management',
        items: [
            { title: 'User Management', href: '/admin/users', icon: Users },
            { title: 'Role & Permission', href: '/admin/roles', icon: Shield },
            {
                title: 'Feature Management',
                href: '/admin/features',
                icon: ToggleLeft,
            },
            {
                title: 'Academic Management',
                href: '/admin/tahun-ajaran',
                icon: Calendar,
            },
            { title: 'Management Kelas', href: '/admin/kelas', icon: BookOpen },
            {
                title: 'Content Management',
                href: '/admin/content-management',
                icon: BookOpen,
            },
        ],
    },
    {
        label: 'Monitoring',
        items: [
            {
                title: 'Monitoring Center',
                href: '/admin/monitoring',
                icon: Monitor,
            },
            {
                title: 'Audit Log',
                href: '/admin/audit-logs',
                icon: ClipboardList,
            },
            { title: 'Log Aktivitas', href: '/admin/logs', icon: Activity },
        ],
    },
    {
        label: 'Tools',
        items: [
            {
                title: 'Sertifikat',
                href: '/admin/certificate-templates',
                icon: Award,
            },
            {
                title: 'Pengumuman Global',
                href: '/admin/global-announcements',
                icon: Megaphone,
            },
            {
                title: 'Arsip Siswa',
                href: '/admin/inactive-students',
                icon: Archive,
            },
            {
                title: 'Backup & Recovery',
                href: '/admin/backup',
                icon: Database,
            },
            { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
        ],
    },
];

export function AppSidebarSuperadmin() {
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
                            style={{ background: '#436391' }}
                        />
                        <span
                            className="text-xs font-medium"
                            style={{ color: '#436391' }}
                        >
                            Super Admin
                        </span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="px-2 py-2">
                {sections.map((s) => (
                    <NavMain key={s.label} items={s.items} label={s.label} />
                ))}
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
