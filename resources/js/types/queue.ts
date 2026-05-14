export type QueueStatus = 'waiting' | 'in_progress' | 'completed' | 'no_show';

export interface QueueItem {
    id: number;
    appointment_id: number;
    queue_date: string;
    position: number;
    status: QueueStatus;
    called_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    appointment?: {
        id: number;
        is_walk_in: boolean;
        appointment_date: string;
        start_time: string;
        end_time: string;
        notes: string | null;
        patient?: { id: number; first_name: string; last_name: string; full_name: string; phone: string | null };
        dentist?: { id: number; specialization: string; user?: { id: number; name: string } };
        service?: { id: number; name: string; category: string; duration_minutes: number };
    };
}

export interface QueueDoctorOption {
    id: number;
    specialization: string;
    user_id: number;
    user?: { id: number; name: string };
}

export interface QueueIndexProps {
    queue: QueueItem[];
    date: string;
    doctors: QueueDoctorOption[];
    filters: {
        date?: string;
        doctor_id?: string;
    };
}
