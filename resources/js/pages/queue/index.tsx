import { Head, router } from '@inertiajs/react';
import { Clock, PhoneCall, CheckCircle2, XCircle, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

export default function Index({ queue, date, doctors, filters }: QueueIndexProps) {
    const navigate = (params: Record<string, unknown> = {}) => {
        router.get(queueIndex(), { date, doctor_id: filters.doctor_id, ...params }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleAction = (item: QueueItem, action: 'call' | 'complete' | 'noShow' | 'destroy') => {
        if (action === 'call') {
            router.patch(queueCall(item.id).url);
        } else if (action === 'complete') {
            router.patch(queueComplete(item.id).url);
        } else if (action === 'noShow') {
            router.patch(queueNoShow(item.id).url);
        } else {
            router.delete(queueDestroy(item.id).url);
        }
    };

    const waiting = queue.filter((q) => q.status === 'waiting');
    const inProgress = queue.filter((q) => q.status === 'in_progress');
    const done = queue.filter((q) => q.status === 'completed' || q.status === 'no_show');

    return (
        <>
            <Head title="Queue" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 lg:p-6">
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
                            onChange={(e) => navigate({ date: e.target.value, page: 1 })}
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

                <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
                    <QueueColumn
                        title="Waiting"
                        count={waiting.length}
                        colorClass="border-t-amber-400"
                        items={waiting}
                        onAction={handleAction}
                    />
                    <QueueColumn
                        title="In Progress"
                        count={inProgress.length}
                        colorClass="border-t-blue-500"
                        items={inProgress}
                        onAction={handleAction}
                    />
                    <QueueColumn
                        title="Done"
                        count={done.length}
                        colorClass="border-t-green-500"
                        items={done}
                        onAction={handleAction}
                    />
                </div>
            </div>
        </>
    );
}

function QueueColumn({
    title,
    count,
    colorClass,
    items,
    onAction,
}: {
    title: string;
    count: number;
    colorClass: string;
    items: QueueItem[];
    onAction: (item: QueueItem, action: 'call' | 'complete' | 'noShow' | 'destroy') => void;
}) {
    return (
        <div className={`flex flex-col overflow-hidden rounded-xl border-t-4 border border-border bg-muted/30 ${colorClass}`}>
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
                <h2 className="text-sm font-semibold">{title}</h2>
                <Badge variant="secondary" className="tabular-nums">{count}</Badge>
            </div>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
                        <div className="rounded-full bg-muted p-3">
                            <Users className="h-5 w-5 opacity-40" />
                        </div>
                        <p className="text-xs">No patients</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <QueueCard key={item.id} item={item} onAction={onAction} />
                    ))
                )}
            </div>
        </div>
    );
}

function QueueCard({
    item,
    onAction,
}: {
    item: QueueItem;
    onAction: (item: QueueItem, action: 'call' | 'complete' | 'noShow' | 'destroy') => void;
}) {
    const appt = item.appointment;
    const patientName = appt?.patient
        ? `${appt.patient.first_name} ${appt.patient.last_name}`
        : '—';

    return (
        <Card className="shadow-none">
            <CardContent className="p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                            {item.position}
                        </span>
                        <span className="text-sm font-medium leading-tight">{patientName}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                        {appt?.is_walk_in && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Walk-in</Badge>
                        )}
                        {item.status === 'completed' && (
                            <Badge variant="outline" className="h-5 px-1.5 text-[10px] border-green-500 text-green-600">Done</Badge>
                        )}
                        {item.status === 'no_show' && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">No Show</Badge>
                        )}
                    </div>
                </div>

                {appt && (
                    <div className="mb-2 space-y-1 text-xs text-muted-foreground">
                        {appt.service && (
                            <p className="truncate">{appt.service.name}</p>
                        )}
                        {appt.dentist?.user && (
                            <p className="truncate">{appt.dentist.user.name}</p>
                        )}
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{appt.start_time} – {appt.end_time}</span>
                        </div>
                    </div>
                )}

                {item.status === 'waiting' && (
                    <div className="flex gap-1.5">
                        <Button
                            size="sm"
                            className="h-7 flex-1 text-xs"
                            onClick={() => onAction(item, 'call')}
                        >
                            <PhoneCall className="mr-1 h-3 w-3" />
                            Call
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => onAction(item, 'destroy')}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}

                {item.status === 'in_progress' && (
                    <div className="flex gap-1.5">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 flex-1 text-xs"
                            onClick={() => onAction(item, 'complete')}
                        >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Complete
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 flex-1 text-xs text-muted-foreground"
                            onClick={() => onAction(item, 'noShow')}
                        >
                            <XCircle className="mr-1 h-3 w-3" />
                            No Show
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

Index.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Queue', href: queueIndex() }]}>
        {page}
    </AppLayout>
);
