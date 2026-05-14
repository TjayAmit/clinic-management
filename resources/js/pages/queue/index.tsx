import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, PhoneCall, Stethoscope, Trash2, UserRound, Users, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    index as queueIndex,
    call as queueCall,
    complete as queueComplete,
    noShow as queueNoShow,
    destroy as queueDestroy,
} from '@/routes/queue';
import type { QueueIndexProps, QueueItem } from '@/types';

function formatTime(time: string) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export default function Index({ queue, date, doctors, filters }: QueueIndexProps) {
    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(queueIndex(), { date, doctor_id: filters.doctor_id, ...params }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const current = queue.find((q) => q.status === 'in_progress') ?? null;
    const waiting = queue.filter((q) => q.status === 'waiting');
    const done = queue.filter((q) => q.status === 'completed' || q.status === 'no_show');

    const handleCall = (item: QueueItem) => router.patch(queueCall(item.id).url);
    const handleComplete = () => current && router.patch(queueComplete(current.id).url);
    const handleNoShow = () => current && router.patch(queueNoShow(current.id).url);
    const handleDestroy = (item: QueueItem) => router.delete(queueDestroy(item.id).url);

    return (
        <>
            <Head title="Queue" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
                {/* Header + filters */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold">Queue Board</h1>
                        <p className="text-sm text-muted-foreground">{date}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            type="date"
                            className="h-9 w-auto"
                            value={filters.date ?? date}
                            onChange={(e) => navigate({ date: e.target.value })}
                        />
                        <Select
                            value={filters.doctor_id ?? ''}
                            onValueChange={(v) => navigate({ doctor_id: v || undefined })}
                        >
                            <SelectTrigger className="h-9 w-48">
                                <SelectValue placeholder="All doctors" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((d) => (
                                    <SelectItem key={d.id} value={String(d.id)}>
                                        {d.user?.name ?? `Doctor #${d.id}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {filters.doctor_id && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 text-muted-foreground"
                                onClick={() => navigate({ doctor_id: undefined })}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main layout */}
                <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* NOW SERVING — main panel */}
                    <div className="lg:col-span-2">
                        {current ? (
                            <NowServingCard item={current} onComplete={handleComplete} onNoShow={handleNoShow} />
                        ) : (
                            <Card className="flex h-full min-h-[320px] flex-col items-center justify-center border-dashed">
                                <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
                                    <div className="rounded-full bg-muted p-5">
                                        <UserRound className="h-8 w-8 opacity-40" />
                                    </div>
                                    <p className="text-base font-medium">No patient in progress</p>
                                    <p className="text-sm">Call the next patient from the waiting list to start.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* WAITING LIST — right panel */}
                    <div className="flex flex-col gap-4">
                        <Card className="flex flex-1 flex-col overflow-hidden">
                            <CardHeader className="border-b border-border pb-3">
                                <CardTitle className="flex items-center justify-between text-sm font-semibold">
                                    <span className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Waiting
                                    </span>
                                    <Badge variant="secondary" className="tabular-nums">{waiting.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-3">
                                {waiting.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                                        <p className="text-xs">No patients waiting</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {waiting.map((item, index) => (
                                            <WaitingCard
                                                key={item.id}
                                                item={item}
                                                isNext={index === 0 && !current}
                                                onCall={() => handleCall(item)}
                                                onRemove={() => handleDestroy(item)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Done summary */}
                        {done.length > 0 && (
                            <Card>
                                <CardHeader className="border-b border-border pb-3">
                                    <CardTitle className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
                                        <span>Done today</span>
                                        <Badge variant="outline" className="tabular-nums">{done.length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <div className="space-y-1.5">
                                        {done.map((item) => {
                                            const patient = item.appointment?.patient;
                                            return (
                                                <div key={item.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground">
                                                    <span className="truncate">
                                                        {patient ? `${patient.first_name} ${patient.last_name}` : '—'}
                                                    </span>
                                                    <span className={`shrink-0 text-xs font-medium ${item.status === 'no_show' ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                        {item.status === 'no_show' ? 'No Show' : 'Done'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function NowServingCard({
    item,
    onComplete,
    onNoShow,
}: {
    item: QueueItem;
    onComplete: () => void;
    onNoShow: () => void;
}) {
    const appt = item.appointment;
    const patient = appt?.patient;

    return (
        <Card className="flex h-full flex-col overflow-hidden border-l-4 border-l-blue-500">
            <div className="border-b border-border bg-blue-50/60 px-6 py-3 dark:bg-blue-950/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Now Serving · #{item.position}
                </p>
            </div>

            <CardContent className="flex flex-1 flex-col gap-6 p-6">
                {/* Patient identity */}
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
                        <UserRound className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-foreground">
                                {patient ? `${patient.first_name} ${patient.last_name}` : '—'}
                            </h2>
                            {appt?.is_walk_in && (
                                <Badge variant="secondary" className="text-xs">Walk-in</Badge>
                            )}
                        </div>
                        {patient?.phone && (
                            <p className="mt-0.5 text-sm text-muted-foreground">{patient.phone}</p>
                        )}
                    </div>
                </div>

                {/* Appointment details */}
                {appt && (
                    <div className="grid gap-4 rounded-xl border border-border bg-muted/30 p-5 sm:grid-cols-2">
                        {appt.service && (
                            <DetailItem icon={<Stethoscope className="h-4 w-4" />} label="Service" value={appt.service.name} />
                        )}
                        {appt.dentist?.user && (
                            <DetailItem icon={<UserRound className="h-4 w-4" />} label="Doctor" value={`Dr. ${appt.dentist.user.name}`} sub={appt.dentist.specialization} />
                        )}
                        <DetailItem
                            icon={<Clock className="h-4 w-4" />}
                            label="Time Slot"
                            value={`${formatTime(appt.start_time)} – ${formatTime(appt.end_time)}`}
                        />
                        {item.called_at && (
                            <DetailItem
                                icon={<PhoneCall className="h-4 w-4" />}
                                label="Called At"
                                value={new Date(item.called_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            />
                        )}
                    </div>
                )}

                {appt?.notes && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Notes</p>
                        <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">{appt.notes}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-auto flex gap-3">
                    <Button size="lg" className="flex-1 gap-2" onClick={onComplete}>
                        <CheckCircle2 className="h-5 w-5" />
                        Complete
                    </Button>
                    <Button size="lg" variant="outline" className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onNoShow}>
                        <XCircle className="h-5 w-5" />
                        No Show
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function DetailItem({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">{icon}</span>
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{value}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </div>
        </div>
    );
}

function WaitingCard({
    item,
    isNext,
    onCall,
    onRemove,
}: {
    item: QueueItem;
    isNext: boolean;
    onCall: () => void;
    onRemove: () => void;
}) {
    const appt = item.appointment;
    const patient = appt?.patient;

    return (
        <div className={`rounded-lg border border-border bg-card p-3 transition-colors ${isNext ? 'ring-1 ring-primary' : ''}`}>
            <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold tabular-nums">
                    {item.position}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {patient ? `${patient.first_name} ${patient.last_name}` : '—'}
                    </p>
                    {appt?.service && (
                        <p className="truncate text-xs text-muted-foreground">{appt.service.name}</p>
                    )}
                    {appt && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(appt.start_time)}
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                    {appt?.is_walk_in && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">Walk-in</Badge>
                    )}
                </div>
            </div>

            {isNext && (
                <div className="mt-2.5 flex gap-1.5">
                    <Button size="sm" className="h-7 flex-1 gap-1 text-xs" onClick={onCall}>
                        <PhoneCall className="h-3 w-3" />
                        Call Next
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                        onClick={onRemove}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Queue', href: queueIndex() }]}>
        {page}
    </AppLayout>
);
