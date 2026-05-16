import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ChevronDown, Shield } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { index as roles, update as rolesUpdate } from '@/routes/roles';
import type { RolesFormProps } from '@/types';

const NAME_MAX = 50;

export default function Edit({ role, permissions }: RolesFormProps) {
    // role is always provided by the controller on this page; the type marks it
    // optional to share the interface with Create which doesn't need it.
    const resolvedRole = role!;

    const { data, setData, put, processing, errors } = useForm({
        name: resolvedRole.name,
        permissions: resolvedRole.permissions?.map((p) => p.id) || [],
    });

    const [isOpen, setIsOpen] = useState(true);
    const [permissionSearch, setPermissionSearch] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(rolesUpdate.url(resolvedRole.id));
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, NAME_MAX);
        setData('name', sanitized);
    };

    const togglePermission = (permissionId: number) => {
        if (isSuperAdmin) {
return;
}

        setData('permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const toggleAllPermissions = () => {
        if (isSuperAdmin) {
return;
}

        if (data.permissions.length === permissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', permissions.map((p) => p.id));
        }
    };

    const toggleModulePermissions = (modulePerms: typeof permissions) => {
        if (isSuperAdmin) {
return;
}

        const moduleIds = modulePerms.map((p) => p.id);
        const allSelected = moduleIds.every((id) => data.permissions.includes(id));

        if (allSelected) {
            setData('permissions', data.permissions.filter((id) => !moduleIds.includes(id)));
        } else {
            const merged = Array.from(new Set([...data.permissions, ...moduleIds]));
            setData('permissions', merged);
        }
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        const module = permission.name.split('.')[0] || 'other';

        if (!acc[module]) {
acc[module] = [];
}

        acc[module].push(permission);

        return acc;
    }, {} as Record<string, typeof permissions>);

    const searchLower = permissionSearch.toLowerCase().trim();
    const filteredGrouped = Object.entries(groupedPermissions).reduce((acc, [module, perms]) => {
        const filtered = searchLower
            ? perms.filter((p) => p.name.toLowerCase().includes(searchLower))
            : perms;

        if (filtered.length > 0) {
            acc[module] = filtered;
        }

        return acc;
    }, {} as Record<string, typeof permissions>);

    const isProtectedRole = resolvedRole.name === 'super-admin' || resolvedRole.name === 'admin';
    const isSuperAdmin = resolvedRole.name === 'super-admin';

    return (
        <>
            <Head title={`Edit Role - ${resolvedRole.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={roles()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Edit Role</CardTitle>
                                <p className="text-sm text-muted-foreground">Modify role name and permissions</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Role Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    disabled={isProtectedRole}
                                    placeholder="e.g., editor, manager"
                                    maxLength={NAME_MAX}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {!isProtectedRole && (
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            Lowercase letters, numbers, hyphens, and underscores only.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {data.name.length}/{NAME_MAX}
                                        </p>
                                    </div>
                                )}
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                                {isProtectedRole && (
                                    <p className="text-sm text-muted-foreground">Protected role names cannot be changed.</p>
                                )}
                            </div>

                            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="outline" className="w-full justify-between">
                                        <span>Permissions</span>
                                        <span className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {data.permissions.length} selected
                                            </Badge>
                                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </span>
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            {isSuperAdmin && (
                                                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                                                    Super-admin requires all permissions. Individual permissions cannot be toggled for this role.
                                                </div>
                                            )}

                                            <TooltipProvider>
                                                <div className="mb-4 flex items-center gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <Checkbox
                                                                    id="select-all"
                                                                    checked={data.permissions.length === permissions.length && permissions.length > 0}
                                                                    onCheckedChange={toggleAllPermissions}
                                                                    disabled={isSuperAdmin}
                                                                />
                                                            </span>
                                                        </TooltipTrigger>
                                                        {isSuperAdmin && (
                                                            <TooltipContent>
                                                                Super-admin must retain all permissions
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                    <Label htmlFor="select-all" className={isSuperAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}>
                                                        Select All Permissions
                                                    </Label>
                                                </div>

                                                <div className="mb-4">
                                                    <Input
                                                        type="text"
                                                        value={permissionSearch}
                                                        onChange={(e) => setPermissionSearch(e.target.value)}
                                                        placeholder="Filter permissions…"
                                                        className="h-8 text-sm"
                                                    />
                                                </div>

                                                <div className="space-y-4">
                                                    {Object.entries(filteredGrouped).map(([module, perms]) => {
                                                        const moduleIds = perms.map((p) => p.id);
                                                        const allModuleSelected = moduleIds.every((id) => data.permissions.includes(id));

                                                        return (
                                                            <div key={module}>
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span>
                                                                                <Checkbox
                                                                                    id={`module-${module}`}
                                                                                    checked={allModuleSelected && perms.length > 0}
                                                                                    onCheckedChange={() => toggleModulePermissions(perms)}
                                                                                    disabled={isSuperAdmin}
                                                                                />
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        {isSuperAdmin && (
                                                                            <TooltipContent>
                                                                                Super-admin must retain all permissions
                                                                            </TooltipContent>
                                                                        )}
                                                                    </Tooltip>
                                                                    <Label
                                                                        htmlFor={`module-${module}`}
                                                                        className={`text-sm font-semibold capitalize text-muted-foreground ${isSuperAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                                    >
                                                                        {module}
                                                                    </Label>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 pl-6 sm:grid-cols-3 lg:grid-cols-4">
                                                                    {perms.map((permission) => (
                                                                        <div key={permission.id} className="flex items-center gap-2">
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span>
                                                                                        <Checkbox
                                                                                            id={`permission-${permission.id}`}
                                                                                            checked={data.permissions.includes(permission.id)}
                                                                                            onCheckedChange={() => togglePermission(permission.id)}
                                                                                            disabled={isSuperAdmin}
                                                                                        />
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                {isSuperAdmin && (
                                                                                    <TooltipContent>
                                                                                        Super-admin must retain all permissions
                                                                                    </TooltipContent>
                                                                                )}
                                                                            </Tooltip>
                                                                            <Label
                                                                                htmlFor={`permission-${permission.id}`}
                                                                                className={`text-xs font-normal ${isSuperAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                                            >
                                                                                {permission.name.split('.')[1] || permission.name}
                                                                            </Label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {Object.keys(filteredGrouped).length === 0 && (
                                                        <p className="text-sm text-muted-foreground">No permissions match your search.</p>
                                                    )}
                                                </div>
                                            </TooltipProvider>
                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>

                            <div className="flex items-center gap-3 border-t border-border pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={roles()}>Cancel</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">About Roles</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Roles group permissions together. Assign a role to a user to grant them access to specific parts of the system.</p>
                            <div className="space-y-1.5">
                                <p className="font-medium text-foreground">Permission format</p>
                                <p>Permissions follow the pattern <code className="rounded bg-muted px-1 py-0.5 text-xs">module.action</code>, e.g. <code className="rounded bg-muted px-1 py-0.5 text-xs">patients.view</code>.</p>
                            </div>
                            <div className="space-y-1.5 pt-2">
                                <p className="font-medium text-foreground">
                                    {data.permissions.length} of {permissions.length} permission{permissions.length !== 1 ? 's' : ''} selected
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Roles', href: roles() },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
