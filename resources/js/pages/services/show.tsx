import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
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
import {
    index as services,
    edit as servicesEdit,
    destroy as servicesDestroy,
} from '@/routes/services';
import type { ServicesShowProps } from '@/types';

export default function Show({ service }: ServicesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(servicesDestroy(service.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Service — ${service.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={services()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={servicesEdit(service.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <Card className="max-w-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                            {service.name}
                            <Badge variant={service.is_active ? 'default' : 'secondary'}>
                                {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="grid gap-0.5">
                            <p className="text-xs font-medium text-muted-foreground">Description</p>
                            <p className="text-sm">{service.description ?? '—'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-0.5">
                                <p className="text-xs font-medium text-muted-foreground">Price</p>
                                <p className="text-sm font-semibold">
                                    ₱{Number(service.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="grid gap-0.5">
                                <p className="text-xs font-medium text-muted-foreground">Duration</p>
                                <p className="text-sm">{service.duration_minutes} minutes</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-0.5">
                                <p className="text-xs font-medium text-muted-foreground">Created</p>
                                <p className="text-sm">{service.created_at}</p>
                            </div>
                            <div className="grid gap-0.5">
                                <p className="text-xs font-medium text-muted-foreground">Updated</p>
                                <p className="text-sm">{service.updated_at}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Service</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">{service.name}</span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Service'}
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
            { title: 'Services', href: services() },
            { title: 'View Service', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
