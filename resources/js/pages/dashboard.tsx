import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { Auth, DashboardProps } from '@/types';
import AdminDashboard from './dashboard/AdminDashboard';
import DoctorDashboard from './dashboard/DoctorDashboard';
import StaffDashboard from './dashboard/StaffDashboard';

export default function Dashboard(props: DashboardProps) {
    const { auth } = usePage().props as { auth: Auth };
    const { userRoles } = props;

    const isAdmin  = userRoles.includes('Admin');
    const isDoctor = userRoles.includes('Doctor');

    return (
        <>
            <Head title="Dashboard" />
            {isAdmin  && <AdminDashboard  {...props} auth={auth} />}
            {!isAdmin && isDoctor  && <DoctorDashboard {...props} auth={auth} />}
            {!isAdmin && !isDoctor && <StaffDashboard  {...props} auth={auth} />}
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
