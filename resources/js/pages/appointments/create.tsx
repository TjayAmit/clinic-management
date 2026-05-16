import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, MapPin, Phone, User, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AppointmentCalendar } from '@/components/appointment-calendar';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as appointments, store as appointmentsStore } from '@/routes/appointments';
import type { AppointmentsFormProps } from '@/types';

const NOTES_MAX = 500;

function formatTodayLabel(): string {
    return new Date().toLocaleDateString('en-PH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');

    return `${hh}:${mm}`;
}

export default function Create({ patients, doctors, services, defaultPatientId, isWalkIn }: AppointmentsFormProps) {
    const today = useMemo(() => new Date().toISOString().split('T')[0], []);
    const todayFormatted = formatTodayLabel();

    // 'new' = unregistered name input, 'existing' = patient dropdown
    const [walkInTab, setWalkInTab] = useState<'new' | 'existing'>('new');

    const { data, setData, post, processing, errors, transform } = useForm<{
        patient_id: string;
        walk_in_name: string;
        doctor_id: string;
        service_id: string;
        appointment_date: string;
        start_time: string;
        end_time: string;
        notes: string;
        is_walk_in: boolean;
    }>({
        patient_id: defaultPatientId ? String(defaultPatientId) : '',
        walk_in_name: '',
        doctor_id: '',
        service_id: '',
        appointment_date: isWalkIn ? today : '',
        start_time: '',
        end_time: '',
        notes: '',
        is_walk_in: isWalkIn ?? false,
    });

    transform((formData) => ({
        ...formData,
        patient_id: formData.patient_id || null,
        walk_in_name: formData.walk_in_name || null,
    }));

    // When walk-in is toggled on, pre-fill today and reset to 'new' tab
    function handleWalkInToggle(checked: boolean) {
        setData((prev) => ({
            ...prev,
            is_walk_in: checked,
            appointment_date: checked ? today : '',
            patient_id: checked ? '' : prev.patient_id,
        }));

        if (checked) {
            setWalkInTab('new');
        }
    }

    // When switching to 'existing' tab, clear walk_in_name; switching to 'new', clear patient_id
    function handleTabChange(tab: string) {
        const t = tab as 'new' | 'existing';
        setWalkInTab(t);

        if (t === 'existing') {
            setData('walk_in_name', '');
        } else {
            setData('patient_id', '');
        }
    }

    useEffect(() => {
        if (!data.start_time || !data.service_id) {
            return;
        }

        const service = services.find((s) => String(s.id) === data.service_id);

        if (service) {
            setData('end_time', addMinutes(data.start_time, service.duration_minutes));
        }
    // setData is stable across renders (useForm guarantee)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.start_time, data.service_id]);

    const selectedPatient = patients.find((p) => String(p.id) === data.patient_id);

    const endTimeWarning =
        data.start_time && data.end_time && data.end_time <= data.start_time
            ? 'End time must be after start time.'
            : null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(appointmentsStore.url());
    };

    // ── Walk-in mode ────────────────────────────────────────────────────────────
    if (data.is_walk_in) {
        return (
            <>
                <Head title="Walk-in Registration" />

                <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                    <div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={appointments()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to list
                            </Link>
                        </Button>
                    </div>

                    {/* Walk-in banner */}
                    <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/40">
                        <UserPlus className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                Walk-in Registration
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Today — {todayFormatted}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                            <Switch
                                id="is_walk_in_banner"
                                checked={data.is_walk_in}
                                onCheckedChange={handleWalkInToggle}
                            />
                            <Label htmlFor="is_walk_in_banner" className="text-sm text-amber-800 dark:text-amber-300">
                                Walk-in
                            </Label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Patient section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Patient</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={walkInTab} onValueChange={handleTabChange}>
                                    <TabsList className="mb-4 w-full sm:w-auto">
                                        <TabsTrigger value="new" className="flex-1 sm:flex-none">
                                            New / Unregistered
                                        </TabsTrigger>
                                        <TabsTrigger value="existing" className="flex-1 sm:flex-none">
                                            Existing Patient
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="new">
                                        <div className="space-y-2">
                                            <Label htmlFor="walk_in_name">
                                                Patient Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="walk_in_name"
                                                value={data.walk_in_name}
                                                onChange={(e) => setData('walk_in_name', e.target.value)}
                                                placeholder="Patient name or description, e.g. Maria Santos"
                                                autoFocus
                                            />
                                            <InputError message={errors.walk_in_name} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="existing">
                                        <div className="space-y-2">
                                            <Label>
                                                Patient <span className="text-destructive">*</span>
                                            </Label>
                                            <Select
                                                value={data.patient_id}
                                                onValueChange={(v) => setData('patient_id', v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select patient" />
                                                </SelectTrigger>
                                                <SelectContent position="popper">
                                                    {patients.map((p) => (
                                                        <SelectItem key={p.id} value={String(p.id)}>
                                                            {p.last_name}, {p.first_name}
                                                            {p.phone ? ` — ${p.phone}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.patient_id} />

                                            {selectedPatient && (
                                                <div className="mt-2 rounded-md border bg-muted/40 p-3 text-sm">
                                                    <div className="mb-2 font-medium text-foreground">
                                                        {selectedPatient.first_name} {selectedPatient.last_name}
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                                                        {selectedPatient.phone && (
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <Phone className="h-3.5 w-3.5" />
                                                                <span>{selectedPatient.phone}</span>
                                                            </div>
                                                        )}
                                                        {selectedPatient.email && (
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <Mail className="h-3.5 w-3.5" />
                                                                <span>{selectedPatient.email}</span>
                                                            </div>
                                                        )}
                                                        {selectedPatient.address && (
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                <span>{selectedPatient.address}</span>
                                                            </div>
                                                        )}
                                                        {selectedPatient.date_of_birth && (
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <User className="h-3.5 w-3.5" />
                                                                <span>DOB: {selectedPatient.date_of_birth}</span>
                                                            </div>
                                                        )}
                                                        {selectedPatient.blood_type && (
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <span className="font-semibold text-foreground">Blood Type:</span>
                                                                <span>{selectedPatient.blood_type}</span>
                                                            </div>
                                                        )}
                                                        {selectedPatient.allergies && (
                                                            <div className="flex items-center gap-1.5 text-amber-600">
                                                                <span className="font-semibold">Allergies:</span>
                                                                <span>{selectedPatient.allergies}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Clinic details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Clinic Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Doctor <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={data.doctor_id}
                                            onValueChange={(v) => setData('doctor_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select doctor" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {doctors.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.user?.name ?? `Doctor #${d.id}`} — {d.specialization}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.doctor_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Service <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={data.service_id}
                                            onValueChange={(v) => setData('service_id', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {services.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.name} — {s.duration_minutes} min · ₱{Number(s.price).toLocaleString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.service_id} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {/* Date — read-only for walk-ins */}
                                <div className="space-y-1.5">
                                    <Label>Date</Label>
                                    <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                                        {todayFormatted}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Walk-ins are always registered for today.</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time_walkin">
                                            Start Time <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="start_time_walkin"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.start_time} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time_walkin">
                                            End Time <span className="text-destructive">*</span>
                                            <span className="ml-1 text-xs text-muted-foreground">(auto from service)</span>
                                        </Label>
                                        <Input
                                            id="end_time_walkin"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            required
                                        />
                                        {endTimeWarning && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400">{endTimeWarning}</p>
                                        )}
                                        <InputError message={errors.end_time} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes_walkin">Notes</Label>
                                    <div className="relative">
                                        <Textarea
                                            id="notes_walkin"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value.slice(0, NOTES_MAX))}
                                            placeholder="Any relevant notes for this appointment…"
                                            rows={2}
                                            maxLength={NOTES_MAX}
                                        />
                                        <p className="mt-1 text-right text-xs text-muted-foreground">
                                            {data.notes.length}/{NOTES_MAX}
                                        </p>
                                    </div>
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Registering…' : 'Register Walk-in'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={appointments()}>Cancel</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </>
        );
    }

    // ── Regular appointment mode ─────────────────────────────────────────────────
    return (
        <>
            <Head title="New Appointment" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={appointments()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <AppointmentCalendar
                            selectedDate={data.appointment_date || undefined}
                            onDateSelect={(d) => setData('appointment_date', d)}
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Patient & Service</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label>Patient <span className="text-destructive">*</span></Label>
                                        <Select value={data.patient_id} onValueChange={(v) => setData('patient_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select patient" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {patients.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                        {p.last_name}, {p.first_name}
                                                        {p.phone ? ` — ${p.phone}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.patient_id} />
                                    </div>

                                    {selectedPatient && (
                                        <div className="col-span-full rounded-md border bg-muted/40 p-3 text-sm">
                                            <div className="mb-2 font-medium text-foreground">
                                                {selectedPatient.first_name} {selectedPatient.last_name}
                                            </div>
                                            <div className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                                                {selectedPatient.phone && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span>{selectedPatient.phone}</span>
                                                    </div>
                                                )}
                                                {selectedPatient.email && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <span>{selectedPatient.email}</span>
                                                    </div>
                                                )}
                                                {selectedPatient.address && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span>{selectedPatient.address}</span>
                                                    </div>
                                                )}
                                                {selectedPatient.date_of_birth && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <User className="h-3.5 w-3.5" />
                                                        <span>DOB: {selectedPatient.date_of_birth}</span>
                                                    </div>
                                                )}
                                                {selectedPatient.blood_type && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <span className="font-semibold text-foreground">Blood Type:</span>
                                                        <span>{selectedPatient.blood_type}</span>
                                                    </div>
                                                )}
                                                {selectedPatient.allergies && (
                                                    <div className="flex items-center gap-1.5 text-amber-600">
                                                        <span className="font-semibold">Allergies:</span>
                                                        <span>{selectedPatient.allergies}</span>
                                                    </div>
                                                )}
                                                {selectedPatient.emergency_contact_name && (
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <span className="font-semibold text-foreground">Emergency:</span>
                                                        <span>
                                                            {selectedPatient.emergency_contact_name}
                                                            {selectedPatient.emergency_contact_phone
                                                                ? ` — ${selectedPatient.emergency_contact_phone}`
                                                                : ''}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Doctor <span className="text-destructive">*</span></Label>
                                        <Select value={data.doctor_id} onValueChange={(v) => setData('doctor_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select doctor" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {doctors.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.user?.name ?? `Doctor #${d.id}`} — {d.specialization}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.doctor_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Service <span className="text-destructive">*</span></Label>
                                        <Select value={data.service_id} onValueChange={(v) => setData('service_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                            <SelectContent position="popper">
                                                {services.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.name} — {s.duration_minutes} min · ₱{Number(s.price).toLocaleString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.service_id} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                {!data.appointment_date && (
                                    <p className="text-xs text-muted-foreground">Select a date from the calendar on the left.</p>
                                )}
                                {data.appointment_date && (
                                    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                                        <span className="text-muted-foreground">Date:</span>
                                        <span className="font-medium">
                                            {new Date(data.appointment_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                <InputError message={errors.appointment_date} />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Start Time <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={(e) => setData('start_time', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.start_time} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">
                                            End Time <span className="text-destructive">*</span>
                                            <span className="ml-1 text-xs text-muted-foreground">(auto from service)</span>
                                        </Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={(e) => setData('end_time', e.target.value)}
                                            required
                                        />
                                        {endTimeWarning && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400">{endTimeWarning}</p>
                                        )}
                                        <InputError message={errors.end_time} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <div className="relative">
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value.slice(0, NOTES_MAX))}
                                            placeholder="Any relevant notes for this appointment…"
                                            rows={4}
                                            maxLength={NOTES_MAX}
                                        />
                                        <p className="mt-1 text-right text-xs text-muted-foreground">
                                            {data.notes.length}/{NOTES_MAX}
                                        </p>
                                    </div>
                                    <InputError message={errors.notes} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="is_walk_in"
                                        checked={data.is_walk_in}
                                        onCheckedChange={handleWalkInToggle}
                                    />
                                    <Label htmlFor="is_walk_in">Walk-in patient</Label>
                                </div>

                                <div className="mt-auto flex items-center gap-3 pt-1">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Booking…' : 'Book Appointment'}
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={appointments()}>Cancel</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            </div>
        </>
    );
}

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Appointments', href: appointments() },
            { title: 'Book Appointment', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
