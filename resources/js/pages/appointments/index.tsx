import { Head, router } from '@inertiajs/react';
import { CalendarDays, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { AppointmentCalendar } from '@/components/appointment-calendar';
import { AppointmentStatusActions } from '@/components/appointment-status-actions';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { STATUS_CONFIG, StatusBadge } from '@/components/status-badge';
import { TablePageHeader } from '@/components/table-page-header';
import { TablePagination } from '@/components/table-pagination';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    edit as appointmentsEdit,
    destroy as appointmentsDestroy,
} from '@/routes/appointments';
import type { AppointmentsIndexProps } from '@/types';

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Index({ data, filters, doctors }: AppointmentsIndexProps) {
    const { hasPermission } = usePermission();
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

    const handleDelete = () => {
        if (!deleteId) {
return;
}

        setIsDeleting(true);
        router.delete(appointmentsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <>
            <Head title="Appointments" />

            <div className="flex h-full flex-1 gap-4 p-4 lg:p-6">
                {/* ── Table (existing) ── */}
                <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Appointments"
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search by patient name…"
                        onSearchChange={handleSearchChange}
                        createHref={hasPermission('appointments.create') ? appointmentsCreate().url : undefined}
                        createLabel="New Appointment"
                    />

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 pb-4">
                        <Input
                            type="date"
                            className="h-9 w-auto"
                            value={filters.date ?? ''}
                            onChange={(e) => navigate({ date: e.target.value || undefined, page: 1 })}
                        />
                        <Select
                            value={filters.dentist_id ?? ''}
                            onValueChange={(v) => navigate({ dentist_id: v || undefined, page: 1 })}
                        >
                            <SelectTrigger className="h-9 w-48">
                                <SelectValue placeholder="All doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.user?.name ?? `Doctor #${d.id}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.status ?? ''}
                            onValueChange={(v) => navigate({ status: v || undefined, page: 1 })}
                        >
                            <SelectTrigger className="h-9 w-40">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {(filters.date || filters.dentist_id || filters.status) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ date: undefined, dentist_id: undefined, status: undefined, page: 1 })}
                                className="h-9 text-muted-foreground"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">Patient</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Dentist</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Service</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Date</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Time</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Type</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-11 w-12 py-0 pl-4 pr-6">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <CalendarDays className="h-5 w-5 opacity-50" />
                                            </div>
                                            <p className="text-sm font-medium">No appointments found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(appointmentsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4 text-sm font-medium">
                                            {item.is_walk_in
                                                ? item.walk_in_name ?? 'Walk-in'
                                                : item.patient?.full_name ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.dentist?.user?.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.service?.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {formatDate(item.appointment_date)}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.start_time}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.is_walk_in ? (
                                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                                    Walk-in
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                    Regular
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5">
                                            <StatusBadge status={item.status} />
                                        </TableCell>
                                        <TableCell
                                            className="py-3.5 pl-4 pr-6"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-end gap-1">
                                                <AppointmentStatusActions
                                                    appointmentId={item.id}
                                                    status={item.status}
                                                    onSuccess={() => router.reload()}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">Open actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem onClick={() => router.get(appointmentsShow(item.id))}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        {hasPermission('appointments.edit') && (
                                                            <DropdownMenuItem onClick={() => router.get(appointmentsEdit(item.id))}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('appointments.delete') && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeleteId(item.id)}
                                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
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
 setPerPage(v); navigate({ per_page: v, page: 1 }); 
}}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>

                {/* ── Availability Calendar sidebar ── */}
                <div className="hidden shrink-0 lg:block lg:w-64 xl:w-72">
                    <div className="sticky top-4">
                        <AppointmentCalendar />
                    </div>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Appointment"
                itemName={data.data.find((a) => a.id === deleteId)?.patient?.full_name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Appointments', href: appointments() }]}>
        {page}
    </AppLayout>
);
