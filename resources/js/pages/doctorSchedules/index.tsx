import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { store, update, destroy } from '@/routes/doctor-schedules';
import { show as doctorsShow } from '@/routes/doctors';
import type { DoctorSchedule, DoctorSchedulesIndexProps } from '@/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type ScheduleFormData = {
    dentist_id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
};

export default function Index({ doctor, schedules }: DoctorSchedulesIndexProps) {
    const [editTarget, setEditTarget] = useState<DoctorSchedule | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const addForm = useForm<ScheduleFormData>({
        dentist_id: String(doctor.id),
        day_of_week: '',
        start_time: '',
        end_time: '',
        is_available: true,
    });

    const editForm = useForm<ScheduleFormData>({
        dentist_id: String(doctor.id),
        day_of_week: String(editTarget?.day_of_week ?? ''),
        start_time: editTarget?.start_time ?? '',
        end_time: editTarget?.end_time ?? '',
        is_available: editTarget?.is_available ?? true,
    });

    const openEdit = (schedule: DoctorSchedule) => {
        setEditTarget(schedule);
        editForm.setData({
            dentist_id: String(doctor.id),
            day_of_week: String(schedule.day_of_week),
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            is_available: schedule.is_available,
        });
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(store.url(), {
            onSuccess: () => {
                setShowAdd(false);
                addForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editTarget) {
return;
}

        editForm.put(update.url(editTarget.id), {
            onSuccess: () => setEditTarget(null),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(destroy.url(id), {
            onSuccess: () => setDeleteId(null),
        });
    };

    const scheduledDays = new Set(schedules.map((s) => s.day_of_week));
    const availableDaysForAdd = DAYS.map((name, i) => ({ name, index: i })).filter(
        (d) => !scheduledDays.has(d.index),
    );

    return (
        <>
            <Head title={`Schedule — ${doctor.user?.name ?? 'Doctor'}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={doctorsShow(doctor.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to doctor
                        </Link>
                    </Button>
                    <Button size="sm" onClick={() => setShowAdd(true)} disabled={availableDaysForAdd.length === 0}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Schedule
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Weekly Schedule — {doctor.user?.name ?? `Doctor #${doctor.id}`}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                {doctor.specialization}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {schedules.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No schedule configured yet.
                            </p>
                        ) : (
                            <div className="divide-y divide-border">
                                {schedules
                                    .slice()
                                    .sort((a, b) => a.day_of_week - b.day_of_week)
                                    .map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between gap-4 py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-24 text-sm font-medium">
                                                    {DAYS[schedule.day_of_week] ?? schedule.day_name}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {schedule.start_time} – {schedule.end_time}
                                                </span>
                                                {!schedule.is_available && (
                                                    <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => openEdit(schedule)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setDeleteId(schedule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add schedule dialog */}
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Schedule</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Day <span className="text-destructive">*</span></Label>
                            <Select
                                value={addForm.data.day_of_week}
                                onValueChange={(v) => addForm.setData('day_of_week', v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDaysForAdd.map((d) => (
                                        <SelectItem key={d.index} value={String(d.index)}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={addForm.errors.day_of_week} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="add-start">Start Time <span className="text-destructive">*</span></Label>
                                <Input
                                    id="add-start"
                                    type="time"
                                    value={addForm.data.start_time}
                                    onChange={(e) => addForm.setData('start_time', e.target.value)}
                                    required
                                />
                                <InputError message={addForm.errors.start_time} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="add-end">End Time <span className="text-destructive">*</span></Label>
                                <Input
                                    id="add-end"
                                    type="time"
                                    value={addForm.data.end_time}
                                    onChange={(e) => addForm.setData('end_time', e.target.value)}
                                    required
                                />
                                <InputError message={addForm.errors.end_time} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="add-available"
                                checked={addForm.data.is_available}
                                onCheckedChange={(v) => addForm.setData('is_available', v)}
                            />
                            <Label htmlFor="add-available">Available</Label>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing ? 'Adding…' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit schedule dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>
                            Edit — {editTarget ? (DAYS[editTarget.day_of_week] ?? editTarget.day_name) : ''}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="edit-start">Start Time <span className="text-destructive">*</span></Label>
                                <Input
                                    id="edit-start"
                                    type="time"
                                    value={editForm.data.start_time}
                                    onChange={(e) => editForm.setData('start_time', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.start_time} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-end">End Time <span className="text-destructive">*</span></Label>
                                <Input
                                    id="edit-end"
                                    type="time"
                                    value={editForm.data.end_time}
                                    onChange={(e) => editForm.setData('end_time', e.target.value)}
                                    required
                                />
                                <InputError message={editForm.errors.end_time} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="edit-available"
                                checked={editForm.data.is_available}
                                onCheckedChange={(v) => editForm.setData('is_available', v)}
                            />
                            <Label htmlFor="edit-available">Available</Label>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setEditTarget(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent className="max-w-[400px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Remove Schedule</DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    This will remove the schedule slot for{' '}
                                    <span className="font-medium text-foreground">
                                        {DAYS[schedules.find((s) => s.id === deleteId)?.day_of_week ?? -1] ?? ''}
                                    </span>. This cannot be undone.
                                </p>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteId && handleDelete(deleteId)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Doctor Schedules', href: '#' }]}>
        {page}
    </AppLayout>
);
