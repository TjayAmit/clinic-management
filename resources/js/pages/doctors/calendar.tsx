import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { show as appointmentsShow } from '@/routes/appointments';
import { index as doctors, show as doctorsShow } from '@/routes/doctors';
import type { AppointmentStatus, DoctorCalendarProps } from '@/types';

const STATUS_DOT: Record<AppointmentStatus, string> = {
    pending:         'bg-slate-400',
    confirmed:       'bg-blue-500',
    in_queue:        'bg-amber-500',
    in_progress:     'bg-purple-500',
    completed:       'bg-emerald-500',
    needs_follow_up: 'bg-orange-500',
    cancelled:       'bg-red-400',
    no_show:         'bg-slate-300',
};

const STATUS_PILL: Record<AppointmentStatus, string> = {
    pending:         'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    confirmed:       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    in_queue:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    in_progress:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    completed:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    needs_follow_up: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    no_show:         'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
    pending: 'Pending', confirmed: 'Confirmed', in_queue: 'In Queue', in_progress: 'In Progress',
    completed: 'Completed', needs_follow_up: 'Follow-up', cancelled: 'Cancelled', no_show: 'No Show',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

export default function Calendar({
    doctor,
    appointments,
    month,
    monthLabel,
    year,
    daysInMonth,
    startDay,
}: DoctorCalendarProps) {
    const today = new Date().toISOString().slice(0, 10);
    const [selectedDay, setSelectedDay] = useState<string | null>(() => {
        if (appointments[today]) return today;
        const first = Object.keys(appointments).sort()[0];
        return first ?? null;
    });

    const navigateMonth = (direction: 'prev' | 'next') => {
        const [y, m] = month.split('-').map(Number);
        const d = new Date(y, m - 1 + (direction === 'next' ? 1 : -1));
        const newMonth = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
        router.get(`/doctors/${doctor.id}/calendar`, { month: newMonth }, { preserveState: false });
    };

    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const selectedAppts = selectedDay ? (appointments[selectedDay] ?? []) : [];

    return (
        <>
            <Head title={`${doctor.user?.name ?? 'Doctor'} — Calendar`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">
                            {doctor.user?.name ?? 'Doctor'}'s Calendar
                        </h1>
                        <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={doctorsShow(doctor.id)}>View Profile</Link>
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Calendar grid */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">{monthLabel}</CardTitle>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => navigateMonth('prev')}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => navigateMonth('next')}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {/* Day headers */}
                                <div className="grid grid-cols-7 mb-2">
                                    {DAY_NAMES.map((d) => (
                                        <div key={d} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Day cells */}
                                <div className="grid grid-cols-7 gap-1">
                                    {cells.map((day, i) => {
                                        if (day === null) {
                                            return <div key={`empty-${i}`} />;
                                        }
                                        const dateKey = `${month}-${pad2(day)}`;
                                        const dayAppts = appointments[dateKey] ?? [];
                                        const isToday = dateKey === today;
                                        const isSelected = dateKey === selectedDay;

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => setSelectedDay(dateKey)}
                                                className={`
                                                    relative flex min-h-[56px] flex-col rounded-lg p-1.5 text-left transition-colors
                                                    ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted/60'}
                                                `}
                                            >
                                                <span className={`text-xs font-semibold leading-none ${isSelected ? 'text-primary-foreground' : isToday ? 'text-primary' : 'text-foreground'}`}>
                                                    {day}
                                                </span>
                                                {dayAppts.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-0.5">
                                                        {dayAppts.slice(0, 3).map((a) => (
                                                            <span
                                                                key={a.id}
                                                                className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary-foreground/70' : STATUS_DOT[a.status] ?? 'bg-slate-400'}`}
                                                            />
                                                        ))}
                                                        {dayAppts.length > 3 && (
                                                            <span className={`text-[9px] font-bold leading-none ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                                +{dayAppts.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Selected day panel */}
                    <div>
                        <Card className="sticky top-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">
                                    {selectedDay
                                        ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                        : 'Select a day'}
                                </CardTitle>
                                {selectedAppts.length > 0 && (
                                    <p className="text-xs text-muted-foreground">{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''}</p>
                                )}
                            </CardHeader>
                            <CardContent className="pt-0">
                                {selectedAppts.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-muted-foreground">No appointments</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedAppts.map((appt) => (
                                            <button
                                                key={appt.id}
                                                type="button"
                                                onClick={() => router.get(appointmentsShow(appt.id))}
                                                className="w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium leading-tight text-foreground">
                                                        {appt.patient?.full_name ?? `${appt.patient?.first_name} ${appt.patient?.last_name}`}
                                                    </p>
                                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_PILL[appt.status] ?? ''}`}>
                                                        {STATUS_LABELS[appt.status] ?? appt.status}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground">{appt.service?.name ?? '—'}</p>
                                                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(appt.start_time)} – {formatTime(appt.end_time)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Calendar.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Doctors', href: doctors() }, { title: 'Calendar', href: '#' }]}>
        {page}
    </AppLayout>
);
