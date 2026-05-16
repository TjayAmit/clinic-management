import { Link } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TablePageHeaderProps {
    title: string;
    count?: number;
    search: string;
    searchPlaceholder?: string;
    onSearchChange: (value: string) => void;
    createHref: string;
    createLabel?: string;
    children?: React.ReactNode;
}

export function TablePageHeader({
    title,
    count,
    search,
    searchPlaceholder = 'Search…',
    onSearchChange,
    createHref,
    createLabel = 'New',
    children,
}: TablePageHeaderProps) {
    return (
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            <div>
                <h2 className="text-base font-semibold text-card-foreground">{title}</h2>
                {count !== undefined && (
                    <p className="text-sm text-muted-foreground">{count} records</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                {children}
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={searchPlaceholder}
                        className="h-9 w-52 pl-8 text-sm lg:w-64"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <Button asChild size="sm" className="h-9 gap-1.5">
                    <Link href={createHref}>
                        <Plus className="h-4 w-4" />
                        {createLabel}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
