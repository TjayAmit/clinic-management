import { Head, router } from '@inertiajs/react';
import { MoreVertical, Trash2, Eye, Activity } from 'lucide-react';
import { useRef, useState } from 'react';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import AppLayout from '@/layouts/app-layout';
import {
    index as activityLogs,
    show as activityLogsShow,
    destroy as activityLogsDestroy,
} from '@/routes/activityLogs';
import type { ActivityLogsIndexProps } from '@/types';

export default function Index({ data, filters, logNames, events }: ActivityLogsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [logName, setLogName] = useState(filters.log_name || '_all');
    const [event, setEvent] = useState(filters.event || '_all');
    const [perPage, setPerPage] = useState(Number((filters as Record<string, unknown>).per_page) || 10);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(
            activityLogs(),
            { search, log_name: logName, event, per_page: perPage, ...params },
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

    const handleLogNameChange = (value: string) => {
        setLogName(value);
        navigate({ log_name: value === '_all' ? '' : value, page: 1 });
    };

    const handleEventChange = (value: string) => {
        setEvent(value);
        navigate({ event: value === '_all' ? '' : value, page: 1 });
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        navigate({ per_page: value, page: 1 });
    };

    const handleDelete = () => {
        if (!deleteId) {
return;
}

        setIsDeleting(true);
        router.delete(activityLogsDestroy(deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const getEventBadgeVariant = (eventName: string | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (!eventName) {
return 'secondary';
}

        const eventLower = eventName.toLowerCase();

        if (eventLower.includes('create') || eventLower.includes('add')) {
return 'default';
}

        if (eventLower.includes('update') || eventLower.includes('edit')) {
return 'secondary';
}

        if (eventLower.includes('delete') || eventLower.includes('remove')) {
return 'destructive';
}

        return 'outline';
    };

    return (
        <>
            <Head title="Activity Logs" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

                    {/* Custom Header without Create Button */}
                    <div className="flex flex-col gap-4 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Activity Logs</h2>
                            <p className="text-sm text-muted-foreground">
                                {data.total} {data.total === 1 ? 'entry' : 'entries'} found
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Input
                                type="search"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-9 w-[200px]"
                            />
                            {logNames.length > 0 && (
                                <Select value={logName || '_all'} onValueChange={handleLogNameChange}>
                                    <SelectTrigger className="h-9 w-[150px]">
                                        <SelectValue placeholder="Log name" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All logs</SelectItem>
                                        {logNames.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {events.length > 0 && (
                                <Select value={event || '_all'} onValueChange={handleEventChange}>
                                    <SelectTrigger className="h-9 w-[130px]">
                                        <SelectValue placeholder="Event" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_all">All events</SelectItem>
                                        {events.map((evt) => (
                                            <SelectItem key={evt} value={evt}>
                                                {evt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                <TableHead className="h-11 py-0 pl-6 pr-4 text-sm font-medium text-muted-foreground">
                                    Description
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Event
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Log Name
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Causer
                                </TableHead>
                                <TableHead className="h-11 px-4 py-0 text-sm font-medium text-muted-foreground">
                                    Date
                                </TableHead>
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
                                                <Activity className="h-5 w-5 opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">No activity logs found</p>
                                                {(search || logName || event) && (
                                                    <p className="mt-0.5 text-sm">
                                                        Try different filters or{' '}
                                                        <button
                                                            onClick={() => {
                                                                setSearch('');
                                                                setLogName('');
                                                                setEvent('');
                                                                navigate({ search: '', log_name: '', event: '', page: 1 });
                                                            }}
                                                            className="text-primary hover:underline"
                                                        >
                                                            clear all filters
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
                                        onClick={() => router.get(activityLogsShow(item.id))}
                                    >
                                        <TableCell className="py-3.5 pl-6 pr-4">
                                            <span className="text-sm font-medium text-foreground line-clamp-2 max-w-md">
                                                {item.description}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5">
                                            <Badge variant={getEventBadgeVariant(item.event)}>
                                                {item.event || 'N/A'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.log_name || '-'}
                                        </TableCell>

                                        <TableCell className="px-4 py-3.5 text-sm text-muted-foreground">
                                            {item.causer?.name || item.causer?.email || 'System'}
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
                                                    <DropdownMenuItem onClick={() => router.get(activityLogsShow(item.id))}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteId(item.id)}
                                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
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
                        onPerPageChange={handlePerPageChange}
                        onPageChange={(page) => navigate({ page })}
                    />
                </div>
            </div>

            <ConfirmDeleteDialog
                open={!!deleteId}
                onOpenChange={() => setDeleteId(null)}
                title="Delete Activity Log"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Activity Logs', href: activityLogs() }]}>
        {page}
    </AppLayout>
);
