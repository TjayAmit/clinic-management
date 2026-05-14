import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarPlus, ClipboardList, Pencil, Star, Trash2 } from 'lucide-react';
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
    index as patients,
    edit as patientsEdit,
    destroy as patientsDestroy,
    toggleRegular as patientsToggleRegular,
} from '@/routes/patients';
import type { PatientsShowProps } from '@/types';

export default function Show({ patient }: PatientsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingRegular, setIsTogglingRegular] = useState(false);

    const handleToggleRegular = () => {
        setIsTogglingRegular(true);
        router.patch(patientsToggleRegular.url(patient.id), {}, {
            onFinish: () => setIsTogglingRegular(false),
        });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(patientsDestroy(patient.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    return (
        <>
            <Head title={`Patient — ${patient.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={patients()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {patient.is_regular && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/appointments/create?patient_id=${patient.id}`}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Book Return Visit
                                </Link>
                            </Button>
                        )}
                        <Button
                            variant={patient.is_regular ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={handleToggleRegular}
                            disabled={isTogglingRegular}
                            className="gap-1.5"
                        >
                            <Star className={`h-3.5 w-3.5 ${patient.is_regular ? 'fill-current text-amber-500' : ''}`} />
                            {patient.is_regular ? 'Regular' : 'Mark Regular'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={patientsEdit(patient.id)}>
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

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Patient info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                Patient Information
                                <div className="flex items-center gap-2">
                                    {patient.is_regular && (
                                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                            <Star className="h-3 w-3 fill-current" />
                                            Regular
                                        </span>
                                    )}
                                    <Badge variant="outline" className="capitalize">{patient.gender}</Badge>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Full Name" value={patient.full_name} />
                            <Field label="Date of Birth" value={patient.date_of_birth} />
                            <Field label="Blood Type" value={patient.blood_type} />
                            <Field label="Phone" value={patient.phone} />
                            <Field label="Email" value={patient.email} />
                            <Field label="Address" value={patient.address} />
                        </CardContent>
                    </Card>

                    {/* Medical info */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Medical Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <Field label="Emergency Contact" value={patient.emergency_contact_name
                                ? `${patient.emergency_contact_name} — ${patient.emergency_contact_phone ?? ''}`
                                : null}
                            />
                            <Field label="Allergies" value={patient.allergies} multiline />
                            <Field label="Medical History" value={patient.medical_history} multiline />
                        </CardContent>
                    </Card>
                </div>

                {/* Visit history */}
                {patient.visits && patient.visits.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClipboardList className="h-4 w-4" />
                                Visit History
                                <Badge variant="secondary">{patient.visits.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {patient.visits.map((visit) => (
                                    <div key={visit.id} className="flex items-start justify-between px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {new Date(visit.visited_at).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                })}
                                            </p>
                                            {visit.doctor && (
                                                <p className="text-sm text-muted-foreground">
                                                    {visit.doctor.user?.name} · {visit.doctor.specialization}
                                                </p>
                                            )}
                                            {visit.medical_record && (
                                                <p className="text-sm text-muted-foreground">
                                                    {visit.medical_record.chief_complaint}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-muted-foreground">
                                            {visit.blood_pressure && <span>BP: {visit.blood_pressure}</span>}
                                            {visit.temperature && <span>Temp: {visit.temperature}°C</span>}
                                            {visit.weight && <span>Weight: {visit.weight} kg</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Patient</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">{patient.full_name}</span>?
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
                            {isDeleting ? 'Deleting…' : 'Delete Patient'}
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
            { title: 'Patients', href: patients() },
            { title: 'View Patient', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
