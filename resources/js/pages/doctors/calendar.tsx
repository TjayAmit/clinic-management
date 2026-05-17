import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { show as appointmentsShow } from '@/routes/appointments';
import { index as doctors, show as doctorsShow } from '@/routes/doctors';
import type { Appointment, AppointmentStatus, DoctorCalendarProps } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_BAR: Record<AppointmentStatus, string> = {
    pending:         'bg-slate-400',
    confirmed:       'bg-orange-500',
    in_queue:        'bg-amber-400',
    in_progress:     'bg-purple-500',
    completed:       'bg-emerald-500',
    needs_follow_up: 'bg-orange-400',
    cancelled:       'bg-red-500',
    no_show:         'bg-slate-500',
};

const STATUS_CELL_TEXT: Record<AppointmentStatus, string> = {
    pending:         'text-slate-300',
    confirmed:       'text-orange-300',
    in_queue:        'text-amber-300',
    in_progress:     'text-purple-300',
    completed:       'text-emerald-300',
    needs_follow_up: 'text-orange-300',
    cancelled:       'text-red-400',
    no_show:         'text-slate-400',
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
    pending:         'Pending',
    confirmed:       'Confirmed',
    in_queue:        'In Queue',
    in_progress:     'In Progress',
    completed:       'Completed',
    needs_follow_up: 'Follow-up',
    cancelled:       'Cancelled',
    no_show:         'No Show',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const YEAR_RANGE = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad2(n: number) {
 return String(n).padStart(2, '0'); 
}

function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';

    return `${h % 12 || 12}:${pad2(m)} ${suffix}`;
}

function durationMinutes(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    return (eh * 60 + em) - (sh * 60 + sm);
}

function formatDuration(mins: number): string {
    if (mins < 60) {
return `${mins} min`;
}

    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function patientName(appt: Appointment): string {
    if (appt.is_walk_in && appt.walk_in_name) {
return appt.walk_in_name;
}

    const fallback = `${appt.patient?.first_name ?? ''} ${appt.patient?.last_name ?? ''}`.trim();

    return appt.patient?.full_name ?? (fallback || 'Walk-in');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
            {children}
        </button>
    );
}

function AppointmentBadge({ appt, isSelected }: { appt: Appointment; isSelected: boolean }) {
    const name = patientName(appt);

    return (
        <div className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight truncate ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_BAR[appt.status]}`} />
            <span className={`truncate font-medium ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {name}
            </span>
        </div>
    );
}

