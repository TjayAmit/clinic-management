import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    index as doctors,
    show as doctorsShow,
    update as doctorsUpdate,
} from '@/routes/doctors';
import type { DoctorsFormProps } from '@/types';

export default function Edit({ doctor, users }: DoctorsFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        user_id: String(doctor?.user_id ?? ''),
        specialization: doctor?.specialization ?? '',
        license_number: doctor?.license_number ?? '',
        phone: doctor?.phone ?? '',
        bio: doctor?.bio ?? '',
        is_active: doctor?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (doctor) put(doctorsUpdate.url(doctor.id));
    };

    return (
        <>
            <Head title="Edit Doctor" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={doctor ? doctorsShow(doctor.id) : doctors()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to details
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-base">Edit Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label>User Account <span className="text-destructive">*</span></Label>
                                <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name} — {u.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.user_id} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization <span className="text-destructive">*</span></Label>
                                <Input
                                    id="specialization"
                                    value={data.specialization}
                                    onChange={(e) => setData('specialization', e.target.value)}
                                    placeholder="e.g. General Practitioner, Cardiologist"
                                    required
                                />
                                <InputError message={errors.specialization} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="license_number">License Number <span className="text-destructive">*</span></Label>
                                <Input
                                    id="license_number"
                                    value={data.license_number}
                                    onChange={(e) => setData('license_number', e.target.value)}
                                    placeholder="PRC license number"
                                    required
                                />
                                <InputError message={errors.license_number} />
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
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Short professional background…"
                                    rows={3}
                                />
                                <InputError message={errors.bio} />
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(v) => setData('is_active', Boolean(v))}
                                />
                                <Label htmlFor="is_active">Active (available for appointments)</Label>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={doctor ? doctorsShow(doctor.id) : doctors()}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Doctors', href: doctors() },
            { title: 'Edit Doctor', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
