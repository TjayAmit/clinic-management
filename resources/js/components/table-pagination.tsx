import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaginationMeta {
    total: number;
    from: number | null;
    to: number | null;
    current_page: number;
    last_page: number;
}

interface TablePaginationProps {
    meta: PaginationMeta;
    perPage: number;
    onPerPageChange: (value: number) => void;
    onPageChange: (page: number) => void;
    perPageOptions?: number[];
}

function getPageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 7) {
return Array.from({ length: total }, (_, i) => i + 1);
}

    if (current <= 3) {
return [1, 2, 3, 4, 5, '…', total];
}

    if (current >= total - 2) {
return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
}

    return [1, '…', current - 1, current, current + 1, '…', total];
}

export function TablePagination({
    meta,
    perPage,
    onPerPageChange,
    onPageChange,
    perPageOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
    const { total, from, to, current_page, last_page } = meta;

    return (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {/* Rows per page */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="shrink-0">Rows per page</span>
                <select
                    value={perPage}
                    onChange={(e) => onPerPageChange(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background pl-2.5 pr-7 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {perPageOptions.map((n) => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                </select>
            </div>

            {/* Page info + nav */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm tabular-nums text-muted-foreground">
                    {total === 0 ? 'No results' : `${from ?? 0}–${to ?? 0} of ${total}`}
                </span>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => onPageChange(1)}
                        disabled={current_page === 1}
                        title="First page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => onPageChange(current_page - 1)}
                        disabled={current_page === 1}
                        title="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers(current_page, last_page).map((page, idx) =>
                        typeof page === 'string' ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                            >
                                {page}
                            </span>
                        ) : (
                            <Button
                                key={page}
                                variant={current_page === page ? 'default' : 'outline'}
                                size="icon"
                                className="h-8 w-8 text-sm"
                                onClick={() => onPageChange(page)}
                            >
                                {page}
                            </Button>
                        )
                    )}

                    <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => onPageChange(current_page + 1)}
                        disabled={current_page === last_page}
                        title="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => onPageChange(last_page)}
                        disabled={current_page === last_page}
                        title="Last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
