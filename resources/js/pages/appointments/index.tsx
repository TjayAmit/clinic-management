import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Plus, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { AppointmentCalendar } from '@/components/appointment-calendar';
import { STATUS_CONFIG, StatusBadge } from '@/components/status-badge';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
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
import { usePermission } from '@/hooks/use-permission';
import AppLayout from '@/layouts/app-layout';
import {
    index as appointments,
    create as appointmentsCreate,
    show as appointmentsShow,
} from '@/routes/appointments';
import type { Appointment, AppointmentsIndexProps } from '@/types';
import { avatarCls, initials } from '../dashboard/_shared';

function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function patientName(item: Appointment): string {
    return item.is_walk_in
        ? (item.walk_in_name ?? 'Walk-in')
        : (item.patient?.full_name ?? '—');
}

function patientTypeClass(isWalkIn: boolean): string {
    return isWalkIn
        ? 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/30 dark:text-rose-400 dark:ring-rose-800'
        : 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800';
}

export default function Index({
    data,
    filters,
    doctors,
}: AppointmentsIndexProps) {
    const { hasPermission } = usePermission();
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(
        Number((filters as Record<string, unknown>).per_page) || 10,
    );
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            appointments(),
            {
                search,
                per_page: perPage,
                date: filters.date,
                dentist_id: filters.dentist_id,
                status: filters.status,
                ...params,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            navigate({ search: value, page: 1 });
        }, 350);
    };

    return (
        <>
            <Head title="Appointments" />

            <div className="flex h-full bg-[#f6f7f9] flex-1 flex-col gap-4 p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Appointments
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {data.total} records this week
                        </p>
                    </div>
                    {hasPermission('appointments.create') && (
                        <Button
                            className="gap-2 rounded-lg px-4 font-semibold shadow-sm"
                            asChild
                        >
                            <Link href={appointmentsCreate()}>
                                <Plus className="h-4 w-4" />
                                New appointment
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="flex min-h-0 flex-1 gap-4">
                    <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 border-b border-border px-6 py-4">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search by patient name..."
                                    className="rounded-md border-1 pl-9 border-color-[#eaeff5] bg-[#f1f5fa]"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                />
                            </div>
                            <Select
                                value={filters.dentist_id ?? ''}
                                onValueChange={(v) =>
                                    navigate({
                                        dentist_id: v === 'all' ? undefined : v,
                                        page: 1,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-48 rounded-full border-0 bg-muted">
                                    <SelectValue placeholder="All doctors" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All doctors
                                    </SelectItem>
                                    {doctors.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={String(d.id)}
                                        >
                                            {d.user?.name ?? `Doctor #${d.id}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status ?? ''}
                                onValueChange={(v) =>
                                    navigate({
                                        status: v === 'all' ? undefined : v,
                                        page: 1,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 w-40 rounded-full border-0 bg-muted">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All statuses
                                    </SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(
                                        ([value, { label }]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                            {(filters.date ||
                                filters.dentist_id ||
                                filters.status) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        navigate({
                                            date: undefined,
                                            dentist_id: undefined,
                                            status: undefined,
                                            page: 1,
                                        })
                                    }
                                    className="h-9 text-muted-foreground"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="h-11 py-0 pr-4 pl-6 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Patient
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Dentist
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Service
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Time
                                    </TableHead>
                                    <TableHead className="h-11 px-4 py-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        Status
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {data.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-40 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <div className="rounded-full bg-muted p-3">
                                                    <CalendarDays className="h-5 w-5 opacity-50" />
                                                </div>
                                                <p className="text-sm font-medium">
                                                    No appointments found
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.data.map((item) => {
                                        const name = patientName(item);

                                        return (
                                            <TableRow
                                                key={item.id}
                                                className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30"
                                                onClick={() =>
                                                    router.get(
                                                        appointmentsShow(
                                                            item.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <TableCell className="py-3.5 pr-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarCls(name)}`}
                                                        >
                                                            {initials(name)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">
                                                                {name}
                                                            </p>
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${patientTypeClass(item.is_walk_in)}`}
                                                            >
                                                                {item.is_walk_in
                                                                    ? 'Walk-in'
                                                                    : 'Regular'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                    {item.dentist?.user?.name ??
                                                        '—'}
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                    {item.service?.name ?? '—'}
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5 text-sm text-foreground tabular-nums">
                                                    {formatTime(
                                                        item.start_time,
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-3.5">
                                                    <StatusBadge
                                                        status={item.status}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            meta={{
                                total: data.total,
                                from: data.from,
                                to: data.to,
                                current_page: data.current_page,
                                last_page: data.last_page,
                            }}
                            perPage={perPage}
                            onPerPageChange={(v) => {
                                setPerPage(v);
                                navigate({ per_page: v, page: 1 });
                            }}
                            onPageChange={(page) => navigate({ page })}
                        />
                    </div>

                    {/* Calendar sidebar */}
                    <div className="hidden shrink-0 lg:block lg:w-64 xl:w-72">
                        <div className="sticky top-4">
                            <AppointmentCalendar
                                selectedDate={filters.date}
                                onDateSelect={(date) =>
                                    navigate({
                                        date: date || undefined,
                                        page: 1,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Appointments', href: appointments() }]}>
        {page}
    </AppLayout>
);
