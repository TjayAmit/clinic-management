<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'patient_visit_id', 'patient_id', 'dentist_id',
    'chief_complaint', 'diagnosis', 'treatment', 'prescription', 'notes',
])]
class DentalRecord extends Model
{
    use HasFactory, SoftDeletes;

    public function patientVisit(): BelongsTo
    {
        return $this->belongsTo(PatientVisit::class, 'patient_visit_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'dentist_id');
    }
}
