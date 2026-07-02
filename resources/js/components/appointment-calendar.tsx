import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    summary: {
        total_minutes: number;
        booked_minutes: number;
        free_minutes: number;
    };
}

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function fetchMonthAvailability(
    monthKey: string,
    setLoading: (v: boolean) => void,
    setData: (data: Record<string, DayAvailability>) => void,
) {
    setLoading(true);
    fetch(`/appointments/availability?month=${monthKey}`)
        .then((r) => r.json())
        .then((json) => setData(json.days ?? {}))
        .catch(() => setData({}))
        .finally(() => setLoading(false));
}

function fetchDayAvailability(
    date: string,
    setLoading: (v: boolean) => void,
    setDetail: (detail: DayDetail | null) => void,
) {
    setLoading(true);
    fetch(`/appointments/availability?date=${date}`)
        .then((r) => r.json())
        .then((json) => setDetail(json))
        .catch(() => setDetail(null))
        .finally(() => setLoading(false));
}

interface AppointmentCalendarProps {
    selectedDate?: string;
    selectedTime?: string;
    onDateSelect?: (date: string) => void;
    onTimeSelect?: (time: string) => void;
}

export function AppointmentCalendar({
    selectedDate: controlledDate,
    selectedTime,
    onDateSelect,
    onTimeSelect,
}: AppointmentCalendarProps = {}) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0-indexed
    const [internalDate, setInternalDate] = useState<string>(
        today.toISOString().slice(0, 10),
    );

    const selectedDate = controlledDate ?? internalDate;

    const [monthData, setMonthData] = useState<Record<string, DayAvailability>>(
        {},
    );
    const [dayDetail, setDayDetail] = useState<DayDetail | null>(null);
    const [loadingMonth, setLoadingMonth] = useState(false);
    const [loadingDay, setLoadingDay] = useState(false);

    const monthKey = `${year}-${pad2(month + 1)}`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay(); // 0 = Sunday

    useEffect(() => {
        fetchMonthAvailability(monthKey, setLoadingMonth, setMonthData);
    }, [monthKey]);

    useEffect(() => {
        if (!selectedDate) {
            return;
        }

        fetchDayAvailability(selectedDate, setLoadingDay, setDayDetail);
    }, [selectedDate]);

    const navigateMonth = (dir: 'prev' | 'next') => {
        const d = new Date(year, month + (dir === 'next' ? 1 : -1));
        setYear(d.getFullYear());
        setMonth(d.getMonth());
    };

    const todayStr = today.toISOString().slice(0, 10);
    const cells: (number | null)[] = [
        ...Array<null>(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const morningRanges = dayDetail?.free_ranges.morning ?? [];
    const afternoonRanges = dayDetail?.free_ranges.afternoon ?? [];
    const allSlots = dayDetail
        ? [...morningRanges, ...afternoonRanges].sort((a, b) =>
              a.from.localeCompare(b.from),
          )
        : [];

    const selectedLabel = selectedDate
        ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '';

    const slotsLabel = selectedDate
        ? new Date(selectedDate + 'T00:00:00')
              .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              .toUpperCase()
        : '';

    return (
        <Card className="shadow-sm">
            <CardHeader className="px-4 py-0">
                {/* Month navigation */}
                <div className="mb-2 flex items-center justify-between">
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
                        <div
                            key={d}
                            className="py-1 text-center text-[10px] font-medium text-muted-foreground"
                        >
                            {d}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-0">
                {/* Calendar grid */}
                <div
                    className={`mb-5 grid grid-cols-7 gap-y-1 ${loadingMonth ? 'opacity-50' : ''}`}
                >
                    {cells.map((day, i) => {
                        if (day === null) {
                            return <div key={`e-${i}`} />;
                        }

                        const dateKey = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                        const avail = monthData[dateKey];
                        const isToday = dateKey === todayStr;
                        const isSelected = dateKey === selectedDate;
                        const isPast = dateKey < todayStr;
                        const isFull = avail?.is_full && !isPast && !isSelected;

                        return (
                            <div
                                key={day}
                                className="flex items-center justify-center"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setInternalDate(dateKey);
                                        onDateSelect?.(dateKey);
                                    }}
                                    className={[
                                        'flex h-8 w-8 items-center justify-center rounded-sm text-xs transition-colors',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground'
                                            : isFull
                                              ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                              : isToday
                                                ? 'bg-muted text-primary ring-1 ring-primary'
                                                : 'bg-muted text-foreground hover:bg-muted/80',
                                        isPast ? 'opacity-40' : '',
                                    ].join(' ')}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Selected date detail */}
                {selectedDate && (
                    <div className="pb-4">
                        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {onTimeSelect ? (
                                <>
                                    Available slots ·{' '}
                                    <span className="font-semibold text-primary">
                                        {slotsLabel}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Selected :{' '}
                                    <span className="font-semibold text-primary">
                                        {selectedLabel}
                                    </span>
                                </>
                            )}
                        </p>

                        {loadingDay ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">
                                Loading slots…
                            </div>
                        ) : dayDetail ? (
                            <div className="space-y-2">
                                {dayDetail.is_full ? (
                                    <div className="rounded-sm bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-destructive">
                                        Fully booked
                                    </div>
                                ) : onTimeSelect ? (
                                    <div className="space-y-2">
                                        {allSlots.map((slot) => {
                                            const isSelected =
                                                selectedTime === slot.from;

                                            return (
                                                <button
                                                    key={slot.from}
                                                    type="button"
                                                    onClick={() =>
                                                        onTimeSelect?.(
                                                            slot.from,
                                                        )
                                                    }
                                                    className={[
                                                        'w-full rounded-xl px-3 py-2 text-center text-xs font-semibold transition-colors',
                                                        isSelected
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-success text-success-foreground hover:bg-success/80',
                                                    ].join(' ')}
                                                >
                                                    {slot.from} - {slot.to}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <>
                                        {morningRanges.length > 0 && (
                                            <div>
                                                <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Morning
                                                </p>
                                                <div className="rounded-xl bg-success px-3 py-2 text-center text-xs text-success-foreground">
                                                    <p className="font-semibold">
                                                        {morningRanges[0].from}{' '}
                                                        -{' '}
                                                        {
                                                            morningRanges[
                                                                morningRanges.length -
                                                                    1
                                                            ].to
                                                        }{' '}
                                                        · open
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {afternoonRanges.length > 0 && (
                                            <div>
                                                <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Afternoon
                                                </p>
                                                <div className="rounded-xl bg-success px-3 py-2 text-center text-xs text-success-foreground">
                                                    <p className="font-semibold">
                                                        {
                                                            afternoonRanges[0]
                                                                .from
                                                        }{' '}
                                                        -{' '}
                                                        {
                                                            afternoonRanges[
                                                                afternoonRanges.length -
                                                                    1
                                                            ].to
                                                        }{' '}
                                                        · open
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
