import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, ChevronDown, Plus, Search } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth, devUsers } = usePage().props;

    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 lg:px-6">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search patients, appointments..."
                        className="w-72 bg-muted pl-9 lg:w-80"
                    />
                </div>

                <Button variant="outline" size="icon" className="shrink-0">
                    <Bell className="h-4 w-4" />
                </Button>

                <Button asChild className="hidden shrink-0 sm:flex">
                    <Link href="/patients/create">
                        <Plus className="mr-2 h-4 w-4" />
                        New Patient
                    </Link>
                </Button>

                {devUsers && devUsers.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                            >
                                <span className="rounded bg-primary/15 px-1 font-mono font-semibold text-primary">
                                    DEV
                                </span>
                                <span className="max-w-[120px] truncate">
                                    {auth.user.name}
                                </span>
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
                                            router.post(
                                                `/dev/switch-user/${user.id}`,
                                            );
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
                                        <p className="truncate text-sm font-medium">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {user.roles.length > 0
                                                ? user.roles.join(', ')
                                                : 'No role'}
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
