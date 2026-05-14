export type ServiceCategory = 'single_visit' | 'long_term';

export interface Service {
    id: number;
    name: string;
    description: string | null;
    category: ServiceCategory;
    price: string;
    duration_minutes: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServicesIndexProps {
    data: {
        data: Service[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string; active_only?: boolean };
}

export interface ServicesShowProps {
    service: Service;
}

export interface ServicesFormProps {
    service?: Service;
}
