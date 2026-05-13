<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['doctor_id', 'day_of_week', 'start_time', 'end_time', 'is_available'])]
class DoctorSchedule extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
        ];
    }

    protected function dayName(): Attribute
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return Attribute::make(
            get: fn () => $days[$this->day_of_week] ?? 'Unknown',
        );
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }
}
