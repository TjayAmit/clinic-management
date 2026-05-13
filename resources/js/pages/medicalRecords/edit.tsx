import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    index as medicalRecords,
    show as medicalRecordsShow,
    update as medicalRecordsUpdate,
} from '@/routes/medical-records';
import { show as patientVisitsShow } from '@/routes/patient-visits';
import type { MedicalRecordsFormProps } from '@/types';

export default function Edit({ record }: MedicalRecordsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        patient_visit_id: record?.patient_visit_id ? String(record.patient_visit_id) : '',
        patient_id: record?.patient_id ? String(record.patient_id) : '',
        doctor_id: record?.doctor_id ? String(record.doctor_id) : '',
        chief_complaint: record?.chief_complaint ?? '',
        diagnosis: record?.diagnosis ?? '',
        prescription: record?.prescription ?? '',
        notes: record?.notes ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (record) {
            put(medicalRecordsUpdate.url(record.id));
        }
    };

    return (
        <>
            <Head title="Edit Medical Record" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={record ? medicalRecordsShow(record.id) : medicalRecords()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Record Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="space-y-3">
                                <div className="grid gap-0.5">
                                    <p className="text-xs font-medium text-muted-foreground">Patient</p>
                                    <p>{record?.patient?.full_name ?? '—'}</p>
                                </div>
                                <div className="grid gap-0.5">
                                    <p className="text-xs font-medium text-muted-foreground">Doctor</p>
                                    <p>{record?.doctor?.user?.name ?? '—'}</p>
                                </div>
                                {record?.doctor?.specialization && (
                                    <div className="grid gap-0.5">
                                        <p className="text-xs font-medium text-muted-foreground">Specialization</p>
                                        <p>{record.doctor.specialization}</p>
                                    </div>
                                )}
                                <div className="grid gap-0.5">
                                    <p className="text-xs font-medium text-muted-foreground">Created</p>
                                    <p>{record?.created_at ?? '—'}</p>
                                </div>
                            </div>

                            {record?.patientVisit && (
                                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                                    <p className="font-medium">Linked Visit</p>
                                    <p className="mt-1 text-muted-foreground">{record.patientVisit.visited_at}</p>
                                    <Link
                                        href={patientVisitsShow(record.patientVisit.id)}
                                        className="mt-2 inline-block text-xs text-primary hover:underline"
                                    >
                                        View visit details →
                                    </Link>
                                </div>
                            )}

                            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-muted-foreground">
                                <p>Patient and doctor cannot be changed after a record is created.</p>
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
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={record ? medicalRecordsShow(record.id) : medicalRecords()}>
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Medical Records', href: medicalRecords() },
            { title: 'Edit Record', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
