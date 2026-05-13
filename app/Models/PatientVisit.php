<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'patient_id', 'doctor_id', 'appointment_id', 'visited_at',
    'check_in_at', 'check_out_at', 'blood_pressure', 'temperature',
    'weight', 'heart_rate', 'notes',
])]
class PatientVisit extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'visited_at'   => 'datetime',
            'check_in_at'  => 'datetime',
            'check_out_at' => 'datetime',
            'temperature'  => 'decimal:1',
            'weight'       => 'decimal:2',
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

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function medicalRecord(): HasOne
    {
        return $this->hasOne(MedicalRecord::class, 'patient_visit_id');
    }
}
