import { Link } from '@inertiajs/react';
import {
    Activity,
    CalendarDays,
    CalendarPlus,
    ClipboardList,
    LayoutDashboard,
    LayoutGrid,
    Settings2,
    Shield,
    Smile,
    User,
    UserPlus,
    UserRound,
    Users,
    Briefcase,
    Flag,
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
        title: 'Scheduling',
        items: [
            {
                title: 'Daily Board',
                href: '/daily-board',
                icon: LayoutDashboard,
                permissions: ['appointments.view'],
            },
            {
                title: 'Appointments',
                href: '/appointments',
                icon: CalendarDays,
                permissions: ['appointments.view'],
                badge: 7,
            },
            {
                title: 'Book Appointment',
                href: '/appointments/create',
                icon: CalendarPlus,
                permissions: ['appointments.create'],
            },
        ],
    },
    {
        title: 'Patients',
        items: [
            {
                title: 'Patient Records',
                href: '/patients',
                icon: UserRound,
                permissions: ['patients.view'],
            },
            {
                title: 'Register Patient',
                href: '/patients/create',
                icon: UserPlus,
                permissions: ['patients.create'],
            },
        ],
    },
    {
        title: 'Clinical',
        items: [
            {
                title: 'Dental Charting',
                href: '/dental-records',
                icon: Smile,
                permissions: ['medical_records.view'],
            },
            {
                title: 'Treatment Plans',
                href: '/patient-visits',
                icon: ClipboardList,
                permissions: ['medical_records.view'],
            },
        ],
    },
    {
        title: 'Practice',
        items: [
            {
                title: 'Doctors',
                href: '/doctors',
                icon: User,
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
        title: 'Administration',
        roles: ['Admin'],
        items: [
            {
                title: 'Clinic Settings',
                href: '/clinic-settings',
                icon: Settings2,
                roles: ['Admin'],
            },
            {
                title: 'Activity Logs',
                href: '/activity-logs',
                icon: Activity,
                permissions: ['activity_logs.view'],
            },
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

            <SidebarContent className="pt-2">
                <NavMain groups={filteredGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
