<?php

namespace App\DTOs;

use Illuminate\Http\Request;

readonly class QueueData
{
    public function __construct(
        public ?int $appointment_id = null,
        public ?string $queue_date = null,
        public ?int $position = null,
        public string $status = 'waiting',
        public ?string $called_at = null,
        public ?string $completed_at = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            appointment_id: $request->input('appointment_id'),
            queue_date: $request->input('queue_date'),
            position: $request->input('position'),
            status: $request->input('status', 'waiting'),
            called_at: $request->input('called_at'),
            completed_at: $request->input('completed_at'),
        );
    }

    public function toArray(): array
    {
        return array_filter(get_object_vars($this), fn ($value) => $value !== null);
    }
}
