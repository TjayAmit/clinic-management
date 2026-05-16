import { Head, router } from '@inertiajs/react';
import { LayoutDashboard } from 'lucide-react';
import { AppointmentStatusActions } from '@/components/appointment-status-actions';
import { StatusBadge } from '@/components/status-badge';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { DailyBoardProps } from '@/types';

function formatTime(time: string): string {
    // Strip seconds: "09:00:00" -> "09:00"
    return time.slice(0, 5);
}

export default function Index({ entries, doctors, filters }: DailyBoardProps) {
    const navigate = (params: Record<string, string | number | null | undefined>) => {
        router.get(
            '/daily-board',
            { date: filters.date, doctor_id: filters.doctor_id, ...params },
            { preserveScroll: true, replace: true },
        );
    };

    const handleReload = () => {
        router.reload();
    };

    return (
        <>
            <Head title="Daily Board" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">Daily Board</h1>
                            <p className="text-sm text-muted-foreground">{filters.date}</p>
                        </div>
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm">
                            <LayoutDashboard className="h-4 w-4" />
                            {entries.length} patient{entries.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-3">
                        <Input
                            type="date"
                            className="h-9 w-auto"
                            value={filters.date}
                            onChange={(e) =>
                                navigate({ date: e.target.value || undefined, doctor_id: filters.doctor_id })
                            }
                            aria-label="Filter by date"
                        />
                        <Select
                            value={filters.doctor_id !== null ? String(filters.doctor_id) : ''}
                            onValueChange={(v) =>
                                navigate({ date: filters.date, doctor_id: v ? Number(v) : null })
                            }
                        >
                            <SelectTrigger className="h-9 w-48" aria-label="Filter by doctor">
                                <SelectValue placeholder="All Doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Doctors</SelectItem>
                                {doctors.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                        Patient
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                        Time
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                        Doctor
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                        Service
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                        Status
                                    </TableHead>
                                    <TableHead className="h-11 w-28 py-0 pl-4 pr-6">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {entries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <div className="rounded-full bg-muted p-3">
                                                    <LayoutDashboard className="h-5 w-5 opacity-50" />
                                                </div>
                                                <p className="text-sm font-medium">
                                                    No patients scheduled for this date.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entries.map((entry) => (
                                        <TableRow
                                            key={entry.id}
                                            className="border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        >
                                            {/* Patient */}
                                            <TableCell className="py-3.5 pl-6 pr-4 text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    {entry.patient_name}
                                                    {entry.is_walk_in && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                        >
                                                            Walk-in
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Time */}
                                            <TableCell className="px-4 py-3.5 text-sm tabular-nums text-muted-foreground">
                                                {formatTime(entry.time)}
                                            </TableCell>

                                            {/* Doctor */}
                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {entry.doctor_name}
                                            </TableCell>

                                            {/* Service + series progress */}
                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {entry.service_name}
                                                {entry.series_position !== null &&
                                                    entry.series_total !== null && (
                                                        <span className="ml-1.5 text-xs text-muted-foreground/60">
                                                            ({entry.series_position}/{entry.series_total})
                                                        </span>
                                                    )}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="px-4 py-3.5">
                                                <StatusBadge status={entry.status} />
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="py-3.5 pl-4 pr-6">
                                                <AppointmentStatusActions
                                                    appointmentId={entry.id}
                                                    status={entry.status}
                                                    onSuccess={handleReload}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
