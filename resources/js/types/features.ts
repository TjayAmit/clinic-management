export interface Feature {
    id: number;
    name: string;
    key: string;
    description: string | null;
    is_enabled: boolean;
    enabled_by: number | null;
    enabled_at: string | null;
    created_at: string;
    updated_at: string;
    enabledBy?: { id: number; name: string };
}

export interface FeaturesIndexProps {
    data: {
        data: Feature[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: { search?: string; enabled_only?: boolean };
}

export interface FeaturesShowProps {
    feature: Feature;
}

export interface FeaturesFormProps {
    feature?: Feature;
}
