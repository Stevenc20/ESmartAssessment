import { usePage } from '@inertiajs/react';
import { AppSidebarSuperadmin } from '@/components/layout/app-sidebar-superadmin';
import { AppSidebarAdmin } from '@/components/layout/app-sidebar-admin';
import { AppSidebarGuru } from '@/components/layout/app-sidebar-guru';
import { AppSidebarSiswa } from '@/components/layout/app-sidebar-siswa';
import type { Auth } from '@/types';

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const roleName = auth.user?.role?.role_name ?? 'siswa';

    switch (roleName) {
        case 'super_admin':
            return <AppSidebarSuperadmin />;
        case 'admin':
            return <AppSidebarAdmin />;
        case 'guru':
            return <AppSidebarGuru />;
        default:
            return <AppSidebarSiswa />;
    }
}
