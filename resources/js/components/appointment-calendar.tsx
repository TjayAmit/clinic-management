import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DayAvailability {
    is_full: boolean;
    free_minutes: number;
    appointment_count: number;
}

interface FreeRange {
    from: string;
    to: string;
}

interface DayDetail {
    date: string;
    date_label: string;
    is_full: boolean;
    free_ranges: { morning: FreeRange[]; afternoon: FreeRange[] };
    summary: { total_minutes: number; booked_minutes: number; free_minutes: number };
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

interface AppointmentCalendarProps {
    selectedDate?: string;
    onDateSelect?: (date: string) => void;
}

export function AppointmentCalendar({ selectedDate: controlledDate, onDateSelect }: AppointmentCalendarProps = {}) {
    const today = new Date();
    const [year, setYear]     = useState(today.getFullYear());
    const [month, setMonth]   = useState(today.getMonth()); // 0-indexed
    const [internalDate, setInternalDate] = useState<string>(today.toISOString().slice(0, 10));

    const selectedDate = controlledDate ?? internalDate;

    const [monthData, setMonthData]   = useState<Record<string, DayAvailability>>({});
    const [dayDetail, setDayDetail]   = useState<DayDetail | null>(null);
    const [loadingMonth, setLoadingMonth] = useState(false);
    const [loadingDay, setLoadingDay]     = useState(false);

    const monthKey     = `${year}-${pad2(month + 1)}`;
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const startOffset  = new Date(year, month, 1).getDay(); // 0 = Sunday

    // Fetch monthly dot data whenever the visible month changes
    useEffect(() => {
        setLoadingMonth(true);
        fetch(`/appointments/availability?month=${monthKey}`)
            .then((r) => r.json())
            .then((json) => setMonthData(json.days ?? {}))
            .catch(() => {})
            .finally(() => setLoadingMonth(false));
    }, [monthKey]);

    // Fetch slot detail when a date is selected
    useEffect(() => {
        if (!selectedDate) {
return;
}

        setLoadingDay(true);
        fetch(`/appointments/availability?date=${selectedDate}`)
            .then((r) => r.json())
            .then((json) => setDayDetail(json))
            .catch(() => {})
            .finally(() => setLoadingDay(false));
    }, [selectedDate]);

    const navigateMonth = (dir: 'prev' | 'next') => {
        const d = new Date(year, month + (dir === 'next' ? 1 : -1));
        setYear(d.getFullYear());
        setMonth(d.getMonth());
    };

    const todayStr    = today.toISOString().slice(0, 10);
    const cells: (number | null)[] = [
        ...Array<null>(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const morningRanges   = dayDetail?.free_ranges.morning   ?? [];
    const afternoonRanges = dayDetail?.free_ranges.afternoon ?? [];
    const availableCount  = morningRanges.length + afternoonRanges.length;

    const selectedLabel = selectedDate
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: 'numeric',
          })
        : '';

    return (
        <Card className="shadow-sm">
            <CardHeader className="px-4 pb-0 pt-4">
                {/* Month navigation */}
                <div className="mb-3 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigateMonth('prev')}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-foreground">
                        {MONTHS[month]} {year}
                    </span>
                    <button
                        type="button"
                        onClick={() => navigateMonth('next')}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Day-of-week headers */}
                <div className="grid grid-cols-7">
                    {DAY_ABBR.map((d) => (
                        <div key={d} className="py-1 text-center text-[10px] font-medium text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
                {/* Calendar grid */}
                <div className={`grid grid-cols-7 gap-y-0.5 mb-4 ${loadingMonth ? 'opacity-50' : ''}`}>
                    {cells.map((day, i) => {
                        if (day === null) {
return <div key={`e-${i}`} />;
}

                        const dateKey    = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                        const avail      = monthData[dateKey];
                        const isToday    = dateKey === todayStr;
                        const isSelected = dateKey === selectedDate;
                        const isPast     = dateKey < todayStr;

                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => { setInternalDate(dateKey); onDateSelect?.(dateKey); }}
                                className={[
                                    'relative flex flex-col items-center justify-center rounded-md py-1 transition-colors',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : isToday
                                        ? 'bg-muted font-semibold'
                                        : 'hover:bg-muted/60',
                                    isPast ? 'opacity-40' : '',
                                ].join(' ')}
                            >
                                <span className={`text-xs leading-none ${isSelected ? 'text-primary-foreground' : isToday ? 'text-primary font-semibold' : 'text-foreground'}`}>
                                    {day}
                                </span>
                                {avail && !isPast && (
                                    <span
                                        className={[
                                            'mt-0.5 h-1 w-1 rounded-full',
                                            avail.is_full ? 'bg-red-500' : 'bg-emerald-500',
                                            isSelected ? 'opacity-70' : '',
                                        ].join(' ')}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mb-4 flex items-center gap-4 border-b border-border pb-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Selected
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Open Slots
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Full
                    </span>
                </div>

                {/* Selected date detail */}
                {selectedDate && (
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-semibold text-foreground">
                                Selected{' '}
                                <span className="text-primary">{selectedLabel}</span>
                            </span>
                        </div>

                        {loadingDay ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                                Loading slots…
                            </div>
                        ) : dayDetail ? (
                            <>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {availableCount} Slot{availableCount !== 1 ? 's' : ''} Available
                                </p>

                                {dayDetail.is_full ? (
                                    <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                        Fully booked — no available slots
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {morningRanges.length > 0 && (
                                            <div>
                                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Morning
                                                </p>
                                                <div className="space-y-1">
                                                    {morningRanges.map((r) => (
                                                        <div
                                                            key={`m-${r.from}`}
                                                            className="rounded-md bg-emerald-50 px-2 py-1.5 text-center text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                        >
                                                            {r.from} – {r.to}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {afternoonRanges.length > 0 && (
                                            <div>
                                                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                    Afternoon
                                                </p>
                                                <div className="space-y-1">
                                                    {afternoonRanges.map((r) => (
                                                        <div
                                                            key={`a-${r.from}`}
                                                            className="rounded-md bg-emerald-50 px-2 py-1.5 text-center text-xs font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                        >
                                                            {r.from} – {r.to}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
