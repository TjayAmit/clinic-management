<?php

namespace App\Repositories;

use App\Models\ClinicSetting;

interface ClinicSettingRepository
{
    public function current(): ClinicSetting;

    public function update(array $data): ClinicSetting;
}
