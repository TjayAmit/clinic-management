import { usePage } from '@inertiajs/react';
import type { NavItem } from '@/types';

export function usePermission() {
    const { auth } = usePage().props;
    const userRoles: string[] = auth.roles ?? [];
    const userPermissions: string[] = auth.permissions ?? [];

    const hasRole = (role: string | string[]): boolean => {
        const check = Array.isArray(role) ? role : [role];

        return check.some((r) => userRoles.includes(r));
    };

    const hasPermission = (permission: string | string[]): boolean => {
        const check = Array.isArray(permission) ? permission : [permission];

        return check.some((p) => userPermissions.includes(p));
    };

    /**
     * Returns true when the item has no guards, or the user satisfies
     * at least one role guard OR at least one permission guard.
     */
    const canAccess = (item: Pick<NavItem, 'roles' | 'permissions'>): boolean => {
        const hasRoleGuard = item.roles && item.roles.length > 0;
        const hasPermissionGuard = item.permissions && item.permissions.length > 0;

        if (!hasRoleGuard && !hasPermissionGuard) {
return true;
}

        if (hasRoleGuard && hasRole(item.roles!)) {
return true;
}

        if (hasPermissionGuard && hasPermission(item.permissions!)) {
return true;
}

        return false;
    };

    return { hasRole, hasPermission, canAccess };
}
