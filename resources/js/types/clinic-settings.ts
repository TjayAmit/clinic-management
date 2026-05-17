export interface ClinicSetting {
    id: number;
    clinic_name: string;
    owner_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    open_time: string | null;
    close_time: string | null;
    open_days: string[] | null;
    appointment_interval_minutes: number | null;
    logo_path: string | null;
    timezone: string | null;
}

export interface ClinicSettingEditProps {
    settings: ClinicSetting;
}
