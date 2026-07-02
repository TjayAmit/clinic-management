export interface Patient {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    civil_status: string | null;
    occupation: string | null;
    nationality: string | null;
    blood_type: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    street_address: string | null;
    city: string | null;
    province: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
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
    doctor?: {
        id: number;
        specialization: string;
        user?: { id: number; name: string };
    };
    dental_record?: {
        id: number;
        chief_complaint: string;
        diagnosis: string | null;
        treatment: string | null;
        prescription: string | null;
        notes: string | null;
    };
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
