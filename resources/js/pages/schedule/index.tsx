import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
    Hash,
    PlusCircle,
    UserPlus,
    UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { STATUS_CONFIG, StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { create, show as appointmentsShow } from '@/routes/appointments';
import type { AppointmentStatus, ScheduleIndexProps } from '@/types';

// Status border colours for active appointment cards
const STATUS_BORDER: Record<AppointmentStatus, string> = {
    pending: 'border-l-slate-400',
    confirmed: 'border-l-blue-500',
    in_queue: 'border-l-amber-500',
    in_progress: 'border-l-purple-500',
    completed: 'border-l-emerald-500',
    needs_follow_up: 'border-l-orange-500',
    cancelled: 'border-l-red-400',
    no_show: 'border-l-slate-300',
};


function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;

    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

interface DoctorAvailability {
    doctor_id: number;
    doctor_name: string;
    specialization: string | null;
    available_from: string | null;
    available_until: string | null;
    is_available_today: boolean;
}

export default function Index({ appointments, date, dateLabel }: ScheduleIndexProps) {
    const active = appointments.filter((a) => !['cancelled', 'no_show', 'completed'].includes(a.status));
    const done = appointments.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status));

    const [doctors, setDoctors] = useState<DoctorAvailability[] | null>(null);

    useEffect(() => {
        fetch('/doctors/availability')
            .then((r) => r.json())
            .then((json) => {
                setDoctors(json.data ?? []);
            })
            .catch(() => {
                // silently ignore; availability is non-critical
            });
    }, []);

    const walkInUrl = create.url({ query: { walk_in: '1' } });
    const newApptUrl = create.url();

    return (
        <>
            <Head title="Today's Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Today's Schedule</h1>
                        <p className="text-sm text-muted-foreground">{dateLabel}</p>
                        {appointments.length > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                {Object.entries(STATUS_CONFIG).map(([status, { label, className }]) => {
                                    const count = appointments.filter((a) => a.status === status).length;

                                    if (count === 0) {
return null;
}

                                    return (
                                        <span
                                            key={status}
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
                                        >
                                            {label}
                                            <span className="tabular-nums font-semibold">{count}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Empty state */}
                {appointments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
                            <div className="rounded-full bg-muted p-4">
                                <CalendarDays className="h-6 w-6 opacity-50" />
                            </div>
                            <p className="text-sm font-medium">No appointments scheduled for today</p>
                            <Button asChild variant="outline" size="sm">
                                <Link href={walkInUrl}>
                                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                                    Add Walk-in
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Appointment list — 2/3 width at lg */}
                        <div className="space-y-4 lg:col-span-2">
                            {active.length > 0 && (
                                <section className="space-y-2">
                                    <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Active · {active.length}
                                    </p>
                                    {active.map((appt) => (
                                        <AppointmentCard key={appt.id} appointment={appt} />
                                    ))}
                                </section>
                            )}

                            {active.length > 0 && done.length > 0 && <Separator />}

                            {done.length > 0 && (
                                <section className="space-y-2">
                                    <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Done · {done.length}
                                    </p>
                                    {done.map((appt) => (
                                        <AppointmentCard key={appt.id} appointment={appt} dimmed />
                                    ))}
                                </section>
                            )}
                        </div>

                        {/* Sidebar — 1/3 width at lg */}
                        <div className="mt-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Quick Actions
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Schedule a new appointment or add a walk-in patient for today.
                                    </p>
                                </CardHeader>

                                {doctors && (
                                    <CardContent className="space-y-3 border-b border-border pb-4 pt-0">
                                        {/* Section header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <span className="text-xs font-semibold text-foreground">
                                                    Doctor Availability
                                                </span>
                                            </div>
                                            <span
                                                className={[
                                                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                                    doctors.some((d) => d.is_available_today)
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700',
                                                ].join(' ')}
                                            >
                                                {doctors.some((d) => d.is_available_today) ? (
                                                    <>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Open
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Full Schedule
                                                    </>
                                                )}
                                            </span>
                                        </div>

                                        {/* Doctor rows */}
                                        <div className="space-y-1.5">
                                            {doctors.map((d) => (
                                                <div
                                                    key={d.doctor_id}
                                                    className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
                                                >
                                                    <div className="h-2 w-2 shrink-0 rounded-full">
                                                        {d.is_available_today ? (
                                                            <span className="block h-2 w-2 rounded-full bg-emerald-500" />
                                                        ) : (
                                                            <span className="block h-2 w-2 rounded-full bg-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {d.doctor_name}
                                                        </p>
                                                        {d.specialization && (
                                                            <p className="truncate text-[11px] text-muted-foreground">
                                                                {d.specialization}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {d.is_available_today && d.available_from && d.available_until ? (
                                                        <span className="shrink-0 text-xs font-medium tabular-nums text-emerald-700">
                                                            {formatTime(d.available_from)} – {formatTime(d.available_until)}
                                                        </span>
                                                    ) : d.available_from === null && d.available_until === null ? (
                                                        <span className="shrink-0 text-xs font-medium text-slate-500">
                                                            Off Today
                                                        </span>
                                                    ) : (
                                                        <span className="shrink-0 text-xs font-medium text-amber-700">
                                                            Fully Scheduled
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                )}

                                <CardContent className="space-y-2 pt-3">
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <Link href={newApptUrl}>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            New Appointment
                                        </Link>
                                    </Button>
                                    <Button className="w-full justify-start" asChild>
                                        <Link href={walkInUrl}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Walk-in
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

type AppointmentCardProps = {
    appointment: ScheduleIndexProps['appointments'][number];
    dimmed?: boolean;
};

function AppointmentCard({ appointment: appt, dimmed = false }: AppointmentCardProps) {
    const borderClass = dimmed ? 'border-l-border' : (STATUS_BORDER[appt.status] ?? 'border-l-border');
    const patientName = appt.patient?.full_name
        ?? (appt.patient ? `${appt.patient.first_name} ${appt.patient.last_name}` : 'Unknown patient');

    return (
        <button
            type="button"
            onClick={() => router.get(appointmentsShow(appt.id))}
            className={[
                'w-full text-left rounded-xl border border-border border-l-4 bg-card px-4 py-3 shadow-sm',
                'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                borderClass,
                dimmed ? 'opacity-60' : '',
            ].join(' ')}
        >
            {/* Time + status row */}
            <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatTime(appt.start_time)}
                    <span className="font-normal text-muted-foreground">–</span>
                    {formatTime(appt.end_time)}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {!dimmed && appt.queue?.position != null && (
                        <span className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            {appt.queue.position}
                        </span>
                    )}
                    <StatusBadge status={appt.status} />
                </div>
            </div>

            {/* Patient + service row */}
            <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight text-foreground">
                        {patientName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                        {appt.service?.name ?? '—'}
                        {appt.dentist?.user?.name && ` · Dr. ${appt.dentist.user.name}`}
                    </p>
                </div>
                {appt.is_walk_in && (
                    <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                        Walk-in
                    </Badge>
                )}
            </div>
        </button>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: "Today's Schedule", href: '/schedule' }]}>
        {page}
    </AppLayout>
);
