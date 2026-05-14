<?php

namespace App\Http\Requests;

use App\Enums\QueueStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QueueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'appointment_id' => ['required', 'exists:appointments,id'],
            'queue_date'     => ['required', 'date'],
            'position'       => ['nullable', 'integer', 'min:1'],
            'status'         => ['sometimes', Rule::enum(QueueStatus::class)],
        ];
    }
}
