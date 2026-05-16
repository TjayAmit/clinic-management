<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'patient_id', 'doctor_id', 'service_id', 'appointment_date',
    'start_time', 'end_time', 'status', 'notes', 'created_by',
    'is_walk_in', 'teeth_involved', 'parent_appointment_id',
    'series_total', 'series_position',
])]
class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'status' => AppointmentStatus::class,
            'is_walk_in' => 'boolean',
            'teeth_involved' => 'array',
            'series_total' => 'integer',
            'series_position' => 'integer',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function visit(): HasOne
    {
        return $this->hasOne(PatientVisit::class);
    }

    public function queue(): HasOne
    {
        return $this->hasOne(Queue::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'parent_appointment_id');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(Appointment::class, 'parent_appointment_id');
    }

    public function scopeForUser(Builder $query, User $user): Builder
    {
        if ($user->hasRole('Doctor')) {
            return $query->whereHas('doctor', fn ($q) => $q->where('user_id', $user->id));
        }

        return $query;
    }
}
