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
    index as features,
    edit as featuresEdit,
    destroy as featuresDestroy,
} from '@/routes/features';
import type { FeaturesShowProps } from '@/types';

export default function Show({ feature }: FeaturesShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(featuresDestroy(feature.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Feature — ${feature.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={features()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={featuresEdit(feature.id)}>
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
                            {feature.name}
                            <Badge variant={feature.is_enabled ? 'default' : 'secondary'}>
                                {feature.is_enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <Field label="Key" value={feature.key} />
                        <Field label="Description" value={feature.description} multiline />
                        {feature.enabledBy && (
                            <Field label="Enabled By" value={feature.enabledBy.name} />
                        )}
                        {feature.enabled_at && (
                            <Field label="Enabled At" value={new Date(feature.enabled_at).toLocaleString()} />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Created" value={feature.created_at} />
                            <Field label="Updated" value={feature.updated_at} />
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
                                <DialogTitle className="text-base font-semibold">Delete Feature</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">{feature.name}</span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Feature'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Field({ label, value, multiline = false }: { label: string; value: string | null | undefined; multiline?: boolean }) {
    return (
        <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {value ? (
                multiline ? (
                    <p className="whitespace-pre-wrap text-sm">{value}</p>
                ) : (
                    <p className="text-sm">{value}</p>
                )
            ) : (
                <p className="text-sm text-muted-foreground">—</p>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Features', href: features() },
            { title: 'View Feature', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
