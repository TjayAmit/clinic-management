import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Pencil, Trash2, XCircle } from 'lucide-react';
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
    index as appointments,
    edit as appointmentsEdit,
    destroy as appointmentsDestroy,
    confirm as appointmentsConfirm,
    cancel as appointmentsCancel,
    complete as appointmentsComplete,
} from '@/routes/appointments';
import type { AppointmentsShowProps, AppointmentStatus } from '@/types';

const STATUS_STYLES: Record<AppointmentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending:   { label: 'Pending',   variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    completed: { label: 'Completed', variant: 'outline' },
    cancelled: { label: 'Cancelled', variant: 'destructive' },
    no_show:   { label: 'No Show',   variant: 'secondary' },
};

export default function Show({ appointment }: AppointmentsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(appointmentsDestroy(appointment.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const handleAction = (action: 'confirm' | 'cancel' | 'complete') => {
        const route = action === 'confirm'
            ? appointmentsConfirm(appointment.id)
            : action === 'cancel'
                ? appointmentsCancel(appointment.id)
                : appointmentsComplete(appointment.id);
        router.patch(route.url);
    };

    const statusStyle = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending;

    return (
        <>
            <Head title={`Appointment — ${appointment.patient?.full_name ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={appointments()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {appointment.status === 'pending' && (
                            <Button size="sm" onClick={() => handleAction('confirm')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                            </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                            <Button size="sm" variant="outline" onClick={() => handleAction('complete')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                            </Button>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button size="sm" variant="outline" onClick={() => handleAction('cancel')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={appointmentsEdit(appointment.id)}>
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
                    {/* Appointment details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                Appointment Details
                                <Badge variant={statusStyle.variant}>{statusStyle.label}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Patient" value={appointment.patient?.full_name} />
                            <Field label="Doctor" value={appointment.doctor?.user?.name} />
                            <Field label="Specialization" value={appointment.doctor?.specialization} />
                            <Field label="Service" value={appointment.service?.name} />
                            <Field label="Date" value={appointment.appointment_date} />
                            <Field label="Time" value={`${appointment.start_time} – ${appointment.end_time}`} />
                            {appointment.notes && <Field label="Notes" value={appointment.notes} multiline />}
                        </CardContent>
                    </Card>

                    {/* Related visit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Visit Record</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {appointment.visit ? (
                                <div className="space-y-3 text-sm">
                                    <p className="text-muted-foreground">
                                        A visit record exists for this appointment.
                                    </p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/patient-visits/${appointment.visit.id}`}>
                                            View Visit Details
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <p className="text-muted-foreground">
                                        No visit record yet.
                                        {appointment.status === 'confirmed' && ' Create one when the patient checks in.'}
                                    </p>
                                    {appointment.status === 'confirmed' && (
                                        <Button size="sm" asChild>
                                            <Link href={`/patient-visits/create?appointment_id=${appointment.id}`}>
                                                Create Visit
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                                <DialogTitle className="text-base font-semibold">Delete Appointment</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this appointment for{' '}
                                    <span className="font-medium text-foreground">{appointment.patient?.full_name}</span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Appointment'}
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
            { title: 'Appointments', href: appointments() },
            { title: 'View Appointment', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
