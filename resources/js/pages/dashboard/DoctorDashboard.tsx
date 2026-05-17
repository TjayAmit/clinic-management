import { Link, router } from '@inertiajs/react';
import {
    Calendar,
    CalendarDays,
    ChevronRight,
    ClipboardList,
    Clock,
    ExternalLink,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { show as appointmentsShow } from '@/routes/appointments';
import { index as dentalRecordsRoute } from '@/routes/dental-records';
import type { Auth, DashboardAppointmentItem, DashboardProps } from '@/types';
import {
    DUMMY_STATS_DOCTOR,
    DUMMY_TODAY,
    STATUS_CFG,
    StatCard,
    avatarCls,
    fmtTime,
    greeting,
    initials,
} from './_shared';

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Max appointments considered "full load" for the bar indicator
const MAX_LOAD = 8;

// Status left-border colours — matches schedule page convention
const STATUS_BORDER: Record<string, string> = {
    pending: 'border-l-slate-400',
    confirmed: 'border-l-blue-500',
    in_queue: 'border-l-amber-500',
    in_progress: 'border-l-purple-500',
    completed: 'border-l-emerald-500',
    needs_follow_up: 'border-l-orange-500',
    cancelled: 'border-l-red-400',
    no_show: 'border-l-slate-300',
};

// Load bar colour: green → amber → rose based on appointment count
function loadBarCls(count: number): string {
    if (count === 0) {
        return '';
    }

    if (count <= 3) {
        return 'bg-emerald-400';
    }

    if (count <= 6) {
        return 'bg-amber-400';
    }

    return 'bg-rose-400';
}

function buildWeekDays(): string[] {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);

        return d.toISOString().slice(0, 10);
    });
}

