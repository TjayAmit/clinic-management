import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Clock,
    Hash,
    UserPlus,
    UserRound,
} from 'lucide-react';
import { QuickActions } from '@/components/quick-actions';
import { STATUS_CONFIG, StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function Index({ appointments, date, dateLabel }: ScheduleIndexProps) {
    const active = appointments.filter((a) => !['cancelled', 'no_show', 'completed'].includes(a.status));
    const done = appointments.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status));

    const walkInUrl = create.url({ query: { walk_in: '1' } });

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

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Appointment list — 2/3 width at lg */}
                    <div className="space-y-4 lg:col-span-2">
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
                            <>
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
                            </>
                        )}
                    </div>

                    {/* Sidebar — 1/3 width at lg */}
                    <div className="mt-6 lg:mt-0">
                        <QuickActions />
                    </div>
                </div>
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
