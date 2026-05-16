import { Briefcase, Calendar, CalendarDays, Clock, ClipboardList, Stethoscope, UserRound, Users } from 'lucide-react';

export const STAT_ICONS: Record<string, React.ReactNode> = {
    users:           <Users className="h-4 w-4" />,
    stethoscope:     <Stethoscope className="h-4 w-4" />,
    calendar:        <Calendar className="h-4 w-4" />,
    briefcase:       <Briefcase className="h-4 w-4" />,
    clock:           <Clock className="h-4 w-4" />,
    'calendar-days': <CalendarDays className="h-4 w-4" />,
    clipboard:       <ClipboardList className="h-4 w-4" />,
    userround:       <UserRound className="h-4 w-4" />,
};

export const STATUS_CFG: Record<string, { label: string; className: string }> = {
    pending:         { label: 'Pending',     className: 'bg-amber-50  text-amber-600  ring-1 ring-amber-200  dark:bg-amber-950/30  dark:text-amber-400  dark:ring-amber-800'  },
    confirmed:       { label: 'Confirmed',   className: 'bg-blue-50   text-blue-600   ring-1 ring-blue-200   dark:bg-blue-950/30   dark:text-blue-400   dark:ring-blue-800'   },
    in_queue:        { label: 'In Queue',    className: 'bg-amber-50  text-amber-600  ring-1 ring-amber-200  dark:bg-amber-950/30  dark:text-amber-400  dark:ring-amber-800'  },
    in_progress:     { label: 'In Progress', className: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:ring-violet-800' },
    completed:       { label: 'Completed',   className: 'bg-teal-50   text-teal-600   ring-1 ring-teal-200   dark:bg-teal-950/30   dark:text-teal-400   dark:ring-teal-800'   },
    needs_follow_up: { label: 'Follow-up',   className: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:ring-orange-800' },
    cancelled:       { label: 'Cancelled',   className: 'bg-red-50    text-red-500    ring-1 ring-red-200    dark:bg-red-950/30    dark:text-red-400    dark:ring-red-800'    },
    no_show:         { label: 'No Show',     className: 'bg-slate-100 text-slate-500  ring-1 ring-slate-200  dark:bg-slate-800     dark:text-slate-400  dark:ring-slate-700'  },
};

export const STATUS_DOT: Record<string, string> = {
    pending:         'bg-slate-400',
    confirmed:       'bg-blue-500',
    in_queue:        'bg-amber-500',
    in_progress:     'bg-purple-500',
    completed:       'bg-emerald-500',
    needs_follow_up: 'bg-orange-500',
    cancelled:       'bg-red-400',
    no_show:         'bg-slate-300',
};

export const BREAKDOWN_ROWS = [
    { key: 'completed', label: 'Completed', color: 'bg-teal-500',  ic: 'text-teal-500'  },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-blue-500',  ic: 'text-blue-500'  },
    { key: 'pending',   label: 'Pending',   color: 'bg-amber-400', ic: 'text-amber-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-red-400',   ic: 'text-red-400'   },
    { key: 'no_show',   label: 'No Show',   color: 'bg-slate-300', ic: 'text-slate-400' },
] as const;

export const AVATAR_PALETTE = [
    'bg-teal-100   text-teal-700   dark:bg-teal-900/40   dark:text-teal-300',
    'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300',
    'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',
    'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300',
];

export const DUMMY_STATS_ADMIN = [
    { label: 'Total Patients',       value: 248, icon: 'users'       },
    { label: 'Total Doctors',        value: 6,   icon: 'stethoscope' },
    { label: "Today's Appointments", value: 14,  icon: 'calendar'    },
    { label: 'Active Services',      value: 12,  icon: 'briefcase'   },
];

export const DUMMY_STATS_STAFF = [
    { label: "Today's Appointments", value: 14,  icon: 'calendar'     },
    { label: 'Pending',              value: 4,   icon: 'clock'        },
    { label: 'Total Patients',       value: 248, icon: 'users'        },
    { label: 'Upcoming Week',        value: 32,  icon: 'calendar-days'},
];

export const DUMMY_STATS_DOCTOR = [
    { label: "My Today's",  value: 6,  icon: 'calendar'     },
    { label: 'My Upcoming', value: 18, icon: 'calendar-days' },
    { label: 'My Patients', value: 74, icon: 'users'         },
    { label: 'My Records',  value: 42, icon: 'clipboard'     },
];

const TODAY = new Date().toISOString().slice(0, 10);

export const DUMMY_TODAY = [
    { id: 1, appointment_date: TODAY, start_time: '08:00:00', end_time: '08:30:00', status: 'completed',   patient: { id: 1, first_name: 'Maria',    last_name: 'Santos',     full_name: 'Maria Santos'     }, service: { id: 1, name: 'Prophylaxis'       }, dentist: { id: 1, specialization: 'General Dentistry', user: { id: 1, name: 'Ana Reyes'  } } },
    { id: 2, appointment_date: TODAY, start_time: '09:00:00', end_time: '09:45:00', status: 'in_progress', patient: { id: 2, first_name: 'Jose',     last_name: 'Dela Cruz',  full_name: 'Jose Dela Cruz'   }, service: { id: 2, name: 'Root Canal'        }, dentist: { id: 1, specialization: 'General Dentistry', user: { id: 1, name: 'Ana Reyes'  } } },
    { id: 3, appointment_date: TODAY, start_time: '10:00:00', end_time: '10:30:00', status: 'confirmed',   patient: { id: 3, first_name: 'Isabella', last_name: 'Reyes',      full_name: 'Isabella Reyes'   }, service: { id: 3, name: 'Composite Filling' }, dentist: { id: 2, specialization: 'Orthodontics',      user: { id: 2, name: 'Marco Tan'  } } },
    { id: 4, appointment_date: TODAY, start_time: '11:00:00', end_time: '11:30:00', status: 'pending',     patient: { id: 4, first_name: 'Rodrigo',  last_name: 'Bautista',   full_name: 'Rodrigo Bautista' }, service: { id: 1, name: 'Prophylaxis'       }, dentist: { id: 2, specialization: 'Orthodontics',      user: { id: 2, name: 'Marco Tan'  } } },
    { id: 5, appointment_date: TODAY, start_time: '13:00:00', end_time: '14:00:00', status: 'confirmed',   patient: { id: 5, first_name: 'Elena',    last_name: 'Villanueva', full_name: 'Elena Villanueva' }, service: { id: 4, name: 'Braces Adjustment' }, dentist: { id: 2, specialization: 'Orthodontics',      user: { id: 2, name: 'Marco Tan'  } } },
    { id: 6, appointment_date: TODAY, start_time: '14:30:00', end_time: '15:00:00', status: 'pending',     patient: { id: 6, first_name: 'Carlos',   last_name: 'Mendoza',    full_name: 'Carlos Mendoza'   }, service: { id: 5, name: 'Tooth Extraction'  }, dentist: { id: 1, specialization: 'General Dentistry', user: { id: 1, name: 'Ana Reyes'  } } },
];

export function fmtTime(t: string) {
    const [h, m] = t.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function initials(name?: string) {
    if (!name) {
        return '??';
    }

    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();
}

export function greeting() {
    const h = new Date().getHours();

    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export function avatarCls(name?: string) {
    if (!name) {
        return AVATAR_PALETTE[0];
    }

    return AVATAR_PALETTE[name.charCodeAt(0) % AVATAR_PALETTE.length];
}

interface StatCardProps {
    label: string;
    value: number;
    icon?: string;
    subtitle?: string;
    featured?: boolean;
}

export function StatCard({ label, value, icon, subtitle, featured = false }: StatCardProps) {
    const iconNode = icon ? STAT_ICONS[icon] : null;

    if (featured) {
        return (
            <div className="relative overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm">
                <div className="flex items-start justify-between">
                    <p className="text-sm font-medium opacity-90">{label}</p>
                    {iconNode && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                            {iconNode}
                        </span>
                    )}
                </div>
                <p className="mt-4 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
                {subtitle && (
                    <p className="mt-1.5 text-xs opacity-75">{subtitle}</p>
                )}
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-8 -right-2 h-20 w-20 rounded-full bg-white/5" />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                {iconNode && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {iconNode}
                    </span>
                )}
            </div>
            <p className="mt-4 text-3xl font-bold tabular-nums text-foreground">{value.toLocaleString()}</p>
            {subtitle && (
                <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
        </div>
    );
}
