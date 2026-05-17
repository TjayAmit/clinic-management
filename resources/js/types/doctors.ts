export enum DayOfWeek {
    Sunday = 'sunday',
    Monday = 'monday',
    Tuesday = 'tuesday',
    Wednesday = 'wednesday',
    Thursday = 'thursday',
    Friday = 'friday',
    Saturday = 'saturday',
}

export interface DoctorSchedule {
    id: number;
    doctor_id: number;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

export interface Doctor {
    id: number;
    user_id: number;
    specialization: string;
    license_number: string;
    phone: string | null;
    bio: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user?: { id: number; name: string; email: string };
    schedules?: DoctorSchedule[];
}

export interface UserOption {
    id: number;
    name: string;
    email: string;
}

export interface DoctorsIndexProps {
    data: {
        data: Doctor[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string };
}

export interface DoctorsShowProps {
    doctor: Doctor;
}

export interface DoctorsFormProps {
    doctor?: Doctor;
    users: UserOption[];
}

export interface DoctorsSchedulesProps {
    doctor: Doctor;
    schedules: DoctorSchedule[];
}

export interface DoctorWithScheduleSummary {
    id: number;
    specialization: string;
    license_number: string;
    is_active: boolean;
    user: { id: number; name: string; email: string };
    schedules_count: number;
    available_days_count: number;
}

export interface DoctorSchedulesIndexProps {
    data: {
        data: DoctorWithScheduleSummary[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string; per_page?: number };
}

export interface DoctorScheduleRecord {
    id: number;
    doctor_id: number;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    is_available: boolean;
    doctor: { id: number; user: { name: string } };
}

export interface DoctorSchedulesListProps {
    data: {
        data: DoctorScheduleRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string; per_page?: number };
}

export interface DoctorScheduleCreateProps {
    doctors: Array<{ id: number; user: { name: string } }>;
}

export interface DoctorScheduleEditProps {
    schedule: DoctorScheduleRecord;
}
