import type { AppointmentStatus } from './appointments';

export interface DailyBoardEntry {
    id: number;
    patient_name: string;
    doctor_name: string;
    service_name: string;
    time: string; // "HH:MM:SS"
    status: AppointmentStatus;
    is_walk_in: boolean;
    type: 'appointment';
    series_position: number | null;
    series_total: number | null;
}

export interface DailyBoardProps {
    entries: DailyBoardEntry[];
    doctors: { id: number; name: string }[];
    filters: {
        date: string;
        doctor_id: number | null;
    };
}
