<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $doctor = User::firstOrCreate(
            ['email' => 'doctor@clinic.test'],
            [
                'name' => 'Dr. Juan Dela Cruz',
                'password' => Hash::make('password'),
            ]
        );
        $doctor->assignRole('Doctor');

        Doctor::firstOrCreate(
            ['user_id' => $doctor->id],
            [
                'specialization' => 'General Dentistry',
                'license_number' => 'PTR-12345',
                'phone' => '09171234567',
                'bio' => 'Experienced general dentist with 10 years of practice.',
                'is_active' => true,
            ]
        );

        $staff = User::firstOrCreate(
            ['email' => 'staff@clinic.test'],
            [
                'name' => 'Maria Santos',
                'password' => Hash::make('password'),
            ]
        );

        $staff->assignRole('Staff');

        $this->command->info('Sample users seeded:');
        $this->command->info('  Doctor : doctor@clinic.test  (password: password)');
        $this->command->info('  Staff  : staff@clinic.test   (password: password)');
    }
}
