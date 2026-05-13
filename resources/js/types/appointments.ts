export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
    id: number;
    patient_id: number;
    dentist_id: number;
    service_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
    notes: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    patient?: { id: number; first_name: string; last_name: string; full_name: string; phone: string | null };
    dentist?: { id: number; specialization: string; user?: { id: number; name: string } };
    service?: { id: number; name: string; duration_minutes: number; price: string };
    visit?: { id: number; medical_record?: { id: number } | null } | null;
}

export interface DoctorOption {
    id: number;
    specialization: string;
    user_id: number;
    user?: { id: number; name: string };
}

export interface PatientOption {
    id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
}

export interface ServiceOption {
    id: number;
    name: string;
    duration_minutes: number;
    price: string;
}

export interface AppointmentsIndexProps {
    data: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        date?: string;
        dentist_id?: string;
        status?: string;
    };
    doctors: DoctorOption[];
}

export interface AppointmentsShowProps {
    appointment: Appointment;
}

export interface AppointmentsFormProps {
    appointment?: Appointment;
    patients: PatientOption[];
    doctors: DoctorOption[];
    services: ServiceOption[];
}
