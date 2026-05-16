import { Head, router } from '@inertiajs/react';
import { ClipboardList, Eye, MoreVertical, Search, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { usePermission } from '@/hooks/use-permission';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    index as patientVisits,
    show as patientVisitsShow,
    destroy as patientVisitsDestroy,
    checkIn as patientVisitsCheckIn,
    checkOut as patientVisitsCheckOut,
} from '@/routes/patient-visits';
import type { PatientVisitsIndexProps } from '@/types';

export default function Index({ data, filters }: PatientVisitsIndexProps) {
    const { hasPermission } = usePermission();
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const dateTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            patientVisits(),
            { date: filters.date, per_page: perPage, ...params },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleDateChange = (value: string) => {
        clearTimeout(dateTimeout.current);
        dateTimeout.current = setTimeout(() => {
            navigate({ date: value || undefined, page: 1 });
        }, 350);
    };

    const handleDelete = () => {
        if (!deleteId) {
return;
}

        setIsDeleting(true);
        router.delete(patientVisitsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleCheckIn = (id: number) => {
        router.patch(patientVisitsCheckIn(id).url);
    };

    const handleCheckOut = (id: number) => {
        router.patch(patientVisitsCheckOut(id).url);
    };

    const visitStatus = (visit: PatientVisitsIndexProps['data']['data'][number]) => {
        if (visit.check_out_at) {
return { label: 'Checked Out', variant: 'outline' as const };
}

        if (visit.check_in_at) {
return { label: 'Checked In', variant: 'default' as const };
}

        return { label: 'Scheduled', variant: 'secondary' as const };
    };

    return (
        <>
            <Head title="Patient Visits" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                        <div>
                            <h2 className="text-base font-semibold text-card-foreground">Patient Visits</h2>
                            <p className="text-sm text-muted-foreground">{data.total} records</p>
                        </div>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Search by patient name…"
                                className="h-9 w-52 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring lg:w-64"
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 pb-4">
                        <Input
                            type="date"
                            className="h-9 w-auto"
                            defaultValue={filters.date ?? ''}
                            onChange={(e) => handleDateChange(e.target.value)}
                        />
                        {filters.date && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate({ date: undefined, page: 1 })}
                                className="h-9 text-muted-foreground"
                            >
                                Clear filter
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">Patient</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Dentist</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Visited At</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Dental Record</TableHead>
                                <TableHead className="h-11 w-12 py-0 pl-4 pr-6">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="rounded-full bg-muted p-3">
                                                <ClipboardList className="h-5 w-5 opacity-50" />
                                            </div>
                                            <p className="text-sm font-medium">No patient visits found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => {
                                    const status = visitStatus(item);

                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                            onClick={() => router.get(patientVisitsShow(item.id))}
                                        >
                                            <TableCell className="py-3.5 pl-6 pr-4 text-sm font-medium">
                                                {item.patient?.full_name ?? '—'}
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.dentist?.user?.name ?? '—'}
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.visited_at}
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5">
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                            </TableCell>
                                            <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                                {item.dentalRecord ? (
                                                    <Badge variant="outline">Recorded</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="py-3.5 pl-4 pr-6"
                                                onClick={(e) => e.stopPropagation()}
                                            >
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
                                                        <DropdownMenuItem onClick={() => router.get(patientVisitsShow(item.id))}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        {hasPermission('medical_records.edit') && !item.check_in_at && (
                                                            <DropdownMenuItem onClick={() => handleCheckIn(item.id)}>
                                                                Check In
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('medical_records.edit') && item.check_in_at && !item.check_out_at && (
                                                            <DropdownMenuItem onClick={() => handleCheckOut(item.id)}>
                                                                Check Out
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission('medical_records.delete') && (
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
 setPerPage(v); navigate({ per_page: v, page: 1 }); 
}}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Patient Visit"
                itemName={data.data.find((v) => v.id === deleteId)?.patient?.full_name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Patient Visits', href: patientVisits() }]}>
        {page}
    </AppLayout>
);
