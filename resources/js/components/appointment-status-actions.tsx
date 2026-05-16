import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    cancel,
    complete,
    confirm,
    inProgress,
    inQueue,
    needsFollowUp,
    noShow,
} from '@/routes/appointments';
import type { AppointmentStatus } from '@/types';

interface Action {
    label: string;
    url: string;
    destructive?: boolean;
}

function getActions(appointmentId: number, status: AppointmentStatus): Action[] {
    switch (status) {
        case 'pending':
            return [
                { label: 'Confirm', url: confirm.url(appointmentId) },
                { label: 'Cancel', url: cancel.url(appointmentId), destructive: true },
            ];
        case 'confirmed':
            return [
                { label: 'Mark In Queue', url: inQueue.url(appointmentId) },
                { label: 'Cancel', url: cancel.url(appointmentId), destructive: true },
            ];
        case 'in_queue':
            return [
                { label: 'Mark In Progress', url: inProgress.url(appointmentId) },
            ];
        case 'in_progress':
            return [
                { label: 'Complete', url: complete.url(appointmentId) },
                { label: 'Needs Follow-up', url: needsFollowUp.url(appointmentId) },
                { label: 'No Show', url: noShow.url(appointmentId), destructive: true },
            ];
        default:
            return [];
    }
}

interface Props {
    appointmentId: number;
    status: AppointmentStatus;
    onSuccess?: () => void;
}

export function AppointmentStatusActions({ appointmentId, status, onSuccess }: Props) {
    const actions = getActions(appointmentId, status);

    if (actions.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>;
    }

    const handleAction = (url: string) => {
        router.patch(url, {}, { preserveScroll: true, onSuccess });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-2.5 text-xs"
                >
                    Actions
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
                {actions.map((action) => (
                    <DropdownMenuItem
                        key={action.label}
                        onClick={() => handleAction(action.url)}
                        className={
                            action.destructive
                                ? 'text-destructive focus:bg-destructive/10 focus:text-destructive'
                                : undefined
                        }
                    >
                        {action.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
