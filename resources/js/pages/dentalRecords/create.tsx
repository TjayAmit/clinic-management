import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { index as dentalRecords, store as dentalRecordsStore } from '@/routes/dental-records';
import type { DentalRecordsFormProps } from '@/types';

export default function Create({ patients, doctors, patient_visit }: DentalRecordsFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        patient_visit_id: patient_visit ? String(patient_visit.id) : '',
        patient_id: patient_visit?.patient ? String(patient_visit.patient.id) : '',
        dentist_id: patient_visit?.dentist ? String(patient_visit.dentist.id) : '',
        chief_complaint: '',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(dentalRecordsStore.url());
    };

    return (
        <>
            <Head title="New Dental Record" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={dentalRecords()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Patient & Dentist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient_visit ? (
                                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                                    <p className="font-medium">Linked Visit</p>
                                    <p className="mt-1 text-muted-foreground">
                                        Patient:{' '}
                                        <span className="text-foreground">{patient_visit.patient?.full_name}</span>
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        Dentist:{' '}
                                        <span className="text-foreground">{patient_visit.dentist?.user?.name}</span>
                                    </p>
                                    <p className="mt-0.5 text-muted-foreground">
                                        Visit date:{' '}
                                        <span className="text-foreground">{patient_visit.visited_at}</span>
                                    </p>
                                </div>
                            ) : (
                                <>
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
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.patient_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Dentist <span className="text-destructive">*</span></Label>
                                        <Select value={data.dentist_id} onValueChange={(v) => setData('dentist_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select dentist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {doctors.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.user?.name ?? `Dentist #${d.id}`}
                                                        {d.specialization ? ` — ${d.specialization}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.dentist_id} />
                                    </div>
                                </>
                            )}

                            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                                <p>This record will be permanently associated with the selected patient and dentist and cannot be reassigned after creation.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Clinical Information</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="chief_complaint">
                                    Chief Complaint <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="chief_complaint"
                                    value={data.chief_complaint}
                                    onChange={(e) => setData('chief_complaint', e.target.value)}
                                    placeholder="Patient's primary complaint or reason for visit"
                                    rows={3}
                                    required
                                />
                                <InputError message={errors.chief_complaint} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="diagnosis">Diagnosis</Label>
                                <Textarea
                                    id="diagnosis"
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    placeholder="Clinical diagnosis"
                                    rows={3}
                                />
                                <InputError message={errors.diagnosis} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="treatment">Treatment</Label>
                                <Textarea
                                    id="treatment"
                                    value={data.treatment}
                                    onChange={(e) => setData('treatment', e.target.value)}
                                    placeholder="Dental treatment performed"
                                    rows={3}
                                />
                                <InputError message={errors.treatment} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prescription">Prescription</Label>
                                <Textarea
                                    id="prescription"
                                    value={data.prescription}
                                    onChange={(e) => setData('prescription', e.target.value)}
                                    placeholder="Medications, dosage, and instructions"
                                    rows={3}
                                />
                                <InputError message={errors.prescription} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional observations or follow-up notes"
                                    rows={2}
                                />
                                <InputError message={errors.notes} />
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create Record'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={dentalRecords()}>Cancel</Link>
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
            { title: 'Dental Records', href: dentalRecords() },
            { title: 'Create', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
