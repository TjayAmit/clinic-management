import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CalendarDays,
    CheckCircle2,
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
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsRoute } from '@/routes/appointments';
import { index as dentalRecordsRoute } from '@/routes/dental-records';
import { index as doctorsRoute } from '@/routes/doctors';
import { index as patientsRoute } from '@/routes/patients';
import { index as servicesRoute } from '@/routes/services';
import type {
    DashboardAppointmentItem,
    DashboardPatientItem,
    DashboardProps,
    DashboardRecordItem,
    DashboardStatusBreakdown,
} from '@/types';
import type { Auth } from '@/types';

// ─── Dummy data ───────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().slice(0, 10);

const DUMMY_STATS = [
    { label: 'Total Patients',       value: 248, icon: 'users'       },
    { label: 'Total Doctors',        value: 6,   icon: 'stethoscope' },
    { label: "Today's Appointments", value: 14,  icon: 'calendar'    },
    { label: 'Active Services',      value: 12,  icon: 'briefcase'   },
];

const DUMMY_TODAY: DashboardAppointmentItem[] = [
    { id: 1, appointment_date: TODAY, start_time: '08:00:00', end_time: '08:30:00', status: 'completed',   patient: { id: 1, first_name: 'Maria',    last_name: 'Santos',     full_name: 'Maria Santos'     }, service: { id: 1, name: 'Prophylaxis'       }, dentist: { id: 1, specialization: 'General Dentistry', user: { id: 1, name: 'Ana Reyes'  } } },
    { id: 2, appointment_date: TODAY, start_time: '09:00:00', end_time: '09:45:00', status: 'in_progress', patient: { id: 2, first_name: 'Jose',     last_name: 'Dela Cruz',  full_name: 'Jose Dela Cruz'   }, service: { id: 2, name: 'Root Canal'        }, dentist: { id: 1, specialization: 'General Dentistry', user: { id: 1, name: 'Ana Reyes'  } } },
    { id: 3, appointment_date: TODAY, start_time: '10:00:00', end_time: '10:30:00', status: 'confirmed',   patient: { id: 3, first_name: 'Isabella', last_name: 'Reyes',      full_name: 'Isabella Reyes'   }, service: { id: 3, name: 'Composite Filling' }, dentist: { id: 2, specialization: 'Orthodontics',      user: { id: 2, name: 'Marco Tan'  } } },
    { id: 4, appointment_date: TODAY, start_time: '11:00:00', end_time: '11:30:00', status: 'pending',     patient: { id: 4, first_name: 'Rodrigo',  last_name: 'Bautista',   full_name: 'Rodrigo Bautista' }, service: { id: 1, name: 'Prophylaxis'       }, dentist: { id: 2, specialization: 'Orthodontics',      user: { id: 2, name: 'Marco Tan'  } } },
    { id: 5, appointment_date: TODAY, start_time: '13:00:00', end_time: '14:00:00', status: 'confirmed',   patient: { id: 5, first_name: 'Elena',    last_name: 'Villanueva', full_name: 'Elena Villanueva' }, service: { id: 4, name: 'Braces Adjustment' }, dentist: { id: 2, specialization: 'Orthodontics',      user: { id: 2, name: 'Marco Tan'  } } },
    { id: 6, appointment_date: TODAY, start_time: '14:30:00', end_time: '15:00:00', status: 'pending',     patient: { id: 6, first_name: 'Carlos',   last_name: 'Mendoza',    full_name: 'Carlos Mendoza'   }, service: { id: 5, name: 'Tooth Extraction'  }, dentist: { id: 1, specialization: 'General Dentistry', user: { id: 1, name: 'Ana Reyes'  } } },
];

const DUMMY_PATIENTS: DashboardPatientItem[] = [
    { id: 1, first_name: 'Maria',    last_name: 'Santos',     full_name: 'Maria Santos',     phone: '+63 917 123 4567', created_at: TODAY },
    { id: 2, first_name: 'Jose',     last_name: 'Dela Cruz',  full_name: 'Jose Dela Cruz',   phone: '+63 918 234 5678', created_at: TODAY },
    { id: 3, first_name: 'Isabella', last_name: 'Reyes',      full_name: 'Isabella Reyes',   phone: '+63 919 345 6789', created_at: TODAY },
    { id: 4, first_name: 'Rodrigo',  last_name: 'Bautista',   full_name: 'Rodrigo Bautista', phone: '+63 920 456 7890', created_at: TODAY },
];

