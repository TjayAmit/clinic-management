<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FeatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'key' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9_-]+$/'],
            'description' => ['nullable', 'string'],
            'is_enabled' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'key.regex' => 'The key must only contain lowercase letters, numbers, hyphens, and underscores.',
        ];
    }
}
