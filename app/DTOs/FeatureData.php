<?php

namespace App\DTOs;

use App\Models\Feature;
use Illuminate\Http\Request;

readonly class FeatureData
{
    public function __construct(
        public ?string $name = null,
        public ?string $key = null,
        public ?string $description = null,
        public bool $is_enabled = false,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name'),
            key: $request->input('key'),
            description: $request->input('description'),
            is_enabled: $request->boolean('is_enabled', false),
        );
    }

    public static function fromModel(Feature $feature): self
    {
        return new self(
            name: $feature->name,
            key: $feature->key,
            description: $feature->description,
            is_enabled: $feature->is_enabled,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
