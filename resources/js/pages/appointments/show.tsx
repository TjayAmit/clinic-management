import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Eye,
    Hash,
    Mail,
    Pencil,
    Phone,
    Stethoscope,
    Trash2,
    UserRound,
    UserX,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    index as appointments,
    edit as appointmentsEdit,
    destroy as appointmentsDestroy,
    confirm as appointmentsConfirm,
    cancel as appointmentsCancel,
    complete as appointmentsComplete,
    inQueue as appointmentsInQueue,
    inProgress as appointmentsInProgress,
    needsFollowUp as appointmentsNeedsFollowUp,
    noShow as appointmentsNoShow,
} from '@/routes/appointments';
import type { AppointmentsShowProps } from '@/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;

    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatDateShort(dateStr: string): string {
    const date = new Date(`${dateStr}T00:00:00`);

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatVisitDate(isoStr: string): string {
    return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function computeDuration(start: string, end: string, durationMinutes?: number): string {
    if (durationMinutes) {
        if (durationMinutes < 60) {
return `${durationMinutes} min`;
}

        const h = Math.floor(durationMinutes / 60);
        const m = durationMinutes % 60;

        return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);

    if (diff <= 0) {
return '—';
}

    if (diff < 60) {
return `${diff} min`;
}

    const h = Math.floor(diff / 60);
    const m = diff % 60;

    return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function truncate(str: string, max: number): string {
    return str.length > max ? `${str.slice(0, max)}…` : str;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');
}

// ─── patient type classification ────────────────────────────────────────────

type PatientType = 'walk_in_unregistered' | 'walk_in_existing' | 'regular' | 'patient';

function resolvePatientType(isWalkIn: boolean, hasPatient: boolean, isRegular?: boolean): PatientType {
    if (isWalkIn && !hasPatient) {
return 'walk_in_unregistered';
}

    if (isWalkIn && hasPatient) {
return 'walk_in_existing';
}

    if (!isWalkIn && isRegular) {
return 'regular';
}

    return 'patient';
}

const PATIENT_TYPE_BADGE: Record<PatientType, { label: string; className: string }> = {
    walk_in_unregistered: {
        label: 'Walk-in · Unregistered',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    },
    walk_in_existing: {
        label: 'Walk-in · Existing Patient',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    regular: {
        label: 'Regular Patient',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    patient: {
        label: 'Patient',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
};

// ─── sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="text-sm">{value ?? <span className="text-muted-foreground">—</span>}</div>
        </div>
    );
}

// ─── page ────────────────────────────────────────────────────────────────────

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

    const handleAction = (action: 'confirm' | 'cancel' | 'complete' | 'in_queue' | 'in_progress' | 'needs_follow_up' | 'no_show') => {
        const routes = {
            confirm:         appointmentsConfirm(appointment.id),
            cancel:          appointmentsCancel(appointment.id),
            complete:        appointmentsComplete(appointment.id),
            in_queue:        appointmentsInQueue(appointment.id),
            in_progress:     appointmentsInProgress(appointment.id),
            needs_follow_up: appointmentsNeedsFollowUp(appointment.id),
            no_show:         appointmentsNoShow(appointment.id),
        };
        router.patch(routes[action].url);
    };

    // Derived classification
    const patientType = resolvePatientType(
        appointment.is_walk_in,
        !!appointment.patient,
        appointment.patient?.is_regular,
    );
    const typeBadge = PATIENT_TYPE_BADGE[patientType];

    const patientName =
        patientType === 'walk_in_unregistered'
            ? (appointment.walk_in_name ?? 'Walk-in Patient')
            : (appointment.patient?.full_name ?? '—');

    const recentVisits = (appointment.patient?.visits ?? []).slice(0, 5);
    const totalVisits = appointment.patient?.visits?.length ?? 0;
    const hasFollowUps = (appointment.followUps?.length ?? 0) > 0;
    const hasParent = !!appointment.parent_appointment_id;

    return (
        <>
            <Head title={`Appointment — ${patientName}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">

                {/* ── top bar ── */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={appointments()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>

                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={appointment.status} />

                        {appointment.status === 'pending' && (
                            <Button size="sm" onClick={() => handleAction('confirm')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                            </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                            <Button size="sm" onClick={() => handleAction('in_queue')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Add to Queue
                            </Button>
                        )}
                        {appointment.status === 'in_queue' && (
                            <Button size="sm" onClick={() => handleAction('in_progress')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Start
                            </Button>
                        )}
                        {appointment.status === 'in_progress' && (
                            <>
                                <Button size="sm" variant="outline" onClick={() => handleAction('complete')}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleAction('needs_follow_up')}>
                                    Needs Follow-up
                                </Button>
                            </>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'in_queue') && (
                            <Button size="sm" variant="outline" onClick={() => handleAction('no_show')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                No Show
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

                {/* ── patient identity banner ── */}
                <div className="rounded-xl bg-card ring-1 ring-foreground/10">
                    <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Left: avatar + name + type */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
                                {patientType === 'walk_in_unregistered' ? (
                                    <UserX className="h-6 w-6" />
                                ) : (
                                    <span className="text-sm">{getInitials(patientName)}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-lg font-semibold leading-tight">{patientName}</p>
                                <Badge
                                    variant="outline"
                                    className={`w-fit border-transparent text-xs font-medium ${typeBadge.className}`}
                                >
                                    {typeBadge.label}
                                </Badge>
                            </div>
                        </div>

                        {/* Right: contact info for registered patients */}
                        {appointment.patient && (
                            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:items-end">
                                {appointment.patient.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 shrink-0" />
                                        {appointment.patient.phone}
                                    </span>
                                )}
                                {appointment.patient.email && (
                                    <span className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                        {appointment.patient.email}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Allergies alert — spans full width */}
                    {appointment.patient?.allergies && (
                        <div className="flex items-center gap-2.5 border-t border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>
                                <span className="font-medium">Allergies:</span>{' '}
                                {appointment.patient.allergies}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── main grid ── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* ──── left column (2/3) ──── */}
                    <div className="flex flex-col gap-4 lg:col-span-2">

                        {/* Card 1: Appointment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Appointment Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    {/* Service — full width */}
                                    <div className="col-span-2 grid gap-0.5">
                                        <p className="text-xs font-medium text-muted-foreground">Service</p>
                                        <p className="text-sm font-medium">{appointment.service?.name ?? '—'}</p>
                                        {appointment.service?.category && (
                                            <p className="text-xs text-muted-foreground">{appointment.service.category}</p>
                                        )}
                                    </div>

                                    <InfoRow
                                        label="Date"
                                        value={formatDate(appointment.appointment_date)}
                                    />
                                    <InfoRow
                                        label="Time"
                                        value={`${formatTime(appointment.start_time)} – ${formatTime(appointment.end_time)}`}
                                    />
                                    <InfoRow
                                        label="Duration"
                                        value={computeDuration(
                                            appointment.start_time,
                                            appointment.end_time,
                                            appointment.service?.duration_minutes,
                                        )}
                                    />
                                    <InfoRow
                                        label="Doctor"
                                        value={
                                            appointment.dentist ? (
                                                <span>
                                                    {appointment.dentist.user?.name}
                                                    {appointment.dentist.specialization && (
                                                        <span className="ml-1 text-muted-foreground">
                                                            · {appointment.dentist.specialization}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : null
                                        }
                                    />

                                    {appointment.queue?.position != null && (
                                        <InfoRow
                                            label="Queue Position"
                                            value={
                                                <span className="flex items-center gap-1">
                                                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {appointment.queue.position}
                                                </span>
                                            }
                                        />
                                    )}

                                    {appointment.is_walk_in && (
                                        <div className="grid gap-0.5">
                                            <p className="text-xs font-medium text-muted-foreground">Type</p>
                                            <Badge
                                                variant="outline"
                                                className="w-fit border-transparent bg-amber-100 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                            >
                                                Walk-in
                                            </Badge>
                                        </div>
                                    )}

                                    {/* Parent appointment link */}
                                    {appointment.parent && (
                                        <div className="col-span-2 grid gap-0.5">
                                            <p className="text-xs font-medium text-muted-foreground">Follow-up of</p>
                                            <Link
                                                href={`/appointments/${appointment.parent.id}`}
                                                className="text-sm text-primary underline-offset-4 hover:underline"
                                            >
                                                Appointment #{appointment.parent.id}{' '}
                                                <span className="text-muted-foreground">
                                                    ({formatDateShort(appointment.parent.appointment_date)})
                                                </span>
                                            </Link>
                                        </div>
                                    )}

                                    {/* Notes — full width */}
                                    {appointment.notes && (
                                        <div className="col-span-2 grid gap-0.5">
                                            <p className="text-xs font-medium text-muted-foreground">Notes</p>
                                            <p className="whitespace-pre-wrap text-sm">{appointment.notes}</p>
                                        </div>
                                    )}

                                    {/* Teeth involved — full width */}
                                    {appointment.teeth_involved && appointment.teeth_involved.length > 0 && (
                                        <div className="col-span-2 grid gap-1.5">
                                            <p className="text-xs font-medium text-muted-foreground">Teeth Involved</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {appointment.teeth_involved.map((tooth) => (
                                                    <span
                                                        key={tooth}
                                                        className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium"
                                                    >
                                                        {tooth}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Patient Profile */}
                        {appointment.patient ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Patient Profile</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                        <InfoRow
                                            label="Date of Birth"
                                            value={appointment.patient.date_of_birth
                                                ? formatDateShort(appointment.patient.date_of_birth)
                                                : null}
                                        />
                                        <InfoRow label="Blood Type" value={appointment.patient.blood_type} />
                                        <InfoRow label="Phone" value={appointment.patient.phone} />
                                        <InfoRow label="Email" value={appointment.patient.email} />
                                    </div>

                                    {appointment.patient.allergies && (
                                        <div className="mt-4 grid gap-0.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                                            <p className="text-xs font-medium text-destructive">Allergies</p>
                                            <p className="text-sm text-destructive">{appointment.patient.allergies}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            /* Unregistered walk-in placeholder */
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Patient Profile</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <UserX className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p>
                                            Unregistered walk-in. Name on file:{' '}
                                            <span className="font-medium text-foreground">
                                                {appointment.walk_in_name ?? '—'}
                                            </span>
                                            . No patient profile available.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Card 3: Visit History */}
                        {appointment.patient && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Visit History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {recentVisits.length > 0 ? (
                                        <>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                                        <TableHead className="h-9 px-3 text-xs font-medium">Date</TableHead>
                                                        <TableHead className="h-9 px-3 text-xs font-medium">Doctor</TableHead>
                                                        <TableHead className="h-9 px-3 text-xs font-medium">Chief Complaint</TableHead>
                                                        <TableHead className="h-9 w-12 px-3" />
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {recentVisits.map((visit) => {
                                                        const complaint =
                                                            visit.dentalRecord?.chief_complaint ??
                                                            visit.notes ??
                                                            '—';

                                                        return (
                                                            <TableRow key={visit.id} className="border-b border-border/60 last:border-0">
                                                                <TableCell className="px-3 py-2.5 text-xs">
                                                                    {formatVisitDate(visit.visited_at)}
                                                                </TableCell>
                                                                <TableCell className="px-3 py-2.5 text-xs text-muted-foreground">
                                                                    {visit.doctor?.user?.name ?? '—'}
                                                                </TableCell>
                                                                <TableCell className="max-w-[200px] px-3 py-2.5 text-xs text-muted-foreground">
                                                                    {truncate(complaint, 60)}
                                                                </TableCell>
                                                                <TableCell className="px-3 py-2.5">
                                                                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                                                        <Link href={`/patient-visits/${visit.id}`}>
                                                                            <Eye className="h-3.5 w-3.5" />
                                                                            <span className="sr-only">View visit</span>
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>

                                            {totalVisits > 5 && appointment.patient && (
                                                <div className="mt-3 px-3">
                                                    <Link
                                                        href={`/patients/${appointment.patient.id}`}
                                                        className="text-xs text-primary underline-offset-4 hover:underline"
                                                    >
                                                        View all {totalVisits} visits
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No visit history on record.</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* ──── right sidebar (1/3) ──── */}
                    <div className="flex flex-col gap-4">

                        {/* Card A: Current Visit */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Current Visit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {appointment.visit ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle className="h-4 w-4 shrink-0" />
                                            <span className="font-medium">Visit record created</span>
                                        </div>
                                        {appointment.visit.dentalRecord && (
                                            <p className="text-xs text-muted-foreground">Dental record on file</p>
                                        )}
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/patient-visits/${appointment.visit.id}`}>
                                                <Eye className="mr-2 h-3.5 w-3.5" />
                                                View Record
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {appointment.status === 'in_progress' || appointment.status === 'completed'
                                            ? 'No visit record for this appointment.'
                                            : 'Visit record is created when the appointment completes.'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Card B: Follow-ups (only when relevant) */}
                        {(hasParent || hasFollowUps) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Follow-ups</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {appointment.parent && (
                                        <div className="grid gap-1">
                                            <p className="text-xs font-medium text-muted-foreground">Follow-up of</p>
                                            <Link
                                                href={`/appointments/${appointment.parent.id}`}
                                                className="text-sm text-primary underline-offset-4 hover:underline"
                                            >
                                                {formatDateShort(appointment.parent.appointment_date)}
                                            </Link>
                                        </div>
                                    )}

                                    {hasFollowUps && (
                                        <div className="grid gap-2">
                                            <p className="text-xs font-medium text-muted-foreground">Scheduled Follow-ups</p>
                                            <ul className="space-y-1.5">
                                                {appointment.followUps!.map((fu) => (
                                                    <li key={fu.id} className="flex items-center justify-between gap-2">
                                                        <Link
                                                            href={`/appointments/${fu.id}`}
                                                            className="text-sm text-primary underline-offset-4 hover:underline"
                                                        >
                                                            {formatDateShort(fu.appointment_date)}
                                                        </Link>
                                                        <StatusBadge status={fu.status} />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Card C: Service Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    Service Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="grid gap-0.5">
                                    <p className="font-medium">{appointment.service?.name ?? '—'}</p>
                                    {appointment.service?.category && (
                                        <p className="text-xs text-muted-foreground">{appointment.service.category}</p>
                                    )}
                                </div>
                                {appointment.service && (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                                        <div className="grid gap-0.5">
                                            <p className="font-medium text-muted-foreground">Duration</p>
                                            <p>
                                                {computeDuration(
                                                    appointment.start_time,
                                                    appointment.end_time,
                                                    appointment.service.duration_minutes,
                                                )}
                                            </p>
                                        </div>
                                        <div className="grid gap-0.5">
                                            <p className="font-medium text-muted-foreground">Price</p>
                                            <p className="font-medium">
                                                ₱{parseFloat(appointment.service.price).toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {appointment.dentist && (
                                    <div className="flex items-start gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                                        <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>
                                            {appointment.dentist.user?.name}
                                            {appointment.dentist.specialization && (
                                                <> · {appointment.dentist.specialization}</>
                                            )}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* ── delete dialog — unchanged ── */}
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
