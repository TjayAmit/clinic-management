export interface MedicalRecord {
    id: number;
    patient_visit_id: number | null;
    patient_id: number;
    doctor_id: number;
    chief_complaint: string;
    diagnosis: string | null;
    prescription: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    patient?: { id: number; first_name: string; last_name: string; full_name: string };
    doctor?: { id: number; specialization: string; user?: { id: number; name: string } };
    patientVisit?: {
        id: number;
        visited_at: string;
        appointment?: { id: number; service?: { id: number; name: string } } | null;
    } | null;
}

export interface MedicalRecordPatientOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface MedicalRecordDoctorOption {
    id: number;
    specialization: string;
    user?: { id: number; name: string };
}

export interface MedicalRecordVisitOption {
    id: number;
    visited_at: string;
    patient?: { id: number; full_name: string };
    doctor?: { id: number; user?: { id: number; name: string } };
}

export interface MedicalRecordsIndexProps {
    data: {
        data: MedicalRecord[];
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
        doctor_id?: string;
    };
}

export interface MedicalRecordsShowProps {
    record: MedicalRecord;
}

export interface MedicalRecordsFormProps {
    record?: MedicalRecord;
    patients: MedicalRecordPatientOption[];
    doctors: MedicalRecordDoctorOption[];
    patient_visit?: MedicalRecordVisitOption | null;
}
