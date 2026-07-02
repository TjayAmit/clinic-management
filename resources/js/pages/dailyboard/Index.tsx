import { Head, Link, router } from '@inertiajs/react';
import { LayoutDashboard, Plus } from 'lucide-react';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import {
    create as appointmentsCreate,
    show as appointmentsShow,
} from '@/routes/appointments';
import type {
    AppointmentStatus,
    DailyBoardEntry,
    DailyBoardProps,
} from '@/types';
import { STATUS_DOT, avatarCls, initials } from '../dashboard/_shared';

function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

const STATUS_BORDER: Record<AppointmentStatus, string> = {
    pending: 'border-l-amber-500',
    confirmed: 'border-l-blue-500',
    in_queue: 'border-l-amber-500',
    in_progress: 'border-l-purple-500',
    completed: 'border-l-emerald-500',
    needs_follow_up: 'border-l-orange-500',
    cancelled: 'border-l-red-400',
    no_show: 'border-l-slate-400',
};

const LEGEND = [
    { status: 'confirmed', label: 'Confirmed' },
    { status: 'in_progress', label: 'In chair' },
    { status: 'pending', label: 'Pending' },
    { status: 'completed', label: 'Done' },
];

export default function Index({ entries, doctors, filters }: DailyBoardProps) {
    const navigate = (
        params: Record<string, string | number | null | undefined>,
    ) => {
        router.get(
            '/daily-board',
            { date: filters.date, doctor_id: filters.doctor_id, ...params },
            { preserveScroll: true, replace: true },
        );
    };

    const dateLabel = new Date(filters.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    const entriesByDoctor = entries.reduce<Record<string, DailyBoardEntry[]>>(
        (acc, entry) => {
            acc[entry.doctor_name] = acc[entry.doctor_name] ?? [];
            acc[entry.doctor_name].push(entry);

            return acc;
        },
        {},
    );

    const columns = doctors.map((doctor) => ({
        doctor,
        entries: entriesByDoctor[doctor.name] ?? [],
    }));

    return (
        <>
            <Head title="Daily Board" />

            <div className="flex min-h-full flex-1 flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Daily Board
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {dateLabel} · live chair status by dentist
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 sm:flex">
                            {LEGEND.map((item) => (
                                <div
                                    key={item.status}
                                    className="flex items-center gap-1.5"
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${STATUS_DOT[item.status]}`}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Button className="gap-1" asChild>
                            <Link href={appointmentsCreate()}>
                                <Plus className="h-4 w-4" />
                                Add
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        type="date"
                        className="h-9 w-auto"
                        value={filters.date}
                        onChange={(e) =>
                            navigate({
                                date: e.target.value || undefined,
                                doctor_id: filters.doctor_id,
                            })
                        }
                        aria-label="Filter by date"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            navigate({
                                date: new Date().toISOString().slice(0, 10),
                                doctor_id: null,
                            })
                        }
                    >
                        Today
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {columns.map(({ doctor, entries: doctorEntries }) => (
                        <Card key={doctor.id} className="border-0 shadow-sm">
                            <CardContent className="p-4">
                                <div className="mb-4 flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${avatarCls(doctor.name)}`}
                                    >
                                        {initials(doctor.name)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {doctor.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {doctor.specialization}
                                        </p>
                                    </div>
                                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold text-muted-foreground">
                                        {doctorEntries.length}
                                    </span>
                                </div>

                                {doctorEntries.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-muted-foreground">
                                        <LayoutDashboard className="h-5 w-5 opacity-40" />
                                        <p className="text-xs">
                                            No appointments
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {doctorEntries.map((entry) => (
                                            <button
                                                key={entry.id}
                                                type="button"
                                                onClick={() =>
                                                    router.get(
                                                        appointmentsShow(
                                                            entry.id,
                                                        ),
                                                    )
                                                }
                                                className={`flex w-full items-start justify-between gap-3 rounded-xl border border-l-4 border-border bg-card p-3 text-left transition-colors hover:bg-muted/40 ${STATUS_BORDER[entry.status]}`}
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground tabular-nums">
                                                        {formatTime(entry.time)}
                                                    </p>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {entry.patient_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {entry.service_name}
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    status={entry.status}
                                                    className="shrink-0"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Daily Board', href: '/daily-board' }]}>
        {page}
    </AppLayout>
);
