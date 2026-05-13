import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CalendarDays,
    CheckCircle,
    ChevronRight,
    Clock,
    ClipboardList,
    Stethoscope,
    UserRound,
    Users,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsRoute } from '@/routes/appointments';
import { index as patientsRoute } from '@/routes/patients';
import { index as dentalRecordsRoute } from '@/routes/dental-records';
import { index as servicesRoute } from '@/routes/services';
import { index as doctorsRoute } from '@/routes/doctors';
import type { DashboardProps } from '@/types';
import type { Auth } from '@/types';

const STATUS_VARIANTS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
};

const ICON_MAP: Record<string, React.ReactNode> = {
    users: <Users className="h-5 w-5" />,
    stethoscope: <Stethoscope className="h-5 w-5" />,
    calendar: <Calendar className="h-5 w-5" />,
    briefcase: <Briefcase className="h-5 w-5" />,
    clock: <Clock className="h-5 w-5" />,
    'calendar-days': <CalendarDays className="h-5 w-5" />,
    clipboard: <ClipboardList className="h-5 w-5" />,
};

export default function Dashboard({
    stats,
    todayAppointments,
    recentAppointments,
    recentPatients,
    recentRecords,
    statusBreakdown,
    userRoles,
}: DashboardProps) {
    const { auth } = usePage().props as { auth: Auth };
    const isAdmin = userRoles.includes('Admin');
    const isStaff = userRoles.includes('Staff');
    const isDoctor = userRoles.includes('Doctor');

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back, {auth.user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Here&apos;s what&apos;s happening at the clinic today.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label}>
                            <CardContent className="flex items-center gap-4 p-6">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {ICON_MAP[stat.icon] ?? <UserRound className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Two-column layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Today's appointments - spans 2 cols */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-base">
                                {isDoctor ? "My Today's Appointments" : "Today's Appointments"}
                            </CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={appointmentsRoute()}>
                                    View all <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {todayAppointments.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                                    <Calendar className="h-8 w-8 opacity-40" />
                                    <p className="text-sm font-medium">No appointments scheduled today</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="h-10 pl-6 pr-4 text-xs font-medium text-muted-foreground">Time</TableHead>
                                            <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Patient</TableHead>
                                            <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Service</TableHead>
                                            {!isDoctor && (
                                                <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Dentist</TableHead>
                                            )}
                                            <TableHead className="h-10 pr-6 pl-4 text-xs font-medium text-muted-foreground">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {todayAppointments.map((appt) => (
                                            <TableRow
                                                key={appt.id}
                                                className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/30"
                                                onClick={() => router.get(appointmentsRoute() + `/${appt.id}`)}
                                            >
                                                <TableCell className="pl-6 pr-4 text-sm tabular-nums">
                                                    {appt.start_time?.slice(0, 5)} – {appt.end_time?.slice(0, 5)}
                                                </TableCell>
                                                <TableCell className="px-4 text-sm font-medium">
                                                    {appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`}
                                                </TableCell>
                                                <TableCell className="px-4 text-sm text-muted-foreground">
                                                    {appt.service?.name ?? '—'}
                                                </TableCell>
                                                {!isDoctor && (
                                                    <TableCell className="px-4 text-sm text-muted-foreground">
                                                        {appt.dentist?.user?.name ?? '—'}
                                                    </TableCell>
                                                )}
                                                <TableCell className="pr-6 pl-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs capitalize ${STATUS_VARIANTS[appt.status] ?? ''}`}
                                                    >
                                                        {STATUS_LABELS[appt.status] ?? appt.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar column */}
                    <div className="flex flex-col gap-6">
                        {/* Status breakdown - Admin only */}
                        {isAdmin && Object.keys(statusBreakdown).length > 0 && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">Appointment Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {([
                                        { key: 'pending', icon: Clock, color: 'text-yellow-600' },
                                        { key: 'confirmed', icon: CheckCircle, color: 'text-blue-600' },
                                        { key: 'completed', icon: CheckCircle, color: 'text-green-600' },
                                        { key: 'cancelled', icon: XCircle, color: 'text-red-600' },
                                        { key: 'no_show', icon: XCircle, color: 'text-gray-500' },
                                    ] as const).map(({ key, icon: Icon, color }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Icon className={`h-4 w-4 ${color}`} />
                                                {STATUS_LABELS[key]}
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {statusBreakdown[key] ?? 0}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent patients - Staff only */}
                        {isStaff && recentPatients.length > 0 && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <CardTitle className="text-base">Recent Patients</CardTitle>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={patientsRoute()}>
                                            View all <ChevronRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {recentPatients.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                                            onClick={() => router.get(`${patientsRoute()}/${p.id}`)}
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <UserRound className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{p.full_name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{p.phone}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent records - Doctor only */}
                        {isDoctor && recentRecords.length > 0 && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-4">
                                    <CardTitle className="text-base">Recent Records</CardTitle>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={dentalRecordsRoute()}>
                                            View all <ChevronRight className="ml-1 h-3 w-3" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {recentRecords.map((r) => (
                                        <div
                                            key={r.id}
                                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                                            onClick={() => router.get(`${dentalRecordsRoute()}/${r.id}`)}
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <ClipboardList className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{r.patient?.full_name}</p>
                                                <p className="truncate text-xs text-muted-foreground">{r.chief_complaint}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick actions */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-2">
                                {(isAdmin || isStaff) && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-3" asChild>
                                        <Link href={appointmentsRoute()}>
                                            <Calendar className="h-4 w-4" />
                                            <span className="text-xs">Appointments</span>
                                        </Link>
                                    </Button>
                                )}
                                <Button variant="outline" className="h-auto flex-col gap-2 py-3" asChild>
                                    <Link href={patientsRoute()}>
                                        <UserRound className="h-4 w-4" />
                                        <span className="text-xs">Patients</span>
                                    </Link>
                                </Button>
                                {isAdmin && (
                                    <>
                                        <Button variant="outline" className="h-auto flex-col gap-2 py-3" asChild>
                                            <Link href={doctorsRoute()}>
                                                <Stethoscope className="h-4 w-4" />
                                                <span className="text-xs">Doctors</span>
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="h-auto flex-col gap-2 py-3" asChild>
                                            <Link href={servicesRoute()}>
                                                <Briefcase className="h-4 w-4" />
                                                <span className="text-xs">Services</span>
                                            </Link>
                                        </Button>
                                    </>
                                )}
                                {isDoctor && (
                                    <Button variant="outline" className="h-auto flex-col gap-2 py-3" asChild>
                                        <Link href={dentalRecordsRoute()}>
                                            <ClipboardList className="h-4 w-4" />
                                            <span className="text-xs">Records</span>
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent appointments - Admin only */}
                {isAdmin && recentAppointments.length > 0 && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-base">Recent Appointments</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={appointmentsRoute()}>
                                    View all <ChevronRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="h-10 pl-6 pr-4 text-xs font-medium text-muted-foreground">Date</TableHead>
                                        <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Patient</TableHead>
                                        <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Dentist</TableHead>
                                        <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Service</TableHead>
                                        <TableHead className="h-10 pr-6 pl-4 text-xs font-medium text-muted-foreground">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentAppointments.map((appt) => (
                                        <TableRow
                                            key={appt.id}
                                            className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/30"
                                            onClick={() => router.get(appointmentsRoute() + `/${appt.id}`)}
                                        >
                                            <TableCell className="pl-6 pr-4 text-sm tabular-nums">
                                                {appt.appointment_date}
                                            </TableCell>
                                            <TableCell className="px-4 text-sm font-medium">
                                                {appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`}
                                            </TableCell>
                                            <TableCell className="px-4 text-sm text-muted-foreground">
                                                {appt.dentist?.user?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className="px-4 text-sm text-muted-foreground">
                                                {appt.service?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className="pr-6 pl-4">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs capitalize ${STATUS_VARIANTS[appt.status] ?? ''}`}
                                                >
                                                    {STATUS_LABELS[appt.status] ?? appt.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);

