import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as appointments, store as appointmentsStore } from '@/routes/appointments';
import type { AppointmentsFormProps } from '@/types';

function addMinutes(time: string, minutes: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const hh = String(Math.floor(total / 60) % 24).padStart(2, '0');
    const mm = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}`;
}

export default function Create({ patients, doctors, services, defaultPatientId }: AppointmentsFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: defaultPatientId ? String(defaultPatientId) : '',
        dentist_id: '',
        service_id: '',
        appointment_date: '',
        start_time: '',
        end_time: '',
        notes: '',
        is_walk_in: false,
    });

    useEffect(() => {
        if (!data.start_time || !data.service_id) return;
        const service = services.find((s) => String(s.id) === data.service_id);
        if (service) {
            setData('end_time', addMinutes(data.start_time, service.duration_minutes));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.start_time, data.service_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(appointmentsStore.url());
    };

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

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Patient & Service</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Patient <span className="text-destructive">*</span></Label>
                                <Select value={data.patient_id} onValueChange={(v) => setData('patient_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select patient" />
                                    </SelectTrigger>
                                    <SelectContent>
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

                            <div className="space-y-2">
                                <Label>Doctor <span className="text-destructive">*</span></Label>
                                <Select value={data.dentist_id} onValueChange={(v) => setData('dentist_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {d.user?.name ?? `Doctor #${d.id}`} — {d.specialization}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.dentist_id} />
                            </div>

                            <div className="space-y-2">
                                <Label>Service <span className="text-destructive">*</span></Label>
                                <Select value={data.service_id} onValueChange={(v) => setData('service_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name} — {s.duration_minutes} min · ₱{Number(s.price).toLocaleString()}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.service_id} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="appointment_date">Date <span className="text-destructive">*</span></Label>
                                <Input
                                    id="appointment_date"
                                    type="date"
                                    value={data.appointment_date}
                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.appointment_date} />
                            </div>

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
                                    <InputError message={errors.end_time} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any relevant notes for this appointment…"
                                    rows={4}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_walk_in"
                                    checked={data.is_walk_in}
                                    onCheckedChange={(v) => setData('is_walk_in', Boolean(v))}
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
