import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AppointmentStatus } from '@/types';

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; className: string }> = {
    pending: {
        label: 'Pending',
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    confirmed: {
        label: 'Confirmed',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    in_queue: {
        label: 'In Queue',
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    in_progress: {
        label: 'In Progress',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    completed: {
        label: 'Completed',
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    needs_follow_up: {
        label: 'Needs Follow-up',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    no_show: {
        label: 'No Show',
        className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    },
};

interface StatusBadgeProps {
    status: AppointmentStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

    return (
        <Badge
            variant="outline"
            className={cn(
                'border-transparent font-medium',
                config.className,
                className,
            )}
        >
            {config.label}
        </Badge>
    );
}

export { STATUS_CONFIG };
