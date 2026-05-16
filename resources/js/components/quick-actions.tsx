import { Link } from '@inertiajs/react';
import { Clock, PlusCircle, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { create } from '@/routes/appointments';

interface DoctorAvailability {
    doctor_id: number;
    doctor_name: string;
    specialization: string | null;
    available_from: string | null;
    available_until: string | null;
    is_available_today: boolean;
}

function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function QuickActions() {
    const [doctors, setDoctors] = useState<DoctorAvailability[] | null>(null);

    useEffect(() => {
        fetch('/doctors/availability')
            .then((r) => r.json())
            .then((json) => setDoctors(json.data ?? []))
            .catch(() => {});
    }, []);

    const walkInUrl  = create.url({ query: { walk_in: '1' } });
    const newApptUrl = create.url();

    return (
        <Card className="shadow-none">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Schedule a new appointment or add a walk-in patient for today.
                </p>
            </CardHeader>

            {doctors && (
                <CardContent className="space-y-3 border-b border-border pb-4 pt-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">Doctor Availability</span>
                        </div>
                        <span
                            className={[
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                                doctors.some((d) => d.is_available_today)
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
                            ].join(' ')}
                        >
                            <span
                                className={[
                                    'h-1.5 w-1.5 rounded-full',
                                    doctors.some((d) => d.is_available_today) ? 'bg-emerald-500' : 'bg-amber-500',
                                ].join(' ')}
                            />
                            {doctors.some((d) => d.is_available_today) ? 'Open' : 'Full Schedule'}
                        </span>
                    </div>

                    <div className="space-y-1.5">
                        {doctors.map((d) => (
                            <div
                                key={d.doctor_id}
                                className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
                            >
                                <span
                                    className={[
                                        'block h-2 w-2 shrink-0 rounded-full',
                                        d.is_available_today ? 'bg-emerald-500' : 'bg-slate-400',
                                    ].join(' ')}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">{d.doctor_name}</p>
                                    {d.specialization && (
                                        <p className="truncate text-[11px] text-muted-foreground">{d.specialization}</p>
                                    )}
                                </div>
                                {d.is_available_today && d.available_from && d.available_until ? (
                                    <span className="shrink-0 text-xs font-medium tabular-nums text-emerald-700 dark:text-emerald-400">
                                        {formatTime(d.available_from)} – {formatTime(d.available_until)}
                                    </span>
                                ) : d.available_from === null && d.available_until === null ? (
                                    <span className="shrink-0 text-xs font-medium text-muted-foreground">Off Today</span>
                                ) : (
                                    <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">Fully Scheduled</span>
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
    );
}
