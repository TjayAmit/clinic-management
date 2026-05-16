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
