<?php

namespace App\Http\Requests;

use App\Enums\DayOfWeek;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class DoctorScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'schedules'                  => ['required', 'array', 'min:1', 'max:7'],
            'schedules.*.day_of_week'    => ['required', 'string', new Enum(DayOfWeek::class), 'distinct'],
            'schedules.*.start_time'     => ['required_if:schedules.*.is_available,true', 'nullable', 'date_format:H:i'],
            'schedules.*.end_time'       => ['required_if:schedules.*.is_available,true', 'nullable', 'date_format:H:i', 'after:schedules.*.start_time'],
            'schedules.*.is_available'   => ['required', 'boolean'],
        ];
    }
}