const DUMMY_RECORDS: DashboardRecordItem[] = [
    { id: 1, patient_id: 1, chief_complaint: 'Sensitivity on lower left molar', created_at: TODAY, patient: { id: 1, first_name: 'Maria',    last_name: 'Santos',    full_name: 'Maria Santos'   } },
    { id: 2, patient_id: 2, chief_complaint: 'Gum bleeding when brushing',      created_at: TODAY, patient: { id: 2, first_name: 'Jose',     last_name: 'Dela Cruz', full_name: 'Jose Dela Cruz' } },
    { id: 3, patient_id: 3, chief_complaint: 'Braces wire adjustment needed',   created_at: TODAY, patient: { id: 3, first_name: 'Isabella', last_name: 'Reyes',     full_name: 'Isabella Reyes' } },
];

const DUMMY_BREAKDOWN: DashboardStatusBreakdown = {
    pending: 12, confirmed: 8, completed: 45, cancelled: 3, no_show: 2,
};

// ─── Config ───────────────────────────────────────────────────────────────────

const STAT_ICONS: Record<string, React.ReactNode> = {
    users:          <Users className="h-4 w-4" />,
    stethoscope:    <Stethoscope className="h-4 w-4" />,
    calendar:       <Calendar className="h-4 w-4" />,
    briefcase:      <Briefcase className="h-4 w-4" />,
    clock:          <Clock className="h-4 w-4" />,
    'calendar-days':<CalendarDays className="h-4 w-4" />,
    clipboard:      <ClipboardList className="h-4 w-4" />,
};