function ScheduleCard({ appt }: { appt: Appointment }) {
    const dur = durationMinutes(appt.start_time, appt.end_time);
    const name = patientName(appt);

    return (
        <button
            type="button"
            onClick={() => router.get(appointmentsShow(appt.id))}
            className="w-full text-left"
        >
            <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent">
                <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${STATUS_BAR[appt.status]}`} />

                <div className="pl-3">
                    <p className="text-sm font-semibold text-foreground leading-tight">{name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{appt.service?.name ?? '—'}</p>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(appt.start_time)} – {formatTime(appt.end_time)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDuration(dur)}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {appt.is_walk_in ? 'Walk-in' : (appt.patient?.full_name ?? name)}
                        </span>
                        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${STATUS_BAR[appt.status]}`}>
                            {STATUS_LABELS[appt.status]}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Calendar({
    doctor,
    appointments,
    schedules,
    month,
    daysInMonth,
    startDay,
}: Omit<DoctorCalendarProps, 'year' | 'monthLabel'> & { year?: number; monthLabel?: string }) {
    const today = new Date().toISOString().slice(0, 10);

    const [selectedDay, setSelectedDay] = useState<string | null>(() => {
        if (appointments[today]) {
return today;
}

        return Object.keys(appointments).sort()[0] ?? null;
    });

    const [y, m] = month.split('-').map(Number);
    const monthName = MONTHS[m - 1];

    const navigateMonth = (dir: 'prev' | 'next') => {
        const d = new Date(y, m - 1 + (dir === 'next' ? 1 : -1));
        const nm = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
        router.get(`/doctors/${doctor.id}/calendar`, { month: nm }, { preserveState: false });
    };

    const navigateDay = (dir: 'prev' | 'next') => {
        if (!selectedDay) {
return;
}

        const d = new Date(selectedDay + 'T00:00:00');
        d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
        const key = d.toISOString().slice(0, 10);

        if (d.getMonth() + 1 !== m) {
            navigateMonth(dir);
        } else {
            setSelectedDay(key);
        }
    };

    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const selectedAppts = selectedDay ? (appointments[selectedDay] ?? []) : [];

    const selectedDateLabel = selectedDay
        ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        : 'Select a day';

    return (
        <>
            <Head title={`${doctor.user?.name ?? 'Doctor'} — Calendar`} />

            <div className="flex h-full flex-1 flex-col gap-0 bg-background p-0">
                {/* ── Page header ── */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h1 className="text-base font-semibold text-foreground">
                            {doctor.user?.name ?? 'Doctor'}'s Calendar
                        </h1>
                        <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                    </div>
                </div>

                {/* ── Two-column layout ── */}
                <div className="flex flex-1 overflow-hidden">
                    {/* ─── Calendar ─────────────────────────────────── */}
                    <div className="flex flex-1 flex-col overflow-auto p-6">
                        {/* Month nav with dropdowns */}
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <select
                                    value={m - 1}
                                    onChange={(e) => {
                                        const nm = `${y}-${pad2(Number(e.target.value) + 1)}`;
                                        router.get(`/doctors/${doctor.id}/calendar`, { month: nm }, { preserveState: false });
                                    }}
                                    className="rounded-md border border-border bg-card px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {MONTHS.map((name, idx) => (
                                        <option key={name} value={idx}>{name}</option>
                                    ))}
                                </select>
                                <select
                                    value={y}
                                    onChange={(e) => {
                                        const nm = `${e.target.value}-${pad2(m)}`;
                                        router.get(`/doctors/${doctor.id}/calendar`, { month: nm }, { preserveState: false });
                                    }}
                                    className="rounded-md border border-border bg-card px-2 py-1 text-sm font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {YEAR_RANGE.map((yr) => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <NavButton onClick={() => navigateMonth('prev')}>
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </NavButton>
                                <NavButton onClick={() => navigateMonth('next')}>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </NavButton>
                            </div>
                        </div>

                        {/* Day headers — full names */}
                        <div className="mb-2 grid grid-cols-7">
                            {DAY_NAMES.map((d) => (
                                <div key={d} className="py-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day grid */}
                        <div className="grid grid-cols-7 gap-1.5">
                            {cells.map((day, i) => {
                                if (day === null) {
return <div key={`e-${i}`} />;
}

                                const dateKey = `${month}-${pad2(day)}`;
                                const dayAppts = appointments[dateKey] ?? [];
                                const daySchedules = schedules[dateKey] ?? [];
                                const isToday = dateKey === today;
                                const isSelected = dateKey === selectedDay;

                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => setSelectedDay(dateKey)}
                                        className={[
                                            'relative flex min-h-[100px] flex-col rounded-xl p-2 text-left transition-all',
                                            isSelected
                                                ? 'bg-primary/15 ring-1 ring-primary/50'
                                                : isToday
                                                    ? 'bg-muted ring-1 ring-primary/30'
                                                    : 'bg-card border border-border hover:bg-accent/50',
                                        ].join(' ')}
                                    >
                                        <span className={[
                                            'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                                            isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'text-primary' : 'text-foreground',
                                        ].join(' ')}>
                                            {day}
                                        </span>

                                        <div className="flex flex-col gap-0.5 w-full">
                                            {dayAppts.slice(0, 2).map((a) => (
                                                <AppointmentBadge key={a.id} appt={a} isSelected={isSelected} />
                                            ))}
                                            {dayAppts.length > 2 && (
                                                <span className="pl-1 text-[10px] text-muted-foreground">
                                                    +{dayAppts.length - 2} more
                                                </span>
                                            )}
                                            {daySchedules.length > 0 && (
                                                <div className={`mt-0.5 flex items-center gap-1 rounded-md   px-1 py-0.5 text-[10px] leading-tight ${isSelected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-emerald-50 text-emerald-700'}`}>
                                                    <Clock className="h-2.5 w-2.5 shrink-0" />
                                                    <span className="truncate font-medium">
                                                        {formatTime(daySchedules[0].start_time)} – {formatTime(daySchedules[0].end_time)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── Schedule panel ───────────────────────────── */}
                    <div className="w-72 shrink-0 border-l border-border bg-card flex flex-col xl:w-80">
                        {/* Panel header */}
                        <div className="border-b border-border px-5 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Scheduled</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">{selectedDateLabel}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-primary">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                    </div>
                                    <NavButton onClick={() => navigateDay('prev')}>
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </NavButton>
                                    <NavButton onClick={() => navigateDay('next')}>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </NavButton>
                                </div>
                            </div>
                        </div>

                        {/* Appointment list */}
                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            {selectedAppts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">No appointments</p>
                                    <p className="mt-1 text-xs text-muted-foreground/60">Select another day</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedAppts.map((appt, idx) => {
                                        const prevAppt = selectedAppts[idx - 1];
                                        const showTime = idx === 0 || (prevAppt && appt.start_time.slice(0, 2) !== prevAppt.start_time.slice(0, 2));

                                        return (
                                            <div key={appt.id}>
                                                {showTime && (
                                                    <p className="mb-2 mt-1 text-xs font-medium text-muted-foreground">
                                                        {formatTime(appt.start_time)}
                                                    </p>
                                                )}
                                                <ScheduleCard appt={appt} />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer count */}
                        {selectedAppts.length > 0 && (
                            <div className="border-t border-border px-5 py-3">
                                <p className="text-xs text-muted-foreground">
                                    {selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''} scheduled
                                </p>
                            </div>
                        )}
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
