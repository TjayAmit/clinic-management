<?php

namespace App\DTOs;

use App\Models\Service;
use Illuminate\Http\Request;

readonly class ServiceData
{
    public function __construct(
        public ?string $name = null,
        public ?string $description = null,
        public ?float $price = null,
        public int $duration_minutes = 30,
        public bool $is_active = true,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            name: $request->input('name'),
            description: $request->input('description'),
            price: $request->input('price'),
            duration_minutes: $request->integer('duration_minutes', 30),
            is_active: $request->boolean('is_active', true),
        );
    }

    public static function fromModel(Service $service): self
    {
        return new self(
            name: $service->name,
            description: $service->description,
            price: (float) $service->price,
            duration_minutes: $service->duration_minutes,
            is_active: $service->is_active,
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
