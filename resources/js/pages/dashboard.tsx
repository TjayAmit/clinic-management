import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { Auth, DashboardProps } from '@/types';
import DashboardOverview from './dashboard/DashboardOverview';

export default function Dashboard(props: DashboardProps) {
    const { auth } = usePage().props as { auth: Auth };

    return (
        <>
            <Head title="Dashboard" />
            <DashboardOverview {...props} auth={auth} />
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
