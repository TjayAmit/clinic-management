export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    blood_type: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    allergies: string | null;
    medical_history: string | null;
    is_regular: boolean;
    created_at: string;
    updated_at: string;
    visits?: PatientVisitItem[];
    appointments?: AppointmentItem[];
}

export interface PatientVisitItem {
    id: number;
    visited_at: string;
    check_in_at: string | null;
    check_out_at: string | null;
    blood_pressure: string | null;
    temperature: string | null;
    weight: string | null;
    heart_rate: number | null;
    notes: string | null;
    doctor?: { id: number; specialization: string; user?: { id: number; name: string } };
    medical_record?: { id: number; chief_complaint: string; diagnosis: string | null };
    appointment?: { id: number };
}

export interface AppointmentItem {
    id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    status: string;
    service?: { id: number; name: string };
    doctor?: { id: number; user?: { id: number; name: string } };
}

export interface PatientsIndexProps {
    data: {
        data: Patient[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string; is_regular?: boolean };
}

export interface PatientsShowProps {
    patient: Patient;
}

export interface PatientsFormProps {
    patient?: Patient;
}
