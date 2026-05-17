import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { edit, update } from '@/routes/clinic-settings';
import type { ClinicSettingEditProps } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export default function Edit({ settings }: ClinicSettingEditProps) {
    const [saved, setSaved] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        clinic_name: settings.clinic_name ?? '',
        owner_name: settings.owner_name ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        address: settings.address ?? '',
        city: settings.city ?? '',
        open_time: settings.open_time ?? '',
        close_time: settings.close_time ?? '',
        open_days: settings.open_days ?? ([] as string[]),
        appointment_interval_minutes: settings.appointment_interval_minutes ?? ('' as number | ''),
        logo_path: settings.logo_path ?? '',
        timezone: settings.timezone ?? '',
    });

    const toggleDay = (day: string) => {
        const current = data.open_days;
        const next = current.includes(day)
            ? current.filter((d) => d !== day)
            : [...current, day];
        setData('open_days', next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(false);
        put(update.url(), {
            onSuccess: () => setSaved(true),
        });
    };

    return (
        <>
            <Head title="Clinic Settings" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                {saved && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="size-4 shrink-0" />
                        Clinic settings updated successfully.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Clinic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="clinic_name">
                                    Clinic Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="clinic_name"
                                    value={data.clinic_name}
                                    onChange={(e) => setData('clinic_name', e.target.value)}
                                    placeholder="Enter clinic name"
                                    required
                                />
                                <InputError message={errors.clinic_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="owner_name">
                                    Owner Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="owner_name"
                                    value={data.owner_name}
                                    onChange={(e) => setData('owner_name', e.target.value)}
                                    placeholder="Enter owner name"
                                    required
                                />
                                <InputError message={errors.owner_name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={data.phone}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setData('phone', v);
                                    }}
                                    placeholder="Enter 10-digit phone number"
                                    required
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
                                    placeholder="Enter email address"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Enter street address"
                                    rows={3}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Enter city"
                                />
                                <InputError message={errors.city} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="open_time">Opening Time</Label>
                                    <Input
                                        id="open_time"
                                        type="time"
                                        pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                                        title="Enter time in 24-hour format (e.g. 08:00 or 17:30)"
                                        value={data.open_time}
                                        onChange={(e) => setData('open_time', e.target.value)}
                                    />
                                    <InputError message={errors.open_time} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="close_time">Closing Time</Label>
                                    <Input
                                        id="close_time"
                                        type="time"
                                        pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                                        title="Enter time in 24-hour format (e.g. 08:00 or 17:30)"
                                        value={data.close_time}
                                        onChange={(e) => setData('close_time', e.target.value)}
                                    />
                                    <InputError message={errors.close_time} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Open Days</Label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {DAYS.map((day) => (
                                        <div key={day} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`day-${day}`}
                                                checked={data.open_days.includes(day)}
                                                onCheckedChange={() => toggleDay(day)}
                                            />
                                            <Label
                                                htmlFor={`day-${day}`}
                                                className="cursor-pointer font-normal"
                                            >
                                                {day.slice(0, 3)}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.open_days} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="appointment_interval_minutes">
                                    Appointment Interval (minutes)
                                </Label>
                                <Input
                                    id="appointment_interval_minutes"
                                    type="number"
                                    min={5}
                                    max={120}
                                    value={data.appointment_interval_minutes}
                                    onChange={(e) =>
                                        setData(
                                            'appointment_interval_minutes',
                                            e.target.value === '' ? '' : Number(e.target.value),
                                        )
                                    }
                                    placeholder="e.g. 30"
                                />
                                <InputError message={errors.appointment_interval_minutes} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logo_path">Logo Path</Label>
                                <Input
                                    id="logo_path"
                                    value={data.logo_path}
                                    onChange={(e) => setData('logo_path', e.target.value)}
                                    placeholder="e.g. images/logo.png"
                                />
                                <InputError message={errors.logo_path} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Input
                                    id="timezone"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    placeholder="e.g. Asia/Manila"
                                />
                                <InputError message={errors.timezone} />
                            </div>

                            <div className="flex items-center gap-3 pt-1">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Save Settings'}
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
    <AppLayout breadcrumbs={[{ title: 'Clinic Settings', href: edit() }]}>{page}</AppLayout>
);
