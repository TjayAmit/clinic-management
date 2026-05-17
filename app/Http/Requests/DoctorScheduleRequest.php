<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DoctorScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->has('schedules')) {
            return [
                'schedules'                => ['required', 'array', 'min:1', 'max:7'],
                'schedules.*.scheduled_date'  => ['required', 'date', 'distinct'],
                'schedules.*.start_time'   => ['required_if:schedules.*.is_available,true', 'nullable', 'date_format:H:i'],
                'schedules.*.end_time'     => ['required_if:schedules.*.is_available,true', 'nullable', 'date_format:H:i', 'after:schedules.*.start_time'],
                'schedules.*.is_available' => ['required', 'boolean'],
            ];
        }

        $scheduleId = $this->route('schedule')?->id;
        $doctorId   = $this->input('doctor_id') ?? $this->route('schedule')?->doctor_id ?? auth()->user()?->doctor?->id;

        // Allow array of dates for multi-create (storeIndividual) and multi-update (updateIndividual)
        if (($this->isMethod('post') && ! $this->route('schedule')) || 
            ($this->isMethod('put') && $this->route('schedule'))) {
            return [
                'scheduled_date'    => ['required', 'array', 'min:1'],
                'scheduled_date.*'  => ['date'],
                'start_time'     => ['required_if:is_available,true', 'nullable', 'date_format:H:i'],
                'end_time'       => ['required_if:is_available,true', 'nullable', 'date_format:H:i', 'after:start_time'],
                'is_available'   => ['required', 'boolean'],
            ];
        }

        $scheduledDateRules = [
            'required',
            'date',
            \Illuminate\Validation\Rule::unique('doctor_schedules')
                ->where(fn ($q) => $q->where('doctor_id', $doctorId))
                ->ignore($scheduleId),
        ];

        return [
            'scheduled_date'    => $scheduledDateRules,
            'scheduled_date.*'  => ['date'],
            'start_time'     => ['required_if:is_available,true', 'nullable', 'date_format:H:i'],
            'end_time'       => ['required_if:is_available,true', 'nullable', 'date_format:H:i', 'after:start_time'],
            'is_available'   => ['required', 'boolean'],
        ];
    }
}
