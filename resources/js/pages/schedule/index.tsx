import { Head, router } from '@inertiajs/react';
import { CalendarDays, Clock, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { show as appointmentsShow } from '@/routes/appointments';
import type { AppointmentStatus, ScheduleIndexProps } from '@/types';

const STATUS_STYLES: Record<AppointmentStatus, { label: string; className: string }> = {
    pending:         { label: 'Pending',     className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    confirmed:       { label: 'Confirmed',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    in_queue:        { label: 'In Queue',    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    in_progress:     { label: 'In Progress', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    completed:       { label: 'Completed',   className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    needs_follow_up: { label: 'Follow-up',   className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    cancelled:       { label: 'Cancelled',   className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    no_show:         { label: 'No Show',     className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
};

function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function Index({ appointments, dateLabel }: ScheduleIndexProps) {
    const active = appointments.filter((a) => !['cancelled', 'no_show', 'completed'].includes(a.status));
    const done = appointments.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status));

    return (
        <>
            <Head title="Today's Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Today's Schedule</h1>
                        <p className="text-sm text-muted-foreground">{dateLabel}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                        <CalendarDays className="h-4 w-4" />
                        {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                    </Badge>
                </div>

                {appointments.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                            <div className="rounded-full bg-muted p-4">
                                <CalendarDays className="h-6 w-6 opacity-50" />
                            </div>
                            <p className="text-sm font-medium">No appointments scheduled for today</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-3">
                            {active.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                                        Active · {active.length}
                                    </p>
                                    {active.map((appt) => (
                                        <AppointmentCard key={appt.id} appointment={appt} />
                                    ))}
                                </div>
                            )}

                            {done.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 pt-2">
                                        Done · {done.length}
                                    </p>
                                    {done.map((appt) => (
                                        <AppointmentCard key={appt.id} appointment={appt} dimmed />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 pt-0">
                                    {Object.entries(STATUS_STYLES).map(([status, { label, className }]) => {
                                        const count = appointments.filter((a) => a.status === status).length;
                                        if (count === 0) return null;
                                        return (
                                            <div key={status} className="flex items-center justify-between text-sm">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{label}</span>
                                                <span className="font-semibold tabular-nums">{count}</span>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function AppointmentCard({ appointment: appt, dimmed = false }: { appointment: ScheduleIndexProps['appointments'][number]; dimmed?: boolean }) {
    const style = STATUS_STYLES[appt.status] ?? STATUS_STYLES.pending;

    return (
        <button
            type="button"
            onClick={() => router.get(appointmentsShow(appt.id))}
            className={`w-full text-left rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40 ${dimmed ? 'opacity-60' : ''}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight text-foreground">
                            {appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {appt.service?.name ?? '—'}
                            {appt.dentist?.user?.name && ` · Dr. ${appt.dentist.user.name}`}
                        </p>
                    </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.className}`}>
                    {style.label}
                </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
            </div>
        </button>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: "Today's Schedule", href: '/schedule' }]}>
        {page}
    </AppLayout>
);
