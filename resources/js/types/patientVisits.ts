export interface PatientVisit {
    id: number;
    patient_id: number;
    dentist_id: number;
    appointment_id: number | null;
    visited_at: string;
    check_in_at: string | null;
    check_out_at: string | null;
    blood_pressure: string | null;
    temperature: string | null;
    weight: string | null;
    heart_rate: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    patient?: { id: number; first_name: string; last_name: string; full_name: string; phone: string | null };
    dentist?: { id: number; specialization: string; user?: { id: number; name: string } };
    appointment?: { id: number; service?: { id: number; name: string } } | null;
    dentalRecord?: {
        id: number;
        chief_complaint: string;
        diagnosis: string | null;
        treatment: string | null;
        prescription: string | null;
        notes: string | null;
    } | null;
}

export interface PatientVisitsIndexProps {
    data: {
        data: PatientVisit[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        patient_id?: string;
        dentist_id?: string;
        date?: string;
    };
}

export interface PatientVisitsShowProps {
    visit: PatientVisit;
}
