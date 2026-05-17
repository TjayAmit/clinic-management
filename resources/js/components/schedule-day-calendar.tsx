import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_OF_WEEK_MAP: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

const DAY_LABELS: Record<string, string> = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function toLocalDateString(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getDatesBetween(start: string, end: string): string[] {
    let s = new Date(start + 'T00:00:00');
    let e = new Date(end + 'T00:00:00');
    if (s > e) [s, e] = [e, s];
    const dates: string[] = [];
    const current = new Date(s);
    while (current <= e) {
        dates.push(toLocalDateString(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function getUniqueDayOfWeeks(dateKeys: string[]): string[] {
    const unique = new Set<string>();
    for (const key of dateKeys) {
        const d = new Date(key + 'T00:00:00');
        unique.add(DAY_OF_WEEK_MAP[d.getDay()]);
    }
    return Array.from(unique);
}

interface ScheduleDayCalendarProps {
    value?: string[];
    onChange: (dayOfWeeks: string[]) => void;
}

export function ScheduleDayCalendar({ value = [], onChange }: ScheduleDayCalendarProps) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
    const [anchorDate, setAnchorDate] = useState<string | null>(null);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = new Date(year, month, 1).getDay();
    const todayStr = toLocalDateString(today);

    const cells: (number | null)[] = [
        ...Array<null>(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Sync internal selection when parent value changes (e.g. form reset)
    useEffect(() => {
        if (value.length === 0) {
            setSelectedDates(new Set());
            setAnchorDate(null);
        }
    }, [value]);

    const navigateMonth = (dir: 'prev' | 'next') => {
        const d = new Date(year, month + (dir === 'next' ? 1 : -1));
        setYear(d.getFullYear());
        setMonth(d.getMonth());
    };

    const handleDateClick = (dateKey: string, e: React.MouseEvent) => {
        if (e.shiftKey && anchorDate) {
            const range = getDatesBetween(anchorDate, dateKey);
            const newSelected = new Set([...selectedDates, ...range]);
            setSelectedDates(newSelected);
            setAnchorDate(null);
            onChange(getUniqueDayOfWeeks(Array.from(newSelected)));
        } else {
            setSelectedDates(new Set([dateKey]));
            setAnchorDate(dateKey);
            const d = new Date(dateKey + 'T00:00:00');
            onChange([DAY_OF_WEEK_MAP[d.getDay()]]);
        }
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="px-4 pb-0 pt-4">
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

                <div className="grid grid-cols-7">
                    {DAY_ABBR.map((d) => (
                        <div key={d} className="py-1 text-center text-[10px] font-medium text-muted-foreground">
                            {d}
                        </div>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-y-0.5">
                    {cells.map((day, i) => {
                        if (day === null) {
                            return <div key={`e-${i}`} />;
                        }

                        const dateKey = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                        const isToday = dateKey === todayStr;
                        const isSelected = selectedDates.has(dateKey);
                        const isAnchor = anchorDate === dateKey;

                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={(e) => handleDateClick(dateKey, e)}
                                className={cn(
                                    'relative flex flex-col items-center justify-center rounded-md py-1 transition-colors',
                                    isSelected
                                        ? 'bg-primary text-primary-foreground'
                                        : isToday
                                          ? 'bg-muted font-semibold'
                                          : 'hover:bg-muted/60',
                                    isAnchor && 'ring-2 ring-primary ring-offset-1'
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-xs leading-none',
                                        isSelected
                                            ? 'text-primary-foreground'
                                            : isToday
                                              ? 'text-primary font-semibold'
                                              : 'text-foreground'
                                    )}
                                >
                                    {day}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-3 border-t border-border pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">Selected</span>
                        {value.length > 0 ? (
                            Array.from(new Set(value)).map((v) => (
                                <Badge key={v} variant="secondary" className="text-[10px]">
                                    {DAY_LABELS[v]}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-primary">Select a day</span>
                        )}
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                        Click a date to select. Hold Shift and click another date to select a range.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
