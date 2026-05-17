import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScheduleDayCalendar } from '@/components/schedule-day-calendar';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import type { DoctorScheduleEditProps } from '@/types/doctors';

export default function Edit({ schedule }: DoctorScheduleEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        day_of_week: [String(schedule.day_of_week)],
        start_time: schedule.start_time.slice(0, 5),
        end_time: schedule.end_time.slice(0, 5),
        is_available: schedule.is_available,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/doctor-schedules/' + schedule.id);
    };

    return (
        <>
            <Head title="Edit Schedule" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/doctor-schedules">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Edit Schedule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Doctor</Label>
                                    <p className="text-sm text-muted-foreground">{schedule.doctor.user.name}</p>
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
                                        {processing ? 'Saving…' : 'Save Changes'}
                                </Button>
                                    <Button variant="outline" asChild>
                                        <Link href="/doctor-schedules">Cancel</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Day of Week <span className="text-destructive">*</span></CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScheduleDayCalendar
                                    value={data.day_of_week}
                                    onChange={(v) => setData('day_of_week', v)}
                                />
                                <InputError message={errors.day_of_week} />
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Doctor Schedules', href: '/doctor-schedules' },
            { title: 'Edit Schedule', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
