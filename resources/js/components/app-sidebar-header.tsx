import { router, usePage } from '@inertiajs/react';
import { Check, ChevronDown } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, devUsers } = usePage().props;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />

                {devUsers && devUsers.length > 0 && (
                    <div className="ml-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <span className="rounded bg-amber-100 px-1 font-mono font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                                        DEV
                                    </span>
                                    <span className="max-w-[120px] truncate">{auth.user.name}</span>
                                    <ChevronDown className="h-3 w-3 opacity-60" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-60">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Switch User (dev only)
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {devUsers.map((user) => (
                                    <DropdownMenuItem
                                        key={user.id}
                                        disabled={user.id === auth.user.id}
                                        onClick={() => {
                                            if (user.id !== auth.user.id) {
                                                router.post(`/dev/switch-user/${user.id}`);
                                            }
                                        }}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                            {user.id === auth.user.id && (
                                                <Check className="h-3 w-3 text-green-500" />
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {user.roles.length > 0 ? user.roles.join(', ') : 'No role'}
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
        </header>
    );
}
