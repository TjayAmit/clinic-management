import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    CalendarPlus,
    CreditCard,
    Droplet,
    Heart,
    Pencil,
    Phone,
    Star,
    Trash2,
    User,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
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
        router.patch(
            patientsToggleRegular.url(patient.id),
            {},
            {
                onFinish: () => setIsTogglingRegular(false),
            },
        );
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

    const age = getAge(patient.date_of_birth);
    const patientId = `PT-${String(patient.id).padStart(6, '0')}`;
    const appointments = patient.appointments ?? [];

    return (
        <>
            <Head title={`Patient — ${patient.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 bg-muted p-4 lg:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <Link
                            href={patients()}
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Patient Record
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleRegular}
                            disabled={isTogglingRegular}
                            className="gap-1.5"
                        >
                            <Star
                                className={`h-3.5 w-3.5 ${patient.is_regular ? 'fill-current text-amber-500' : ''}`}
                            />
                            {patient.is_regular ? 'Regular' : 'Mark Regular'}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDelete(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Hero card */}
                <div className="flex flex-col gap-4 rounded-2xl bg-header p-5 text-header-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-header-foreground/20 text-xl font-semibold">
                            {initials(patient.first_name, patient.last_name)}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-semibold">
                                    {patient.full_name}
                                </h2>
                                {patient.is_regular && (
                                    <span className="flex items-center gap-1 rounded-full bg-header-foreground/20 px-2 py-0.5 text-xs font-medium">
                                        <Star className="h-3 w-3 fill-current" />
                                        Regular
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-header-foreground/80">
                                {patient.gender && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="capitalize">
                                            {patient.gender}
                                        </span>
                                        {age !== null && (
                                            <span>· {age} years</span>
                                        )}
                                    </span>
                                )}
                                {patient.blood_type && (
                                    <span className="flex items-center gap-1">
                                        <Droplet className="h-3.5 w-3.5" />
                                        Blood type {patient.blood_type}
                                    </span>
                                )}
                                {patient.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3.5 w-3.5" />
                                        {patient.phone}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    {patientId}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-background text-foreground hover:bg-muted"
                        >
                            <Link
                                href={`/appointments/create?patient_id=${patient.id}`}
                            >
                                <CalendarPlus className="mr-2 h-4 w-4" />
                                Book
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-background text-foreground hover:bg-muted"
                        >
                            <Link href={patientsEdit(patient.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                </div>

                {patient.allergies && (
                    <div className="flex items-center gap-3 rounded-xl bg-header/10 px-4 py-3 text-sm text-header">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p>
                            <span className="font-semibold">Allergy alert</span>{' '}
                            — {patient.allergies}. Confirm before prescribing.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Demographics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <FieldRow
                                label="Full name"
                                value={patient.full_name}
                            />
                            <FieldRow
                                label="Date of birth"
                                value={patient.date_of_birth}
                            />
                            <FieldRow
                                label="Age"
                                value={age !== null ? `${age} years` : '—'}
                            />
                            <FieldRow
                                label="Gender"
                                value={
                                    patient.gender
                                        ? capitalize(patient.gender)
                                        : '—'
                                }
                            />
                            <FieldRow
                                label="Civil status"
                                value={patient.civil_status}
                            />
                            <FieldRow
                                label="Occupation"
                                value={patient.occupation}
                            />
                            <FieldRow label="Email" value={patient.email} />
                            <FieldRow label="Address" value={patient.address} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    Emergency contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {patient.emergency_contact_name ? (
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {initials(
                                                patient.emergency_contact_name,
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {patient.emergency_contact_name}
                                            </p>
                                            {patient.emergency_contact_relationship && (
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        patient.emergency_contact_relationship
                                                    }
                                                    {patient.emergency_contact_phone
                                                        ? ` · ${patient.emergency_contact_phone}`
                                                        : ''}
                                                </p>
                                            )}
                                            {!patient.emergency_contact_relationship &&
                                                patient.emergency_contact_phone && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            patient.emergency_contact_phone
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        No emergency contact on file.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                    Medical details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    {patient.blood_type && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                            <Droplet className="h-3.5 w-3.5" />
                                            {patient.blood_type}
                                        </span>
                                    )}
                                    {patient.allergies && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            {patient.allergies} allergy
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Medical history
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {patient.medical_history ||
                                            'No chronic conditions on file.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {appointments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Appointment history
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center justify-between gap-4 px-6 py-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={cn(
                                                    'h-2 w-2 rounded-full',
                                                    statusDotClass(
                                                        appointment.status,
                                                    ),
                                                )}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {appointment.service
                                                        ?.name ?? 'Appointment'}
                                                </p>
                                                {appointment.doctor && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Dr.{' '}
                                                        {
                                                            appointment.doctor
                                                                .user?.name
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-3 text-xs">
                                            <span className="text-muted-foreground">
                                                {new Date(
                                                    appointment.appointment_date +
                                                        'T00:00:00',
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    statusBadgeClass(
                                                        appointment.status,
                                                    ),
                                                )}
                                            >
                                                {statusLabel(
                                                    appointment.status,
                                                )}
                                            </span>
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
                                <DialogTitle className="text-base font-semibold">
                                    Delete Patient
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">
                                        {patient.full_name}
                                    </span>
                                    ? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDelete(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Patient'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function FieldRow({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">
                {value ?? '—'}
            </span>
        </div>
    );
}

function getAge(dateOfBirth: string): number | null {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}

function initials(name: string): string;
function initials(firstName: string, lastName: string): string;
function initials(firstName: string, lastName?: string): string {
    if (lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    const parts = firstName.trim().split(/\s+/);

    if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }

    return firstName.charAt(0).toUpperCase();
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

const STATUS_MAP: Record<
    string,
    { dot: string; badge: string; label: string }
> = {
    completed: {
        dot: 'bg-success',
        badge: 'bg-success text-success-foreground',
        label: 'Completed',
    },
    confirmed: {
        dot: 'bg-primary',
        badge: 'bg-primary text-primary-foreground',
        label: 'Confirmed',
    },
    in_queue: {
        dot: 'bg-primary',
        badge: 'bg-primary text-primary-foreground',
        label: 'In Queue',
    },
    in_progress: {
        dot: 'bg-secondary',
        badge: 'bg-secondary text-secondary-foreground',
        label: 'In Progress',
    },
    needs_follow_up: {
        dot: 'bg-primary',
        badge: 'bg-primary text-primary-foreground',
        label: 'Needs Follow-up',
    },
    cancelled: {
        dot: 'bg-destructive',
        badge: 'bg-destructive text-destructive-foreground',
        label: 'Cancelled',
    },
    no_show: {
        dot: 'bg-muted',
        badge: 'bg-muted text-muted-foreground',
        label: 'No Show',
    },
    pending: {
        dot: 'bg-muted',
        badge: 'bg-muted text-muted-foreground',
        label: 'Pending',
    },
};

function statusDotClass(status: string): string {
    return STATUS_MAP[status]?.dot ?? 'bg-muted';
}

function statusBadgeClass(status: string): string {
    return STATUS_MAP[status]?.badge ?? 'bg-muted text-muted-foreground';
}

function statusLabel(status: string): string {
    return (
        STATUS_MAP[status]?.label ??
        status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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
