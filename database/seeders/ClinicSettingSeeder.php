<?php

namespace Database\Seeders;

use App\Models\ClinicSetting;
use Illuminate\Database\Seeder;

class ClinicSettingSeeder extends Seeder
{
    public function run(): void
    {
        ClinicSetting::firstOrCreate(
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
