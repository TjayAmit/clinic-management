import { Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock,
    Stethoscope,
    UserRound,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as appointmentsRoute } from '@/routes/appointments';
import { index as doctorsRoute } from '@/routes/doctors';
import { index as patientsRoute } from '@/routes/patients';
import { index as servicesRoute } from '@/routes/services';
import type { Auth, DashboardProps } from '@/types';
import {
    BREAKDOWN_ROWS,
    DUMMY_STATS_ADMIN,
    DUMMY_TODAY,
    STATUS_CFG,
    STAT_ICONS,
    avatarCls,
    fmtTime,
    greeting,
    initials,
} from './_shared';

const DUMMY_BREAKDOWN = { pending: 12, confirmed: 8, completed: 45, cancelled: 3, no_show: 2 };

const BREAKDOWN_ICONS: Record<string, React.ElementType> = {
    completed: CheckCircle2,
    confirmed: CheckCircle2,
    pending:   Clock,
    cancelled: XCircle,
    no_show:   XCircle,
};

type Props = DashboardProps & { auth: Auth };

export default function AdminDashboard({
    stats,
    todayAppointments,
    recentAppointments,
    statusBreakdown,
    auth,
}: Props) {
    const displayStats     = stats.length > 0 ? stats : DUMMY_STATS_ADMIN;
    const displayToday     = todayAppointments.length > 0 ? todayAppointments : DUMMY_TODAY;
    const displayBreakdown = Object.values(statusBreakdown).some((v) => v > 0) ? statusBreakdown : DUMMY_BREAKDOWN;

    const firstName   = auth.user?.name?.split(' ')[0] ?? 'there';
    const dateLabel   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const completedCt = displayToday.filter((a) => a.status === 'completed').length;

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
                    {/* Overview breakdown */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                            {(() => {
                                const total = Object.values(displayBreakdown).reduce((a, b) => a + b, 0) || 1;

                                return BREAKDOWN_ROWS.map(({ key, label, color, ic }) => {
                                    const Icon  = BREAKDOWN_ICONS[key] ?? Clock;
                                    const count = displayBreakdown[key] ?? 0;
                                    const pct   = Math.round((count / total) * 100);

                                    return (
                                        <div key={key}>
                                            <div className="mb-1 flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Icon className={`h-3 w-3 ${ic}`} />
                                                    {label}
                                                </span>
                                                <span className="font-semibold tabular-nums">{count}</span>
                                            </div>
                                            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </CardContent>
                    </Card>

                    {/* Quick Links */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0.5 pt-0">
                            {[
                                { href: appointmentsRoute(), icon: <Calendar className="h-3.5 w-3.5" />,   label: 'Appointments' },
                                { href: patientsRoute(),     icon: <UserRound className="h-3.5 w-3.5" />,  label: 'Patients'     },
                                { href: '/schedule',         icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'Schedule'   },
                                { href: doctorsRoute(),      icon: <Stethoscope className="h-3.5 w-3.5" />, label: 'Doctors'    },
                                { href: servicesRoute(),     icon: <Briefcase className="h-3.5 w-3.5" />,  label: 'Services'    },
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

            {/* Recent Appointments */}
            {recentAppointments.length > 0 && (
                <Card className="shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-semibold">Recent Appointments</CardTitle>
                        <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                            <Link href={appointmentsRoute()}>
                                View all <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <div className="divide-y">
                        {recentAppointments.map((appt) => {
                            const cfg  = STATUS_CFG[appt.status] ?? STATUS_CFG.pending;
                            const name = appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`;

                            return (
                                <div
                                    key={appt.id}
                                    onClick={() => router.get(`${appointmentsRoute()}/${appt.id}`)}
                                    className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(name)}`}>
                                        {initials(name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {appt.appointment_date} · {appt.service?.name ?? '—'}
                                        </p>
                                    </div>
                                    <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                                        {appt.dentist?.user?.name ? `Dr. ${appt.dentist.user.name}` : '—'}
                                    </p>
                                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cfg.className}`}>
                                        {cfg.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}

