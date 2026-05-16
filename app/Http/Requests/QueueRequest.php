<?php

namespace App\Http\Requests;

use App\Enums\QueueStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class QueueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $queueDate = $this->input('queue_date', Carbon::today()->toDateString());

        return [
            'appointment_id' => [
                'required',
                'exists:appointments,id',
                Rule::unique('queues')->where(fn ($query) => $query->where('queue_date', $queueDate)
                ),
            ],
            'queue_date' => ['nullable', 'date'],
            'position' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::enum(QueueStatus::class)],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_id.unique' => 'This appointment is already in the queue for today.',
        ];
    }
}
