<?php

namespace App\DTOs;

use App\Models\ClinicSetting;
use Illuminate\Http\Request;

readonly class ClinicSettingData
{
    public function __construct(
        public string $clinic_name,
        public string $owner_name,
        public string $phone,
        public ?string $email,
        public ?string $address,
        public ?string $city,
        public ?string $open_time,
        public ?string $close_time,
        public ?array $open_days,
        public int $appointment_interval_minutes,
        public ?string $logo_path,
        public string $timezone,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            clinic_name: $request->input('clinic_name'),
            owner_name: $request->input('owner_name'),
            phone: $request->input('phone'),
            email: $request->input('email'),
            address: $request->input('address'),
            city: $request->input('city'),
            open_time: $request->input('open_time'),
            close_time: $request->input('close_time'),
            open_days: $request->input('open_days'),
            appointment_interval_minutes: $request->integer('appointment_interval_minutes', 30),
            logo_path: $request->input('logo_path'),
            timezone: $request->input('timezone', 'Asia/Manila'),
        );
    }

    public static function fromModel(ClinicSetting $setting): self
    {
        return new self(
            clinic_name: $setting->clinic_name,
            owner_name: $setting->owner_name,
            phone: $setting->phone,
            email: $setting->email,
            address: $setting->address,
            city: $setting->city,
            open_time: $setting->open_time,
            close_time: $setting->close_time,
            open_days: $setting->open_days,
            appointment_interval_minutes: $setting->appointment_interval_minutes,
            logo_path: $setting->logo_path,
            timezone: $setting->timezone,
        );
    }

    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
