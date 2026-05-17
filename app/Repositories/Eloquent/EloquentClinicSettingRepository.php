<?php

namespace App\Repositories\Eloquent;

use App\Models\ClinicSetting;
use App\Repositories\ClinicSettingRepository;

class EloquentClinicSettingRepository implements ClinicSettingRepository
{
    public function current(): ClinicSetting
    {
        return ClinicSetting::firstOrCreate(
            ['id' => 1],
            [
                'clinic_name'                  => 'My Clinic',
                'owner_name'                   => 'Owner',
                'phone'                        => '0000000000',
                'open_time'                    => '08:00',
                'close_time'                   => '17:00',
                'open_days'                    => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                'appointment_interval_minutes' => 30,
                'timezone'                     => 'Asia/Manila',
            ]
        );
    }

    public function update(array $data): ClinicSetting
    {
        $model = $this->current();
        $model->update($data);

        return $model->fresh();
    }
}
