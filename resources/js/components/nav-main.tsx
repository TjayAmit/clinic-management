import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavGroup } from '@/types';

export function NavMain({ groups }: { groups: NavGroup[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="px-3 py-2">
                    <SidebarGroupLabel className="mb-1 px-3 py-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                    className="h-10 gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground [&_svg]:size-5"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span className="flex-1">
                                            {item.title}
                                        </span>
                                        {item.badge != null && (
                                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-md bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
