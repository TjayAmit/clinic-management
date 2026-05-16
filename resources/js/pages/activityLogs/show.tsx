import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { ArrowLeft, Trash2 } from 'lucide-react';
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
import { index as activityLogs, destroy as activityLogsDestroy } from '@/routes/activityLogs';
import type { ActivityLogsShowProps } from '@/types';

export default function Show({ activityLog }: ActivityLogsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(activityLogsDestroy(activityLog.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const getEventBadgeVariant = (eventName: string | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (!eventName) {
return 'secondary';
}

        const eventLower = eventName.toLowerCase();

        if (eventLower.includes('create') || eventLower.includes('add')) {
return 'default';
}

        if (eventLower.includes('update') || eventLower.includes('edit')) {
return 'secondary';
}

        if (eventLower.includes('delete') || eventLower.includes('remove')) {
return 'destructive';
}

        return 'outline';
    };

    const formatJson = (data: Record<string, unknown> | null): string => {
        if (!data) {
return 'N/A';
}

        return JSON.stringify(data, null, 2);
    };

    return (
        <>
            <Head title={`Activity Log - ${activityLog.description.substring(0, 50)}...`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={activityLogs()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-base">Activity Log Details</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant={getEventBadgeVariant(activityLog.event)}>
                                    {activityLog.event || 'N/A'}
                                </Badge>
                                {activityLog.log_name && (
                                    <Badge variant="outline">{activityLog.log_name}</Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm">{activityLog.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Subject Type</p>
                                <p className="text-sm">{activityLog.subject_type || 'N/A'}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Subject ID</p>
                                <p className="text-sm">{activityLog.subject_id || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Causer</p>
                                <p className="text-sm">
                                    {activityLog.causer?.name || activityLog.causer?.email || 'System'}
                                </p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Causer Type</p>
                                <p className="text-sm">{activityLog.causer_type || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p className="text-sm">{activityLog.created_at}</p>
                            </div>
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                                <p className="text-sm">{activityLog.updated_at}</p>
                            </div>
                        </div>

                        {activityLog.attribute_changes && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Attribute Changes</p>
                                <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-40">
                                    {formatJson(activityLog.attribute_changes)}
                                </pre>
                            </div>
                        )}

                        {activityLog.properties && (
                            <div className="grid gap-1">
                                <p className="text-sm font-medium text-muted-foreground">Properties</p>
                                <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-40">
                                    {formatJson(activityLog.properties)}
                                </pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 p-0 overflow-hidden">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Activity Log</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this activity log entry?
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
                            {isDeleting ? 'Deleting…' : 'Delete'}
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
            { title: 'Activity Logs', href: activityLogs() },
            { title: 'View Activity Log', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