function formatDayLabel(dateKey: string) {
    return new Date(dateKey + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
}

const DUMMY_RECORDS = [
    { id: 1, patient_id: 1, chief_complaint: 'Sensitivity on lower left molar', created_at: '', patient: { id: 1, first_name: 'Maria',    last_name: 'Santos',    full_name: 'Maria Santos'   } },
    { id: 2, patient_id: 2, chief_complaint: 'Gum bleeding when brushing',      created_at: '', patient: { id: 2, first_name: 'Jose',     last_name: 'Dela Cruz', full_name: 'Jose Dela Cruz' } },
    { id: 3, patient_id: 3, chief_complaint: 'Braces wire adjustment needed',   created_at: '', patient: { id: 3, first_name: 'Isabella', last_name: 'Reyes',     full_name: 'Isabella Reyes' } },
];

type Props = DashboardProps & { auth: Auth };

export default function DoctorDashboard({
    stats,
    todayAppointments,
    recentRecords,
    weekAppointments = {},
    doctorId,
    auth,
}: Props) {
    const today = new Date().toISOString().slice(0, 10);

    const displayStats   = stats.length > 0 ? stats : DUMMY_STATS_DOCTOR;
    const displayRecords = recentRecords.length > 0 ? recentRecords : DUMMY_RECORDS;

    // Merge server weekAppointments with dummy for empty state
    const hasRealData = Object.values(weekAppointments).some((a) => a.length > 0) || todayAppointments.length > 0;
    const dummyWeek: Record<string, DashboardAppointmentItem[]> = hasRealData ? {} : { [today]: DUMMY_TODAY };
    const effectiveWeek: Record<string, DashboardAppointmentItem[]> = hasRealData ? weekAppointments : dummyWeek;

    const weekDays = buildWeekDays();
    const [selectedDay, setSelectedDay] = useState<string>(today);

    const selectedAppts = effectiveWeek[selectedDay] ?? [];

    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-4 lg:p-8">
            {/* Greeting */}
            <div>
                <p className="text-sm text-muted-foreground">{dateLabel}</p>
                <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
                    {greeting()}, Dr. {firstName}
                </h1>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {displayStats.map((s, i) => (
                    <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} featured={i === 0} />
                ))}
            </div>

            {/* Quick Links - Horizontal without card background */}
            <div className="flex justify-between items-center gap-2">
                <span className="text-sm font-medium">Quick Actions</span>
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { href: '/schedule',            icon: <Calendar className="h-3.5 w-3.5" />,     label: "Today's Schedule" },
                        { href: '/appointments',        icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'All Appointments'  },
                        { href: dentalRecordsRoute(),   icon: <ClipboardList className="h-3.5 w-3.5" />,label: 'Dental Records'    },
                        { href: '/patients',            icon: <UserRound className="h-3.5 w-3.5" />,    label: 'Patients'          },
                        ...(doctorId ? [{ href: `/doctors/${doctorId}/calendar`, icon: <CalendarDays className="h-3.5 w-3.5" />, label: 'My Calendar' }] : []),
                    ].map(({ href, icon, label }) => (
                        <Link
                            key={label}
                            href={href}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            {icon}
                            {label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main grid — weekly calendar + sidebar */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Weekly Calendar */}
                <Card className="shadow-none lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold">This Week</CardTitle>
                                <p className="mt-0.5 text-xs text-muted-foreground">Your upcoming 7-day schedule</p>
                            </div>
                            {doctorId && (
                                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                                    <Link href={`/doctors/${doctorId}/calendar`}>
                                        <ExternalLink className="h-3 w-3" />
                                        Full Calendar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                        {/* 7-day strip */}
                        <div className="grid grid-cols-7 gap-1.5">
                            {weekDays.map((dateKey) => {
                                const d          = new Date(dateKey + 'T00:00:00');
                                const dayAppts   = effectiveWeek[dateKey] ?? [];
                                const count      = dayAppts.length;
                                const isToday    = dateKey === today;
                                const isSelected = dateKey === selectedDay;
                                const barWidth   = count > 0 ? Math.min(Math.round((count / MAX_LOAD) * 100), 100) : 0;

                                return (
                                    <button
                                        key={dateKey}
                                        type="button"
                                        onClick={() => setSelectedDay(dateKey)}
                                        className={[
                                            'group relative flex min-h-[90px] flex-col items-center overflow-hidden rounded-xl pb-0 pt-3 text-center transition-all duration-150',
                                            isSelected
                                                ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30'
                                                : isToday
                                                ? 'bg-primary/8 ring-1 ring-primary/30 hover:bg-primary/12'
                                                : 'hover:bg-muted/70',
                                        ].join(' ')}
                                    >
                                        {/* TODAY chip — only on today when not selected */}
                                        {isToday && !isSelected ? (
                                            <span className="mb-1 rounded-full bg-primary px-1.5 py-px text-[8px] font-bold uppercase tracking-widest text-primary-foreground">
                                                Today
                                            </span>
                                        ) : (
                                            <span
                                                className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                                            >
                                                {DAY_ABBR[d.getDay()]}
                                            </span>
                                        )}

                                        {/* Hero date number */}
                                        <span
                                            className={`text-xl font-bold leading-none tabular-nums ${isSelected ? 'text-primary-foreground' : isToday ? 'text-primary' : 'text-foreground'}`}
                                        >
                                            {d.getDate()}
                                        </span>

                                        {/* Appointment count badge */}
                                        {count > 0 ? (
                                            <span
                                                className={`mt-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none ${
                                                    isSelected
                                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        ) : (
                                            <span
                                                className={`mt-2 text-[10px] leading-none ${isSelected ? 'text-primary-foreground/30' : 'text-muted-foreground/30'}`}
                                            >
                                                —
                                            </span>
                                        )}

                                        {/* Load bar — pinned to bottom of cell */}
                                        <div className="mt-auto w-full px-2 pb-2 pt-2">
                                            <div className="h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                                                {count > 0 && (
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'bg-primary-foreground/50' : loadBarCls(count)}`}
                                                        style={{ width: `${barWidth}%` }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected day appointments */}
                        <div className="mt-5 border-t pt-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{formatDayLabel(selectedDay)}</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {selectedAppts.length === 0
                                            ? 'No appointments scheduled'
                                            : `${selectedAppts.length} appointment${selectedAppts.length !== 1 ? 's' : ''}`}
                                    </p>
                                </div>
                                {selectedDay === today && (
                                    <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                                        <Link href="/schedule">
                                            View schedule <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </Button>
                                )}
                            </div>

                            {selectedAppts.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 py-10 text-muted-foreground">
                                    <CalendarDays className="h-7 w-7 opacity-20" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Rest day</p>
                                        <p className="mt-0.5 text-xs text-muted-foreground/60">No appointments on this day</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedAppts.map((appt) => {
                                        const cfg        = STATUS_CFG[appt.status] ?? STATUS_CFG.pending;
                                        const borderCls  = STATUS_BORDER[appt.status] ?? 'border-l-border';
                                        const name       = appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`;

                                        return (
                                            <button
                                                key={appt.id}
                                                type="button"
                                                onClick={() => router.get(appointmentsShow(appt.id))}
                                                className={[
                                                    'w-full rounded-xl border border-border border-l-4 bg-card px-4 py-3 text-left',
                                                    'shadow-sm transition-colors hover:bg-muted/40',
                                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                    borderCls,
                                                ].join(' ')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(name)}`}
                                                    >
                                                        {initials(name)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-foreground">{name}</p>
                                                        <p className="truncate text-xs text-muted-foreground">{appt.service?.name ?? '—'}</p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-xs font-medium tabular-nums text-muted-foreground">
                                                            {fmtTime(appt.start_time)}
                                                        </p>
                                                        <span
                                                            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}
                                                        >
                                                            {cfg.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Today at a glance */}
                    <Card className="shadow-none">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold">Summary of Day</CardTitle>
                            {/* description */}
                            <CardDescription className="text-xs">Overview of your day, total appointments and status</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {(() => {
                                const todayAppts = effectiveWeek[today] ?? todayAppointments;
                                const done   = todayAppts.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status)).length;
                                const active = todayAppts.filter((a) => a.status === 'in_progress').length;
                                const next   = todayAppts.find((a) => !['completed', 'cancelled', 'no_show', 'in_progress'].includes(a.status));

                                return (
                                    <div className="space-y-3">
                                        <div className="flex space-x-2">
                                            {/* Total Card */}
                                            <div className="flex-1 flex items-center justify-between rounded-lg border px-3 py-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</p>
                                                    <p className="text-lg font-bold tabular-nums">{todayAppts.length}</p>
                                                </div>
                                                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                            </div>

                                            {/* Completed Card */}
                                            <div className="flex-1 flex items-center justify-between rounded-lg border px-3 py-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
                                                    <p className="text-lg font-bold tabular-nums text-teal-600">{done}</p>
                                                </div>
                                                <div className="rounded-full bg-teal-100 p-1.5">
                                                    <ClipboardList className="h-4 w-4 text-teal-600" />
                                                </div>
                                            </div>

                                            {/* In Progress Card */}
                                            <div className="flex-1 flex items-center justify-between rounded-lg border px-3 py-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">In Progress</p>
                                                    <p className="text-lg font-bold tabular-nums text-violet-600">{active}</p>
                                                </div>
                                                <div className="rounded-full bg-violet-100 p-1.5">
                                                    <Clock className="h-4 w-4 text-violet-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {next && (
                                            <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Next up</p>
                                                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                                                        {next.patient?.full_name ?? `${next.patient?.first_name} ${next.patient?.last_name}`}
                                                    </p>
                                                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {fmtTime(next.start_time)}
                                                        <span className="text-muted-foreground/50">·</span>
                                                        {next.service?.name ?? '—'}
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex gap-2 pt-4">
                                                    <Button
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                        onClick={() => router.patch(`/appointments/${next.id}`, { status: 'in_queue' })}
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs"
                                                        onClick={() => router.patch(`/appointments/${next.id}`, { status: 'in_progress' })}
                                                    >
                                                        Check In
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>

                    {/* Recent Records */}
                    {displayRecords.length > 0 && (
                        <Card className="shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-sm font-semibold">Recent Records</CardTitle>
                                <Button variant="ghost" size="sm" className="h-7 gap-0.5 text-xs" asChild>
                                    <Link href={dentalRecordsRoute()}>
                                        View all <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <div className="divide-y">
                                {displayRecords.map((r) => (
                                    <div
                                        key={r.id}
                                        onClick={() => router.get(`${dentalRecordsRoute()}/${r.id}`)}
                                        className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/40"
                                    >
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(r.patient?.full_name)}`}>
                                            {initials(r.patient?.full_name)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{r.patient?.full_name ?? '—'}</p>
                                            <p className="truncate text-xs text-muted-foreground">{r.chief_complaint}</p>
                                        </div>
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

        </div>
    );
}
