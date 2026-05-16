import { Head, router } from '@inertiajs/react';
import { CalendarDays, Clock, UserRound } from 'lucide-react';
import { STATUS_CONFIG, StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { show as appointmentsShow } from '@/routes/appointments';
import type { ScheduleIndexProps } from '@/types';

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
                                    {Object.entries(STATUS_CONFIG).map(([status, { label, className }]) => {
                                        const count = appointments.filter((a) => a.status === status).length;

                                        if (count === 0) {
return null;
}

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
                <StatusBadge status={appt.status} />
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
