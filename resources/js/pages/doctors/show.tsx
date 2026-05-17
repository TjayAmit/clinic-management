import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    index as doctors,
    edit as doctorsEdit,
    destroy as doctorsDestroy,
} from '@/routes/doctors';
import { index as doctorsSchedules } from '@/routes/doctors/schedules';
import type { DoctorsShowProps } from '@/types';

const DAY_LABELS: Record<string, string> = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
};

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function Show({ doctor }: DoctorsShowProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(doctorsDestroy(doctor.id), {
            onFinish: () => {
                setIsDeleting(false);
                setShowDelete(false);
            },
        });
    };

    const sortedSchedules = (doctor.schedules ?? []).slice().sort((a, b) => 
        DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
    );

    return (
        <>
            <Head title={`Doctor — ${doctor.user?.name ?? ''}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={doctors()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to list
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/doctors/${doctor.id}/calendar`}>
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Calendar
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={doctorsSchedules.url(doctor.id)}>
                                <CalendarClock className="mr-2 h-4 w-4" />
                                Manage Schedule
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={doctorsEdit(doctor.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Doctor info */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-base">
                                Doctor Profile
                                <Badge variant={doctor.is_active ? 'default' : 'secondary'}>
                                    {doctor.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Field label="Full Name" value={doctor.user?.name} />
                            <Field label="Email" value={doctor.user?.email} />
                            <Field label="Specialization" value={doctor.specialization} />
                            <Field label="License Number" value={doctor.license_number} />
                            <Field label="Phone" value={doctor.phone} />
                            <Field label="Bio" value={doctor.bio} multiline />
                        </CardContent>
                    </Card>

                    {/* Weekly schedule */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Weekly Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {sortedSchedules.length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No schedule configured yet.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="h-10 py-0 pl-6 pr-4 text-xs font-medium text-muted-foreground">Day</TableHead>
                                            <TableHead className="h-10 px-4 py-0 text-xs font-medium text-muted-foreground">Start</TableHead>
                                            <TableHead className="h-10 px-4 py-0 text-xs font-medium text-muted-foreground">End</TableHead>
                                            <TableHead className="h-10 px-4 py-0 text-xs font-medium text-muted-foreground">Available</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sortedSchedules.map((s) => (
                                            <TableRow key={s.id} className="border-b border-border/60 last:border-0">
                                                <TableCell className="py-3 pl-6 pr-4 text-sm font-medium">
                                                    {DAY_LABELS[s.day_of_week] || s.day_of_week}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm text-muted-foreground">{s.start_time}</TableCell>
                                                <TableCell className="px-4 py-3 text-sm text-muted-foreground">{s.end_time}</TableCell>
                                                <TableCell className="px-4 py-3">
                                                    <Badge variant={s.is_available ? 'default' : 'secondary'}>
                                                        {s.is_available ? 'Yes' : 'No'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="max-w-[440px] gap-0 overflow-hidden p-0">
                    <div className="flex items-start gap-4 p-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                            <Trash2 className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="pt-0.5">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-base font-semibold">Delete Doctor</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Are you sure you want to delete{' '}
                                    <span className="font-medium text-foreground">{doctor.user?.name}</span>?
                                    This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4">
                        <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {isDeleting ? 'Deleting…' : 'Delete Doctor'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Field({ label, value, multiline = false }: { label: string; value: string | null | undefined; multiline?: boolean }) {
    return (
        <div className="grid gap-0.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {value ? (
                multiline ? (
                    <p className="whitespace-pre-wrap text-sm">{value}</p>
                ) : (
                    <p className="text-sm">{value}</p>
                )
            ) : (
                <p className="text-sm text-muted-foreground">—</p>
            )}
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Doctors', href: doctors() },
            { title: 'View Doctor', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