const STATUS_CFG: Record<string, { label: string; className: string }> = {
    pending:         { label: 'Pending',     className: 'bg-amber-50  text-amber-600  ring-1 ring-amber-200  dark:bg-amber-950/30  dark:text-amber-400  dark:ring-amber-800'  },
    confirmed:       { label: 'Confirmed',   className: 'bg-blue-50   text-blue-600   ring-1 ring-blue-200   dark:bg-blue-950/30   dark:text-blue-400   dark:ring-blue-800'   },
    in_progress:     { label: 'In Progress', className: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:ring-violet-800' },
    completed:       { label: 'Completed',   className: 'bg-teal-50   text-teal-600   ring-1 ring-teal-200   dark:bg-teal-950/30   dark:text-teal-400   dark:ring-teal-800'   },
    needs_follow_up: { label: 'Follow-up',   className: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:ring-orange-800' },
    cancelled:       { label: 'Cancelled',   className: 'bg-red-50    text-red-500    ring-1 ring-red-200    dark:bg-red-950/30    dark:text-red-400    dark:ring-red-800'    },
    no_show:         { label: 'No Show',     className: 'bg-slate-100 text-slate-500  ring-1 ring-slate-200  dark:bg-slate-800     dark:text-slate-400  dark:ring-slate-700'  },
};

const BREAKDOWN_ROWS = [
    { key: 'completed', label: 'Completed', color: 'bg-teal-500',   icon: CheckCircle2, ic: 'text-teal-500'  },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-500',   icon: CheckCircle2, ic: 'text-blue-500'  },
    { key: 'pending',   label: 'Pending',   color: 'bg-amber-400',  icon: Clock,        ic: 'text-amber-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400',    icon: XCircle,      ic: 'text-red-400'   },
    { key: 'no_show',   label: 'No Show',   color: 'bg-slate-300',  icon: XCircle,      ic: 'text-slate-400' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(t: string) {
    const [h, m] = t.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function initials(name?: string) {
    if (!name) {
return '??';
}

    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function greeting() {
    const h = new Date().getHours();

    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const AVATAR_PALETTE = [
    'bg-teal-100   text-teal-700   dark:bg-teal-900/40   dark:text-teal-300',
    'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300',
    'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
    'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',
];

function avatarCls(name?: string) {
    if (!name) {
return AVATAR_PALETTE[0];
}

    return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    const isAdmin  = userRoles.includes('Admin');
    const isStaff  = userRoles.includes('Staff');
    const isDoctor = userRoles.includes('Doctor');

    const displayStats     = stats.length > 0 ? stats : DUMMY_STATS;
    const displayToday     = todayAppointments.length > 0 ? todayAppointments : DUMMY_TODAY;
    const displayPatients  = recentPatients.length > 0 ? recentPatients : (isStaff  ? DUMMY_PATIENTS : []);
    const displayRecords   = recentRecords.length  > 0 ? recentRecords  : (isDoctor ? DUMMY_RECORDS  : []);
    const displayBreakdown = Object.values(statusBreakdown).some((v) => v > 0) ? statusBreakdown : DUMMY_BREAKDOWN;

    const firstName    = auth.user?.name?.split(' ')[0] ?? 'there';
    const dateLabel    = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const completedCt  = displayToday.filter((a) => a.status === 'completed').length;

    return (
        <>
            <Head title="Dashboard" />

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

                    {/* Appointments — 2 cols */}
                    <Card className="flex flex-col shadow-none lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    {isDoctor ? "My Appointments Today" : "Today's Appointments"}
                                </CardTitle>
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
                            ) : displayToday.map((appt) => {
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
                                                {!isDoctor && appt.dentist?.user?.name && ` · Dr. ${appt.dentist.user.name}`}
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
                            })}
                        </div>
                    </Card>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-4">

                        {/* Overview */}
                        <Card className="shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {(() => {
                                    const total = Object.values(displayBreakdown).reduce((a, b) => a + b, 0) || 1;

                                    return BREAKDOWN_ROWS.map(({ key, label, color, icon: Icon, ic }) => {
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

                        {/* Quick links */}
                        <Card className="shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-0.5 pt-0">
                                {[
                                    ...(isAdmin || isStaff ? [{ href: appointmentsRoute(), icon: <Calendar className="h-3.5 w-3.5" />, label: 'Appointments' }] : []),
                                    { href: patientsRoute(),  icon: <UserRound   className="h-3.5 w-3.5" />, label: 'Patients'     },
                                    { href: '/schedule',      icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'Schedule'     },
                                    ...(isAdmin ? [
                                        { href: doctorsRoute(),  icon: <Stethoscope className="h-3.5 w-3.5" />, label: 'Doctors'   },
                                        { href: servicesRoute(), icon: <Briefcase   className="h-3.5 w-3.5" />, label: 'Services'  },
                                    ] : []),
                                    ...(isDoctor ? [{ href: dentalRecordsRoute(), icon: <ClipboardList className="h-3.5 w-3.5" />, label: 'Records' }] : []),
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

                {/* Role-based recents */}
                {((isStaff && displayPatients.length > 0) || (isDoctor && displayRecords.length > 0) || (isAdmin && recentAppointments.length > 0)) && (
                    <div className="grid gap-6 lg:grid-cols-2">

                        {isStaff && displayPatients.length > 0 && (
                            <SimpleRecentCard
                                title="Recent Patients"
                                href={patientsRoute().url}
                                rows={displayPatients.map((p) => ({ id: p.id, name: p.full_name, sub: p.phone ?? '—', href: `${patientsRoute().url}/${p.id}` }))}
                            />
                        )}

                        {isDoctor && displayRecords.length > 0 && (
                            <SimpleRecentCard
                                title="Recent Records"
                                href={dentalRecordsRoute().url}
                                rows={displayRecords.map((r) => ({ id: r.id, name: r.patient?.full_name ?? '—', sub: r.chief_complaint, href: `${dentalRecordsRoute().url}/${r.id}` }))}
                            />
                        )}

                        {isAdmin && recentAppointments.length > 0 && (
                            <Card className="shadow-none lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-sm font-semibold">Recent Appointments</CardTitle>
                                    <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                                        <Link href={appointmentsRoute()}>View all <ChevronRight className="h-3 w-3" /></Link>
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
                                                    <p className="text-xs text-muted-foreground">{appt.appointment_date} · {appt.service?.name ?? '—'}</p>
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
                )}
            </div>
        </>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SimpleRecentCard({ title, href, rows }: {
    title: string;
    href: string;
    rows: { id: number; name: string; sub: string; href: string }[];
}) {
    return (
        <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                    <Link href={href}>View all <ChevronRight className="h-3 w-3" /></Link>
                </Button>
            </CardHeader>
            <div className="divide-y">
                {rows.map((row) => (
                    <div
                        key={row.id}
                        onClick={() => router.get(row.href)}
                        className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                    >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(row.name)}`}>
                            {initials(row.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{row.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{row.sub}</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    </div>
                ))}
            </div>
        </Card>
    );
}

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
        {page}
    </AppLayout>
);
