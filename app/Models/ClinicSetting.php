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

    /**
     * Return the singleton settings record, creating it with defaults if it does not exist.
     */
    public static function current(): self
    {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'clinic_name'                   => 'My Clinic',
                'owner_name'                    => 'Owner',
                'phone'                         => '0000000000',
                'open_time'                     => '08:00',
                'close_time'                    => '17:00',
                'open_days'                     => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'appointment_interval_minutes'  => 30,
                'timezone'                      => 'Asia/Manila',
            ]
        );
    }
}
