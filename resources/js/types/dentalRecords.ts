export interface DentalRecord {
    id: number;
    patient_visit_id: number | null;
    patient_id: number;
    dentist_id: number;
    chief_complaint: string;
    diagnosis: string | null;
    treatment: string | null;
    prescription: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    patient?: { id: number; first_name: string; last_name: string; full_name: string };
    dentist?: { id: number; specialization: string; user?: { id: number; name: string } };
    patientVisit?: {
        id: number;
        visited_at: string;
        appointment?: { id: number; service?: { id: number; name: string } } | null;
    } | null;
}

export interface DentalRecordPatientOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface DentalRecordDoctorOption {
    id: number;
    specialization: string;
    user?: { id: number; name: string };
}

export interface DentalRecordVisitOption {
    id: number;
    visited_at: string;
    patient?: { id: number; full_name: string };
    dentist?: { id: number; user?: { id: number; name: string } };
}

export interface DentalRecordsIndexProps {
    data: {
        data: DentalRecord[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        patient_id?: string;
        dentist_id?: string;
    };
}

export interface DentalRecordsShowProps {
    record: DentalRecord;
}

export interface DentalRecordsFormProps {
    record?: DentalRecord;
    patients: DentalRecordPatientOption[];
    doctors: DentalRecordDoctorOption[];
    patient_visit?: DentalRecordVisitOption | null;
}
