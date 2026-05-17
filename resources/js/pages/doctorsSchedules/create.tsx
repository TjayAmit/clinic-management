import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
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
import AppLayout from '@/layouts/app-layout';
import type { DoctorScheduleCreateProps } from '@/types/doctors';

const DAY_LABELS: Record<string, string> = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

export default function Create({ doctors }: DoctorScheduleCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        doctor_id: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        is_available: true as boolean,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/doctor-schedules');
    };

    return (
        <>
            <Head title="Add Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/doctor-schedules">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Add Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Doctor <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.doctor_id}
                                    onValueChange={(v) => setData('doctor_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={String(doctor.id)}>
                                                {doctor.user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.doctor_id} />
                            </div>

                            <div className="space-y-2">
                                <Label>Day of Week <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.day_of_week}
                                    onValueChange={(v) => setData('day_of_week', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(DAY_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.day_of_week} />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border border-border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_available" className="cursor-pointer text-sm font-medium">Available</Label>
                                    <p className="text-xs text-muted-foreground">Mark whether the doctor is available on this day.</p>
                                </div>
                                <Switch
                                    id="is_available"
                                    checked={data.is_available}
                                    onCheckedChange={(v) => setData('is_available', v)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time <span className="text-destructive">*</span></Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    disabled={!data.is_available}
                                    className={!data.is_available ? 'opacity-40' : ''}
                                />
                                <InputError message={errors.start_time} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time <span className="text-destructive">*</span></Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    disabled={!data.is_available}
                                    className={!data.is_available ? 'opacity-40' : ''}
                                />
                                <InputError message={errors.end_time} />
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Add Schedule'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/doctor-schedules">Cancel</Link>
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
            { title: 'Doctor Schedules', href: '/doctor-schedules' },
            { title: 'Add Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
