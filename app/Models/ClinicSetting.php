<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicSetting extends Model
{
    protected $fillable = [
        'clinic_name',
        'owner_name',
        'phone',
        'email',
        'address',
        'city',
        'open_time',
        'close_time',
        'open_days',
        'appointment_interval_minutes',
        'logo_path',
        'timezone',
    ];

    protected $casts = [
        'open_days' => 'array',
        'appointment_interval_minutes' => 'integer',
    ];

}
