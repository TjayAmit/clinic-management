import { Link, router } from '@inertiajs/react';
import {
    Calendar,
    CalendarDays,
    ChevronRight,
    Stethoscope,
    UserPlus,
    UserRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as appointmentsRoute } from '@/routes/appointments';
import { create as appointmentsCreate } from '@/routes/appointments';
import { index as patientsRoute } from '@/routes/patients';
import { index as doctorsRoute } from '@/routes/doctors';
import type { Auth, DashboardProps } from '@/types';
import {
    DUMMY_STATS_STAFF,
    DUMMY_TODAY,
    STATUS_CFG,
    STAT_ICONS,
    avatarCls,
    fmtTime,
    greeting,
    initials,
} from './_shared';

const DUMMY_PATIENTS = [
    { id: 1, first_name: 'Maria',    last_name: 'Santos',     full_name: 'Maria Santos',     phone: '+63 917 123 4567', created_at: '' },
    { id: 2, first_name: 'Jose',     last_name: 'Dela Cruz',  full_name: 'Jose Dela Cruz',   phone: '+63 918 234 5678', created_at: '' },
    { id: 3, first_name: 'Isabella', last_name: 'Reyes',      full_name: 'Isabella Reyes',   phone: '+63 919 345 6789', created_at: '' },
    { id: 4, first_name: 'Rodrigo',  last_name: 'Bautista',   full_name: 'Rodrigo Bautista', phone: '+63 920 456 7890', created_at: '' },
];

type Props = DashboardProps & { auth: Auth };

export default function StaffDashboard({
    stats,
    todayAppointments,
    recentPatients,
    auth,
}: Props) {
    const displayStats    = stats.length > 0 ? stats : DUMMY_STATS_STAFF;
    const displayToday    = todayAppointments.length > 0 ? todayAppointments : DUMMY_TODAY;
    const displayPatients = recentPatients.length > 0 ? recentPatients : DUMMY_PATIENTS;

    const firstName   = auth.user?.name?.split(' ')[0] ?? 'there';
    const dateLabel   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const completedCt = displayToday.filter((a) => a.status === 'completed').length;

    const walkInUrl = appointmentsCreate.url({ query: { walk_in: '1' } });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-8">
            {/* Greeting */}
            <div>
                <p className="text-sm text-muted-foreground">{dateLabel}</p>
                <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
                    {greeting()}, {firstName}
                </h1>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {displayStats.map((s) => (
                    <Card key={s.label} className="shadow-none">
                        <CardContent className="p-5">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                                <span className="text-muted-foreground/60">{STAT_ICONS[s.icon]}</span>
                            </div>
                            <p className="text-3xl font-bold tabular-nums">{s.value.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Today's Appointments */}
                <Card className="flex flex-col shadow-none lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-sm font-semibold">Today's Appointments</CardTitle>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {displayToday.length} scheduled &middot; {completedCt} done
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                            <Link href={appointmentsRoute()}>
                                View all <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>

                    <div className="divide-y">
                        {displayToday.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground">
                                <Calendar className="h-7 w-7 opacity-25" />
                                <p className="text-sm">No appointments today</p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={walkInUrl}>
                                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Walk-in
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            displayToday.map((appt) => {
                                const cfg  = STATUS_CFG[appt.status] ?? STATUS_CFG.pending;
                                const name = appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`;
                                const done = ['completed', 'cancelled', 'no_show'].includes(appt.status);

                                return (
                                    <div
                                        key={appt.id}
                                        onClick={() => router.get(`${appointmentsRoute()}/${appt.id}`)}
                                        className={`flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40 ${done ? 'opacity-40' : ''}`}
                                    >
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(name)}`}>
                                            {initials(name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {appt.service?.name ?? '—'}
                                                {appt.dentist?.user?.name && ` · Dr. ${appt.dentist.user.name}`}
                                            </p>
                                        </div>
                                        <p className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:block">
                                            {fmtTime(appt.start_time)}
                                        </p>
                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cfg.className}`}>
                                            {cfg.label}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Quick Actions */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-0">
                            <Button className="w-full justify-start" asChild>
                                <Link href={walkInUrl}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Walk-in Appointment
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start" asChild>
                                <Link href={appointmentsCreate.url()}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    New Appointment
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0.5 pt-0">
                            {[
                                { href: appointmentsRoute(), icon: <Calendar className="h-3.5 w-3.5" />,     label: 'Appointments'    },
                                { href: patientsRoute(),     icon: <UserRound className="h-3.5 w-3.5" />,    label: 'Patients'        },
                                { href: '/schedule',         icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Today's Schedule" },
                                { href: doctorsRoute(),      icon: <Stethoscope className="h-3.5 w-3.5" />,  label: 'Doctors'         },
                            ].map(({ href, icon, label }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    {icon}
                                    {label}
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Patients */}
            {displayPatients.length > 0 && (
                <Card className="shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-semibold">Recent Patients</CardTitle>
                        <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                            <Link href={patientsRoute()}>
                                View all <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <div className="divide-y">
                        {displayPatients.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => router.get(`${patientsRoute()}/${p.id}`)}
                                className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(p.full_name)}`}>
                                    {initials(p.full_name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{p.full_name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{p.phone ?? '—'}</p>
                                </div>
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
