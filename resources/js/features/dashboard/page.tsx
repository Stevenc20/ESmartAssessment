import { Head, usePage } from '@inertiajs/react';
import SuperadminDashboard from '@/features/dashboard/superadmin-dashboard';
import RegularDashboard from '@/features/dashboard/regular-dashboard';
import StudentDashboard from '@/features/dashboard/student-dashboard';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    stats?: any;
    recentUsers?: any[];
    recentLogs?: any[];
    studentDashboard?: any;
};

export default function Dashboard(props: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const roleName = auth.user?.role?.role_name ?? '';
    const isSuperAdmin = roleName === 'super_admin';

    return (
        <>
            <Head title="Dashboard" />
            {/* Background blobs live in AppContent — just render content here */}
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
                {isSuperAdmin ? (
                    <SuperadminDashboard {...props} />
                ) : roleName === 'siswa' ? (
                    <StudentDashboard studentData={props.studentDashboard} />
                ) : (
                    <RegularDashboard />
                )}
            </div>
        </>
    );
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

Dashboard.layout = {
    breadcrumbs,
};
