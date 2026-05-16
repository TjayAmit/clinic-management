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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index as dentalRecordsRoute } from '@/routes/dental-records';
import { show as appointmentsShow } from '@/routes/appointments';
import type { Auth, DashboardAppointmentItem, DashboardProps } from '@/types';
import {
    DUMMY_STATS_DOCTOR,
    DUMMY_TODAY,
    STATUS_CFG,
    STATUS_DOT,
    STAT_ICONS,
    avatarCls,
    fmtTime,
    greeting,
    initials,
} from './_shared';

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
                        <div className="grid grid-cols-7 gap-1">
                            {weekDays.map((dateKey) => {
                                const d         = new Date(dateKey + 'T00:00:00');
                                const dayAppts  = effectiveWeek[dateKey] ?? [];
                                const isToday   = dateKey === today;
                                const isSelected = dateKey === selectedDay;

                                return (
                                    <button
                                        key={dateKey}
                                        type="button"
                                        onClick={() => setSelectedDay(dateKey)}
                                        className={[
                                            'flex min-h-[72px] flex-col items-center rounded-xl p-2 text-center transition-colors',
                                            isSelected
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : isToday
                                                ? 'bg-primary/10 ring-1 ring-primary/40'
                                                : 'hover:bg-muted/60',
                                        ].join(' ')}
                                    >
                                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {DAY_ABBR[d.getDay()]}
                                        </span>
                                        <span className={`mt-0.5 text-base font-bold leading-none ${isSelected ? 'text-primary-foreground' : isToday ? 'text-primary' : 'text-foreground'}`}>
                                            {d.getDate()}
                                        </span>
                                        {dayAppts.length > 0 ? (
                                            <div className="mt-1.5 flex flex-wrap justify-center gap-0.5">
                                                {dayAppts.slice(0, 3).map((a) => (
                                                    <span
                                                        key={a.id}
                                                        className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary-foreground/60' : (STATUS_DOT[a.status] ?? 'bg-slate-400')}`}
                                                    />
                                                ))}
                                                {dayAppts.length > 3 && (
                                                    <span className={`text-[9px] font-bold leading-none ${isSelected ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                                        +{dayAppts.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className={`mt-1.5 text-[9px] ${isSelected ? 'text-primary-foreground/40' : 'text-muted-foreground/40'}`}>
                                                —
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected day appointments */}
                        <div className="mt-4 border-t pt-4">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{formatDayLabel(selectedDay)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedAppts.length === 0
                                            ? 'No appointments'
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
                                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                                    <CalendarDays className="h-6 w-6 opacity-25" />
                                    <p className="text-sm">Free day</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedAppts.map((appt) => {
                                        const cfg  = STATUS_CFG[appt.status] ?? STATUS_CFG.pending;
                                        const name = appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`;

                                        return (
                                            <button
                                                key={appt.id}
                                                type="button"
                                                onClick={() => router.get(appointmentsShow(appt.id))}
                                                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarCls(name)}`}>
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
                                                        <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
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
                    {/* Quick Links */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0.5 pt-0">
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
                                    className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                >
                                    {icon}
                                    {label}
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Today at a glance */}
                    <Card className="shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">Today at a Glance</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {(() => {
                                const todayAppts = effectiveWeek[today] ?? todayAppointments;
                                const done   = todayAppts.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status)).length;
                                const active = todayAppts.filter((a) => a.status === 'in_progress').length;
                                const next   = todayAppts.find((a) => !['completed', 'cancelled', 'no_show', 'in_progress'].includes(a.status));

                                return (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Total today</span>
                                            <span className="font-semibold tabular-nums">{todayAppts.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Completed</span>
                                            <span className="font-semibold tabular-nums text-teal-600">{done}</span>
                                        </div>
                                        {active > 0 && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">In progress</span>
                                                <span className="font-semibold tabular-nums text-violet-600">{active}</span>
                                            </div>
                                        )}
                                        {next && (
                                            <div className="rounded-lg bg-muted/50 px-3 py-2">
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
                                        )}
                                    </div>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </div>

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
    );
}
