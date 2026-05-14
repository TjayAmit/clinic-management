import { Link } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    ClipboardList,
    LayoutGrid,
    Shield,
    Stethoscope,
    Users,
    Briefcase,
    FileText,
    UserRound,
    Flag,
    ListOrdered,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/use-permission';
import type { NavGroup } from '@/types';

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutGrid,
            },
        ],
    },
    {
        title: 'Clinic',
        items: [
            {
                title: 'Appointments',
                href: '/appointments',
                icon: CalendarDays,
                permissions: ['appointments.view'],
            },
            {
                title: 'Queue',
                href: '/queue',
                icon: ListOrdered,
                permissions: ['appointments.view'],
            },
            {
                title: 'Patients',
                href: '/patients',
                icon: UserRound,
                permissions: ['patients.view'],
            },
            {
                title: 'Patient Visits',
                href: '/patient-visits',
                icon: ClipboardList,
                permissions: ['appointments.view'],
            },
            {
                title: 'Visit Records',
                href: '/dental-records',
                icon: FileText,
                permissions: ['medical_records.view'],
            },
        ],
    },
    {
        title: 'Doctors',
        roles: ['Admin', 'Staff'],
        items: [
            {
                title: 'Doctors',
                href: '/doctors',
                icon: Stethoscope,
                permissions: ['doctors.view'],
            },
            {
                title: 'Services',
                href: '/services',
                icon: Briefcase,
                permissions: ['services.view'],
            },
        ],
    },
    {
        title: 'System',
        roles: ['Admin'],
        items: [
            {
                title: 'Users',
                href: '/users',
                icon: Users,
                permissions: ['users.view'],
            },
            {
                title: 'Roles',
                href: '/roles',
                icon: Shield,
                roles: ['Admin'],
            },
            {
                title: 'Features',
                href: '/features',
                icon: Flag,
                permissions: ['features.view'],
            },
        ],
    },
    {
        title: 'Audit',
        roles: ['Admin'],
        items: [
            {
                title: 'Activity Logs',
                href: '/activity-logs',
                icon: Activity,
                permissions: ['activity_logs.view'],
            }
        ],
    },
];

export function AppSidebar() {
    const { canAccess, hasRole } = usePermission();

    const filteredGroups = navGroups
        .filter((group) => !group.roles || hasRole(group.roles))
        .map((group) => ({
            ...group,
            items: group.items.filter(canAccess),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-7">
                <NavMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
