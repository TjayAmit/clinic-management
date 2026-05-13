<?php

namespace App\DTOs;

use App\Models\DoctorSchedule;
use Illuminate\Http\Request;

readonly class DoctorScheduleData
{
    public function __construct(
        public ?int $doctor_id = null,
        public ?int $day_of_week = null,
        public ?string $start_time = null,
        public ?string $end_time = null,
        public bool $is_available = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            doctor_id: $request->input('doctor_id'),
            day_of_week: $request->integer('day_of_week'),
            start_time: $request->input('start_time'),
            end_time: $request->input('end_time'),
            is_available: $request->boolean('is_available', true),
        );
    }

    public static function fromModel(DoctorSchedule $schedule): self
    {
        return new self(
            doctor_id: $schedule->doctor_id,
            day_of_week: $schedule->day_of_week,
            start_time: $schedule->start_time,
            end_time: $schedule->end_time,
            is_available: $schedule->is_available,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
