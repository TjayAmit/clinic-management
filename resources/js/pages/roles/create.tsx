import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, ChevronDown, Shield } from 'lucide-react';
import { FormEvent, useState } from 'react';
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
import { index as roles, store as rolesStore } from '@/routes/roles';
import type { RolesFormProps } from '@/types';
import AppLayout from '@/layouts/app-layout';

export default function Create({ permissions }: RolesFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const [isOpen, setIsOpen] = useState(true);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(rolesStore());
    };

    const togglePermission = (permissionId: number) => {
        setData('permissions',
            data.permissions.includes(permissionId)
                ? data.permissions.filter((id) => id !== permissionId)
                : [...data.permissions, permissionId]
        );
    };

    const toggleAllPermissions = () => {
        if (data.permissions.length === permissions.length) {
            setData('permissions', []);
        } else {
            setData('permissions', permissions.map((p) => p.id));
        }
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        const module = permission.name.split('.')[0] || 'other';
        if (!acc[module]) acc[module] = [];
        acc[module].push(permission);
        return acc;
    }, {} as Record<string, typeof permissions>);

    return (
        <>
            <Head title="Create Role" />

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
                                <CardTitle className="text-base">Create New Role</CardTitle>
                                <p className="text-sm text-muted-foreground">Define a name and assign permissions</p>
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
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., editor, manager"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
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
                                            <div className="mb-4 flex items-center gap-2">
                                                <Checkbox
                                                    id="select-all"
                                                    checked={data.permissions.length === permissions.length && permissions.length > 0}
                                                    onCheckedChange={toggleAllPermissions}
                                                />
                                                <Label htmlFor="select-all" className="cursor-pointer">
                                                    Select All Permissions
                                                </Label>
                                            </div>

                                            <div className="space-y-4">
                                                {Object.entries(groupedPermissions).map(([module, perms]) => (
                                                    <div key={module}>
                                                        <h4 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
                                                            {module}
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                                            {perms.map((permission) => (
                                                                <div key={permission.id} className="flex items-center gap-2">
                                                                    <Checkbox
                                                                        id={`permission-${permission.id}`}
                                                                        checked={data.permissions.includes(permission.id)}
                                                                        onCheckedChange={() => togglePermission(permission.id)}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`permission-${permission.id}`}
                                                                        className="cursor-pointer text-xs font-normal"
                                                                    >
                                                                        {permission.name.split('.')[1] || permission.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CollapsibleContent>
                            </Collapsible>

                            <div className="flex items-center gap-3 border-t border-border pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Check className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating…' : 'Create Role'}
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
                            {data.permissions.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <p className="font-medium text-foreground">{data.permissions.length} permission{data.permissions.length !== 1 ? 's' : ''} selected</p>
                                    <p>out of {permissions.length} total</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Roles', href: roles() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
