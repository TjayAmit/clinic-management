import { Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    CalendarPlus,
    Clock,
    LayoutDashboard,
    Plus,
    Stethoscope,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { create as appointmentsCreate } from '@/routes/appointments';
import { create as patientsCreate } from '@/routes/patients';
import type { Auth, DashboardAppointmentItem, DashboardProps } from '@/types';
import {
    BREAKDOWN_ROWS,
    DUMMY_TODAY,
    STATUS_CFG,
    STATUS_DOT,
    avatarCls,
    fmtTime,
    greeting,
    initials,
} from './_shared';

type DoctorOnDuty = {
    id: number;
    name: string;
    specialization: string;
    status: 'available' | 'busy' | 'off';
};

const DEFAULT_STATS = [
    { label: 'Patients today', value: 18, icon: Users, color: 'teal' },
    { label: 'Appointments', value: 6, icon: Calendar, color: 'blue' },
    { label: 'In chair now', value: 1, icon: Clock, color: 'violet' },
    { label: 'Doctors on duty', value: 2, icon: Stethoscope, color: 'amber' },
];

const DEFAULT_DOCTORS: DoctorOnDuty[] = [
    {
        id: 1,
        name: 'Dr. Ana Reyes',
        specialization: 'General Dentistry',
        status: 'available',
    },
    {
        id: 2,
        name: 'Dr. Marco Tan',
        specialization: 'Orthodontics',
        status: 'busy',
    },
    {
        id: 3,
        name: 'Dr. Juan Dela Cruz',
        specialization: 'General Dentistry',
        status: 'off',
    },
];

const DEFAULT_BREAKDOWN = {
    completed: 45,
    confirmed: 8,
    pending: 12,
    cancelled: 3,
    no_show: 2,
};

const ICON_PALETTE: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const DOCTOR_STATUS: Record<string, string> = {
    available:
        'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    busy: 'bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    off: 'bg-slate-400/15 text-slate-700 dark:bg-slate-400/20 dark:text-slate-300',
};

function uniquePatients(appointments: DashboardAppointmentItem[]): number {
    return new Set(appointments.map((a) => a.patient?.id).filter(Boolean)).size;
}

function uniqueDoctors(appointments: DashboardAppointmentItem[]): number {
    return new Set(appointments.map((a) => a.dentist?.id).filter(Boolean)).size;
}

function deriveDoctors(
    appointments: DashboardAppointmentItem[],
): DoctorOnDuty[] {
    const map = new Map<number, DoctorOnDuty>();

    for (const appt of appointments) {
        if (!appt.dentist) {
            continue;
        }

        const id = appt.dentist.id;

        if (!map.has(id)) {
            map.set(id, {
                id,
                name: appt.dentist.user?.name ?? 'Doctor',
                specialization: appt.dentist.specialization,
                status: appt.status === 'in_progress' ? 'busy' : 'available',
            });
        } else if (appt.status === 'in_progress') {
            map.set(id, { ...map.get(id)!, status: 'busy' });
        }
    }

    return Array.from(map.values());
}

function doctorStatusLabel(status: string): string {
    if (status === 'busy') {
        return 'In chair';
    }

    if (status === 'off') {
        return 'Off today';
    }

    return 'Available';
}

type Props = DashboardProps & { auth: Auth };

export default function DashboardOverview({
    todayAppointments,
    statusBreakdown,
    auth,
}: Props) {
    const hasRealData = todayAppointments.length > 0;
    const displayToday = hasRealData ? todayAppointments : DUMMY_TODAY;
    const displayDoctors = hasRealData
        ? deriveDoctors(displayToday)
        : DEFAULT_DOCTORS;

    const inChairCount = displayToday.filter(
        (a) => a.status === 'in_progress',
    ).length;

    const displayStats = [
        {
            label: DEFAULT_STATS[0].label,
            value: hasRealData
                ? uniquePatients(displayToday)
                : DEFAULT_STATS[0].value,
            icon: DEFAULT_STATS[0].icon,
            color: DEFAULT_STATS[0].color,
        },
        {
            label: DEFAULT_STATS[1].label,
            value: hasRealData ? displayToday.length : DEFAULT_STATS[1].value,
            icon: DEFAULT_STATS[1].icon,
            color: DEFAULT_STATS[1].color,
        },
        {
            label: DEFAULT_STATS[2].label,
            value: hasRealData ? inChairCount : DEFAULT_STATS[2].value,
            icon: DEFAULT_STATS[2].icon,
            color: DEFAULT_STATS[2].color,
        },
        {
            label: DEFAULT_STATS[3].label,
            value: hasRealData
                ? uniqueDoctors(displayToday)
                : DEFAULT_STATS[3].value,
            icon: DEFAULT_STATS[3].icon,
            color: DEFAULT_STATS[3].color,
        },
    ];

    const effectiveBreakdown = Object.values(statusBreakdown).some((v) => v > 0)
        ? statusBreakdown
        : DEFAULT_BREAKDOWN;

    const total =
        Object.values(effectiveBreakdown).reduce((a, b) => a + b, 0) || 1;

    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="flex min-h-full flex-1 flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{dateLabel}</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                        {greeting()}, {firstName} 👋
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        A smile is the prettiest thing you can wear — here’s the
                        day ahead.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2" asChild>
                        <Link href={appointmentsCreate()}>
                            <CalendarPlus className="h-4 w-4" />
                            Book appointment
                        </Link>
                    </Button>
                    <Button className="gap-2" asChild>
                        <Link href="/daily-board">
                            <LayoutDashboard className="h-4 w-4" />
                            Open daily board
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {displayStats.map((stat) => (
                    <Card key={stat.label} className="border-0 shadow-sm">
                        <CardContent className="flex items-start justify-between p-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </p>
                                <p className="mt-3 text-3xl font-bold text-foreground tabular-nums">
                                    {stat.value}
                                </p>
                            </div>
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${ICON_PALETTE[stat.color]}`}
                            >
                                <stat.icon className="h-5 w-5" />
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Today&apos;s Appointments
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {displayToday.length} scheduled ·{' '}
                                {
                                    displayToday.filter(
                                        (a) => a.status === 'completed',
                                    ).length
                                }{' '}
                                completed
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-primary"
                            asChild
                        >
                            <Link href="/appointments">
                                View all <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {displayToday.map((appt) => {
                            const cfg =
                                STATUS_CFG[appt.status] ?? STATUS_CFG.pending;
                            const name =
                                appt.patient?.full_name ??
                                `${appt.patient?.first_name} ${appt.patient?.last_name}`;

                            return (
                                <button
                                    key={appt.id}
                                    type="button"
                                    onClick={() =>
                                        router.get(`/appointments/${appt.id}`)
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40"
                                >
                                    <span
                                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[appt.status] ?? 'bg-muted-foreground'}`}
                                    />
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarCls(name)}`}
                                    >
                                        {initials(name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {appt.service?.name ?? '—'} ·{' '}
                                            {appt.dentist?.user?.name ?? '—'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-foreground tabular-nums">
                                            {fmtTime(appt.start_time)}
                                        </p>
                                        <span
                                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}
                                        >
                                            {cfg.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-6">
                    <Card className="border-0 bg-primary text-primary-foreground shadow-sm">
                        <CardContent className="p-5">
                            <h2 className="text-base font-semibold">
                                Quick actions
                            </h2>
                            <p className="text-xs opacity-80">
                                Register, book, or start a walk-in.
                            </p>
                            <div className="mt-4 flex flex-col gap-2">
                                <Button
                                    variant="ghost"
                                    className="justify-start gap-2 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                                    asChild
                                >
                                    <Link href={appointmentsCreate()}>
                                        <CalendarPlus className="h-4 w-4" />
                                        New appointment
                                    </Link>
                                </Button>
                                <Button
                                    className="justify-start gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                                    asChild
                                >
                                    <Link href={patientsCreate()}>
                                        <Plus className="h-4 w-4" />
                                        Register walk-in
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold">
                                Doctors on duty
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {displayDoctors.map((doctor) => (
                                <div
                                    key={doctor.id}
                                    className="flex items-center gap-3"
                                >
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarCls(doctor.name)}`}
                                    >
                                        {initials(doctor.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {doctor.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${DOCTOR_STATUS[doctor.status]}`}
                                    >
                                        {doctorStatusLabel(doctor.status)}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold">
                                This week
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {BREAKDOWN_ROWS.map((row) => {
                                const count = effectiveBreakdown[row.key] ?? 0;
                                const pct = Math.round((count / total) * 100);

                                return (
                                    <div key={row.key} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {row.label}
                                            </span>
                                            <span className="font-semibold text-foreground tabular-nums">
                                                {count}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${row.color}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
