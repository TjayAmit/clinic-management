<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'patient_id', 'dentist_id', 'service_id', 'appointment_date',
    'start_time', 'end_time', 'status', 'notes', 'created_by',
])]
class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
            'status' => AppointmentStatus::class,
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'dentist_id');
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
}
