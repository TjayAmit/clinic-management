import { Head, router } from '@inertiajs/react';
import { Eye, FileText, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
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
    index as dentalRecords,
    create as dentalRecordsCreate,
    show as dentalRecordsShow,
    edit as dentalRecordsEdit,
    destroy as dentalRecordsDestroy,
} from '@/routes/dental-records';
import type { DentalRecordsIndexProps } from '@/types';

export default function Index({ data, filters }: DentalRecordsIndexProps) {
    const { hasPermission } = usePermission();
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            dentalRecords(),
            { search, per_page: perPage, ...params },
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
        router.delete(dentalRecordsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <>
            <Head title="Dental Records" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    <TablePageHeader
                        title="Dental Records"
                        count={data.total}
                        search={search}
                        searchPlaceholder="Search by patient name…"
                        onSearchChange={handleSearchChange}
                        createHref={hasPermission('medical_records.create') ? dentalRecordsCreate().url : undefined}
                        createLabel="New Record"
                    />

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">Patient</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Dentist</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Chief Complaint</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Diagnosis</TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">Date</TableHead>
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
                                                <FileText className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No dental records found</p>
                                                {search && (
                                                    <p className="mt-0.5 text-sm">
                                                        Try a different search or{' '}
                                                        <button
                                                            onClick={() => handleSearchChange('')}
                                                            className="text-primary hover:underline"
                                                        >
                                                            clear the filter
                                                        </button>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-muted/30"
                                        onClick={() => router.get(dentalRecordsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4 text-sm font-medium">
                                            {item.patient?.full_name ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.dentist?.user?.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.chief_complaint}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.diagnosis ?? '—'}
                                        </TableCell>
                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.created_at}
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
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => router.get(dentalRecordsShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </DropdownMenuItem>
                                                    {hasPermission('medical_records.edit') && (
                                                        <DropdownMenuItem onClick={() => router.get(dentalRecordsEdit(item.id))}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
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
            </div>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Dental Record"
                itemName={data.data.find((r) => r.id === deleteId)?.patient?.full_name}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Dental Records', href: dentalRecords() }]}>
        {page}
    </AppLayout>
);
