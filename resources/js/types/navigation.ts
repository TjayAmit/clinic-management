import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    badge?: string | number;
    /** User must have at least one of these permissions to see this item. */
    permissions?: string[];
    /** User must have at least one of these roles to see this item. */
    roles?: string[];
};

export type NavGroup = {
    title: string;
    items: NavItem[];
    /** User must have at least one of these roles to see this group. */
    roles?: string[];
};
