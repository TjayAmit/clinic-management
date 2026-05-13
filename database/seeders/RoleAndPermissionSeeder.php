<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Patients
            'patients.view',
            'patients.create',
            'patients.edit',
            'patients.delete',

            // Doctors
            'doctors.view',
            'doctors.create',
            'doctors.edit',
            'doctors.delete',

            // Appointments
            'appointments.view',
            'appointments.create',
            'appointments.edit',
            'appointments.delete',
            'appointments.confirm',
            'appointments.cancel',

            // Medical Records
            'medical_records.view',
            'medical_records.create',
            'medical_records.edit',
            'medical_records.delete',

            // Services
            'services.view',
            'services.create',
            'services.edit',
            'services.delete',

            // Doctor Schedules
            'doctor_schedules.view',
            'doctor_schedules.create',
            'doctor_schedules.edit',
            'doctor_schedules.delete',

            // Notifications
            'notifications.view',

            // Reports
            'reports.view',

            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',

            // Activity Logs
            'activity_logs.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin — full access
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->givePermissionTo(Permission::all());

        // Doctor — own appointments, own patients, manage medical records, view notifications
        $doctor = Role::firstOrCreate(['name' => 'Doctor']);
        $doctor->givePermissionTo([
            'patients.view',
            'appointments.view',
            'medical_records.view',
            'medical_records.create',
            'medical_records.edit',
            'services.view',
            'doctor_schedules.view',
            'notifications.view',
        ]);

        // Staff — manage appointments and patients, no access to medical records or admin areas
        $staff = Role::firstOrCreate(['name' => 'Staff']);
        $staff->givePermissionTo([
            'patients.view',
            'patients.create',
            'patients.edit',
            'doctors.view',
            'appointments.view',
            'appointments.create',
            'appointments.edit',
            'appointments.confirm',
            'appointments.cancel',
            'services.view',
            'doctor_schedules.view',
            'notifications.view',
        ]);
    }
}
