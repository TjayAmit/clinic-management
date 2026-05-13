import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
    index as dentalRecords,
    edit as dentalRecordsEdit,
    destroy as dentalRecordsDestroy,
} from '@/routes/dental-records';
import { show as patientVisitsShow } from '@/routes/patient-visits';
import type { DentalRecordsShowProps } from '@/types';

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

export default function Show({ record }: DentalRecordsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(dentalRecordsDestroy(record.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Dental Record — ${record.patient?.full_name ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={dentalRecords()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={dentalRecordsEdit(record.id)}>
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

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Record Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Patient" value={record.patient?.full_name} />
                            <Field label="Dentist" value={record.dentist?.user?.name} />
                            <Field label="Specialization" value={record.dentist?.specialization} />
                            <Field label="Date" value={record.created_at} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Clinical Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Chief Complaint" value={record.chief_complaint} multiline />
                            <Field label="Diagnosis" value={record.diagnosis} multiline />
                            <Field label="Treatment" value={record.treatment} multiline />
                            <Field label="Prescription" value={record.prescription} multiline />
                            {record.notes && <Field label="Notes" value={record.notes} multiline />}
                        </CardContent>
                    </Card>

                    {record.patientVisit && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Linked Visit</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <Field label="Visit Date" value={record.patientVisit.visited_at} />
                                <Field label="Service" value={record.patientVisit.appointment?.service?.name} />
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={patientVisitsShow(record.patientVisit.id)}>
                                        View Visit Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Dental Record</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this dental record for{' '}
                                    <span className="font-medium text-foreground">{record.patient?.full_name}</span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Record'}
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
            { title: 'Dental Records', href: dentalRecords() },
            { title: 'View Record', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
