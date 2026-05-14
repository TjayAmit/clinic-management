import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import {
    index as patients,
    show as patientsShow,
    update as patientsUpdate,
} from '@/routes/patients';
import type { PatientsFormProps } from '@/types';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Edit({ patient }: PatientsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: patient?.first_name ?? '',
        last_name: patient?.last_name ?? '',
        date_of_birth: patient?.date_of_birth ?? '',
        gender: patient?.gender ?? '',
        blood_type: patient?.blood_type ?? '',
        phone: patient?.phone ?? '',
        email: patient?.email ?? '',
        address: patient?.address ?? '',
        emergency_contact_name: patient?.emergency_contact_name ?? '',
        emergency_contact_phone: patient?.emergency_contact_phone ?? '',
        allergies: patient?.allergies ?? '',
        medical_history: patient?.medical_history ?? '',
        is_regular: patient?.is_regular ?? false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (patient) put(patientsUpdate.url(patient.id));
    };

    return (
        <>
            <Head title="Edit Patient" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={patient ? patientsShow(patient.id) : patients()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="First name"
                                    required
                                />
                                <InputError message={errors.first_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name <span className="text-destructive">*</span></Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Last name"
                                    required
                                />
                                <InputError message={errors.last_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date_of_birth} />
                            </div>

                            <div className="space-y-2">
                                <Label>Gender <span className="text-destructive">*</span></Label>
                                <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.gender} />
                            </div>

                            <div className="space-y-2">
                                <Label>Blood Type</Label>
                                <Select value={data.blood_type} onValueChange={(v) => setData('blood_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BLOOD_TYPES.map((bt) => (
                                            <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.blood_type} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="+63 9XX XXX XXXX"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="patient@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Street, City"
                                />
                                <InputError message={errors.address} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Medical Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                    <Input
                                        id="emergency_contact_name"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                        placeholder="Contact person"
                                    />
                                    <InputError message={errors.emergency_contact_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                    <Input
                                        id="emergency_contact_phone"
                                        value={data.emergency_contact_phone}
                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                        placeholder="+63 9XX XXX XXXX"
                                    />
                                    <InputError message={errors.emergency_contact_phone} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="allergies">Known Allergies</Label>
                                <Textarea
                                    id="allergies"
                                    value={data.allergies}
                                    onChange={(e) => setData('allergies', e.target.value)}
                                    placeholder="List any known allergies…"
                                    rows={3}
                                />
                                <InputError message={errors.allergies} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="medical_history">Medical History</Label>
                                <Textarea
                                    id="medical_history"
                                    value={data.medical_history}
                                    onChange={(e) => setData('medical_history', e.target.value)}
                                    placeholder="Relevant past illnesses, surgeries, conditions…"
                                    rows={5}
                                />
                                <InputError message={errors.medical_history} />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_regular" className="cursor-pointer text-sm font-medium">Regular Patient</Label>
                                    <p className="text-xs text-muted-foreground">Mark to allow advance appointment booking for return visits.</p>
                                </div>
                                <Switch
                                    id="is_regular"
                                    checked={data.is_regular}
                                    onCheckedChange={(v) => setData('is_regular', v)}
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={patient ? patientsShow(patient.id) : patients()}>Cancel</Link>
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
            { title: 'Patients', href: patients() },
            { title: 'Edit Patient', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
