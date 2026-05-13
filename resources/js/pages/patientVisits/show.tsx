import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, LogIn, LogOut, Trash2 } from 'lucide-react';
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
    index as patientVisits,
    destroy as patientVisitsDestroy,
    checkIn as patientVisitsCheckIn,
    checkOut as patientVisitsCheckOut,
} from '@/routes/patient-visits';
import { show as dentalRecordsShow, create as dentalRecordsCreate } from '@/routes/dental-records';
import type { PatientVisitsShowProps } from '@/types';

function Field({ label, value, multiline = false }: { label: string; value: string | number | null | undefined; multiline?: boolean }) {
    return (
        <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {value != null ? (
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

export default function Show({ visit }: PatientVisitsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(patientVisitsDestroy(visit.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const visitStatus = () => {
        if (visit.check_out_at) return { label: 'Checked Out', variant: 'outline' as const };
        if (visit.check_in_at) return { label: 'Checked In', variant: 'default' as const };
        return { label: 'Scheduled', variant: 'secondary' as const };
    };

    const status = visitStatus();

    return (
        <>
            <Head title={`Visit — ${visit.patient?.full_name ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={patientVisits()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {!visit.check_in_at && (
                            <Button size="sm" onClick={() => router.patch(patientVisitsCheckIn(visit.id).url)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Check In
                            </Button>
                        )}
                        {visit.check_in_at && !visit.check_out_at && (
                            <Button size="sm" variant="outline" onClick={() => router.patch(patientVisitsCheckOut(visit.id).url)}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Check Out
                            </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                Visit Details
                                <Badge variant={status.variant}>{status.label}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Patient" value={visit.patient?.full_name} />
                            <Field label="Dentist" value={visit.dentist?.user?.name} />
                            <Field label="Specialization" value={visit.dentist?.specialization} />
                            <Field label="Appointment Service" value={visit.appointment?.service?.name} />
                            <Field label="Visited At" value={visit.visited_at} />
                            <Field label="Check-In" value={visit.check_in_at} />
                            <Field label="Check-Out" value={visit.check_out_at} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Vitals</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Blood Pressure" value={visit.blood_pressure} />
                            <Field label="Temperature (°C)" value={visit.temperature} />
                            <Field label="Weight (kg)" value={visit.weight} />
                            <Field label="Heart Rate (bpm)" value={visit.heart_rate} />
                            {visit.notes && <Field label="Notes" value={visit.notes} multiline />}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Dental Record</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            {visit.dentalRecord ? (
                                <div className="space-y-3">
                                    <p className="text-muted-foreground">A dental record exists for this visit.</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={dentalRecordsShow(visit.dentalRecord.id)}>
                                            View Dental Record
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-muted-foreground">No dental record yet.</p>
                                    {visit.check_in_at && (
                                        <Button size="sm" asChild>
                                            <Link href={`${dentalRecordsCreate().url}?visit_id=${visit.id}`}>
                                                Create Dental Record
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
                                <DialogTitle className="text-base font-semibold">Delete Visit</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete this visit for{' '}
                                    <span className="font-medium text-foreground">{visit.patient?.full_name}</span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Visit'}
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
            { title: 'Patient Visits', href: patientVisits() },
            { title: 'View Visit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
