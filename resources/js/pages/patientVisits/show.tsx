import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    ExternalLink,
    Heart,
    LogIn,
    LogOut,
    Phone,
    Scale,
    Stethoscope,
    Thermometer,
    Trash2,
    UserRound,
} from 'lucide-react';
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
import { show as dentalRecordsShow, create as dentalRecordsCreate } from '@/routes/dental-records';
import {
    index as patientVisits,
    destroy as patientVisitsDestroy,
    checkIn as patientVisitsCheckIn,
    checkOut as patientVisitsCheckOut,
} from '@/routes/patient-visits';
import type { PatientVisitsShowProps } from '@/types';

// ---------------------------------------------------------------------------
// Datetime helpers
// ---------------------------------------------------------------------------

function formatDate(dt: string): string {
    return new Date(dt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatTime(dt: string): string {
    // Handle bare time strings like "09:30:00" by prefixing a dummy date
    const normalized = /^\d{2}:\d{2}/.test(dt) ? `1970-01-01T${dt}` : dt;
    return new Date(normalized).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function durationBetween(a: string, b: string): string {
    const diffMs = Math.abs(new Date(b).getTime() - new Date(a).getTime());
    const totalMinutes = Math.round(diffMs / 60000);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

// ---------------------------------------------------------------------------
// Small shared sub-components
// ---------------------------------------------------------------------------

function RecordField({
    label,
    value,
    multiline = false,
    prominent = false,
}: {
    label: string;
    value: string | null | undefined;
    multiline?: boolean;
    prominent?: boolean;
}) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            {value != null && value !== '' ? (
                multiline ? (
                    <p className="whitespace-pre-wrap text-sm">{value}</p>
                ) : (
                    <p className={prominent ? 'font-medium text-sm' : 'text-sm'}>{value}</p>
                )
            ) : (
                <p className="text-sm text-muted-foreground">—</p>
            )}
        </div>
    );
}

interface VitalTileProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string | number | null | undefined;
    unit?: string;
}

function VitalTile({ icon, iconBg, label, value, unit }: VitalTileProps) {
    return (
        <div className="rounded-lg border bg-card p-3">
            <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full ${iconBg}`}>
                {icon}
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            {value != null ? (
                <p className="mt-1 text-lg font-semibold">
                    {value}
                    {unit && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{unit}</span>}
                </p>
            ) : (
                <p className="mt-1 text-lg font-semibold text-muted-foreground">—</p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

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
        if (visit.check_out_at) {
            return { label: 'Checked Out', variant: 'outline' as const };
        }

        if (visit.check_in_at) {
            return { label: 'Checked In', variant: 'default' as const };
        }

        return { label: 'Scheduled', variant: 'secondary' as const };
    };

    const status = visitStatus();

    const allVitalsNull =
        visit.blood_pressure == null &&
        visit.temperature == null &&
        visit.weight == null &&
        visit.heart_rate == null;

    // Patient initials (up to 2 chars)
    const initials = [visit.patient?.first_name?.[0], visit.patient?.last_name?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase();

    return (
        <>
            <Head title={`Visit — ${visit.patient?.full_name ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={patientVisits()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {!visit.check_in_at && (
                            <Button size="sm" onClick={() => router.patch(patientVisitsCheckIn(visit.id).url)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Check In
                            </Button>
                        )}
                        {visit.check_in_at && !visit.check_out_at && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.patch(patientVisitsCheckOut(visit.id).url)}
                            >
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

                {/* Patient + visit header strip */}
                <div className="flex flex-col gap-4 rounded-lg border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Patient identity */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground">
                            {initials || <UserRound className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="text-lg font-semibold leading-tight">
                                {visit.patient?.full_name ?? 'Unknown patient'}
                            </p>
                            {visit.patient?.phone && (
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5" />
                                    {visit.patient.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Visit timeline */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(visit.visited_at)}</span>
                        </span>

                        <span className="text-muted-foreground" aria-hidden>·</span>

                        <span className="flex items-center gap-1.5">
                            <LogIn className="h-4 w-4 text-muted-foreground" />
                            {visit.check_in_at ? (
                                <span>{formatTime(visit.check_in_at)}</span>
                            ) : (
                                <span className="text-muted-foreground">Not checked in</span>
                            )}
                        </span>

                        <span className="text-muted-foreground" aria-hidden>·</span>

                        <span className="flex items-center gap-1.5">
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                            {visit.check_out_at ? (
                                <span>{formatTime(visit.check_out_at)}</span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </span>

                        {visit.check_in_at && visit.check_out_at && (
                            <span className="text-muted-foreground">
                                ({durationBetween(visit.check_in_at, visit.check_out_at)})
                            </span>
                        )}
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Left column */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Vitals card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    Vitals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {allVitalsNull ? (
                                    <p className="text-sm text-muted-foreground">No vitals recorded for this visit.</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <VitalTile
                                            icon={<Heart className="h-4 w-4 text-red-500" />}
                                            iconBg="bg-red-50 dark:bg-red-950/40"
                                            label="Heart Rate"
                                            value={visit.heart_rate}
                                            unit="bpm"
                                        />
                                        <VitalTile
                                            icon={<Thermometer className="h-4 w-4 text-amber-500" />}
                                            iconBg="bg-amber-50 dark:bg-amber-950/40"
                                            label="Temperature"
                                            value={visit.temperature}
                                            unit="°C"
                                        />
                                        <VitalTile
                                            icon={<Scale className="h-4 w-4 text-blue-500" />}
                                            iconBg="bg-blue-50 dark:bg-blue-950/40"
                                            label="Weight"
                                            value={visit.weight}
                                            unit="kg"
                                        />
                                        <VitalTile
                                            icon={<Activity className="h-4 w-4 text-purple-500" />}
                                            iconBg="bg-purple-50 dark:bg-purple-950/40"
                                            label="Blood Pressure"
                                            value={visit.blood_pressure}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Dental record card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                    Dental Record
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {visit.dentalRecord ? (
                                    <div className="space-y-4">
                                        <RecordField
                                            label="Chief Complaint"
                                            value={visit.dentalRecord.chief_complaint}
                                            prominent
                                        />
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <RecordField label="Diagnosis" value={visit.dentalRecord.diagnosis} />
                                            <RecordField label="Treatment" value={visit.dentalRecord.treatment} />
                                        </div>
                                        <RecordField label="Prescription" value={visit.dentalRecord.prescription} />
                                        {visit.dentalRecord.notes && (
                                            <RecordField
                                                label="Clinical Notes"
                                                value={visit.dentalRecord.notes}
                                                multiline
                                            />
                                        )}
                                        <div className="pt-1">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={dentalRecordsShow(visit.dentalRecord.id)}>
                                                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                                    View Full Record
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ) : visit.check_in_at ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">No dental record yet.</p>
                                        <Button size="sm" asChild>
                                            <Link href={`${dentalRecordsCreate().url}?visit_id=${visit.id}`}>
                                                Create Dental Record
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Patient hasn't checked in yet. A dental record can be created after check-in.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notes card — only when present */}
                        {visit.notes && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap text-sm">{visit.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <div className="flex flex-col gap-4 lg:col-span-1">
                        {/* Appointment card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Appointment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {visit.appointment ? (
                                    <div className="space-y-3">
                                        {visit.appointment.service?.name && (
                                            <p className="text-base font-semibold">
                                                {visit.appointment.service.name}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <span className="text-muted-foreground">Appointment</span>
                                            <Link
                                                href={`/appointments/${visit.appointment.id}`}
                                                className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                #{visit.appointment.id}
                                                <ExternalLink className="h-3 w-3" />
                                            </Link>
                                        </div>
                                        {visit.dentist?.user?.name && (
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Doctor
                                                </p>
                                                <p className="text-sm font-medium">{visit.dentist.user.name}</p>
                                                {visit.dentist.specialization && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {visit.dentist.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Walk-in visit — no linked appointment.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Doctor card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                    Doctor
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {visit.dentist ? (
                                    <div className="space-y-0.5">
                                        <p className="font-semibold">{visit.dentist.user?.name ?? '—'}</p>
                                        {visit.dentist.specialization && (
                                            <p className="text-sm text-muted-foreground">
                                                {visit.dentist.specialization}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No doctor assigned.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete confirmation dialog — unchanged */}
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
