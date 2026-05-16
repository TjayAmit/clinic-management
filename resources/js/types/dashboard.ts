export interface DashboardStat {
    label: string;
    value: number;
    icon: string;
}

export interface DashboardAppointmentItem {
    id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    patient?: { id: number; first_name: string; last_name: string; full_name: string };
    dentist?: { id: number; specialization: string; user?: { id: number; name: string } };
    service?: { id: number; name: string };
}

export interface DashboardPatientItem {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string | null;
    created_at: string;
}

export interface DashboardRecordItem {
    id: number;
    patient_id: number;
    chief_complaint: string;
    created_at: string;
    patient?: { id: number; first_name: string; last_name: string; full_name: string };
}

export interface DashboardStatusBreakdown {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    no_show: number;
    [key: string]: number;
}

export interface DashboardProps {
    stats: DashboardStat[];
    todayAppointments: DashboardAppointmentItem[];
    recentAppointments: DashboardAppointmentItem[];
    recentPatients: DashboardPatientItem[];
    recentRecords: DashboardRecordItem[];
    statusBreakdown: DashboardStatusBreakdown;
    userRoles: string[];
    weekAppointments?: Record<string, DashboardAppointmentItem[]>;
    doctorId?: number | null;
}
