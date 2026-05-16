<?php

namespace App\Models;

use App\Enums\Gender;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'first_name', 'last_name', 'date_of_birth', 'gender', 'blood_type',
    'phone', 'email', 'address', 'emergency_contact_name',
    'emergency_contact_phone', 'allergies', 'dental_history', 'is_regular',
])]
class Patient extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $appends = ['full_name'];

    public function routeNotificationForMail(): ?string
    {
        return $this->email;
    }

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'gender' => Gender::class,
            'is_regular' => 'boolean',
        ];
    }

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->first_name} {$this->last_name}",
        );
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(PatientVisit::class)->orderByDesc('visited_at');
    }

    public function dentalRecords(): HasMany
    {
        return $this->hasMany(DentalRecord::class)->orderByDesc('created_at');
    }
}
