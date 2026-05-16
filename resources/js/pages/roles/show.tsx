import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Shield, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { index as roles, edit as rolesEdit, destroy as rolesDestroy } from '@/routes/roles';
import type { RolesShowProps } from '@/types';

export default function Show({ role }: RolesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(rolesDestroy(role.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const isProtectedRole = role.name === 'super-admin' || role.name === 'admin';

    // Group permissions by module
    const groupedPermissions = role.permissions?.reduce((acc, permission) => {
        const module = permission.name.split('.')[0] || 'other';

        if (!acc[module]) {
acc[module] = [];
}

        acc[module].push(permission);

        return acc;
    }, {} as Record<string, typeof role.permissions>);

    return (
        <>
            <Head title={`Role - ${role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={roles()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={rolesEdit(role.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        {!isProtectedRole && (
                            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mx-auto w-full max-w-3xl space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{role.name}</CardTitle>
                                    {isProtectedRole && (
                                        <Badge variant="secondary">Protected</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Guard: {role.guard_name}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                    <p className="text-sm">{role.created_at}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                    <p className="text-sm">{role.updated_at}</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="mb-4 text-sm font-semibold">
                                    Permissions ({role.permissions?.length || 0})
                                </h3>
                                {role.permissions && role.permissions.length > 0 ? (
                                    <div className="space-y-4">
                                        {Object.entries(groupedPermissions || {}).map(([module, perms]) => (
                                            <div key={module}>
                                                <h4 className="mb-2 text-sm font-medium capitalize text-muted-foreground">
                                                    {module}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {perms?.map((permission) => (
                                                        <Badge key={permission.id} variant="outline" className="flex items-center gap-1">
                                                            <Check className="h-3 w-3" />
                                                            {permission.name.split('.')[1] || permission.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <X className="h-4 w-4" />
                                        <span className="text-sm">No permissions assigned</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Role</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete the role &quot;{role.name}&quot;?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Roles', href: roles() },
            { title: 'View Role', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
