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
            'doctors.schedules.edit',

            // Appointments
            'appointments.view',
            'appointments.create',
            'appointments.edit',
            'appointments.delete',
            'appointments.confirm',
            'appointments.cancel',

            // Patient Visits
            'patient_visits.view',
            'patient_visits.create',
            'patient_visits.edit',
            'patient_visits.delete',
            'patient_visits.check_in',
            'patient_visits.check_out',

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

            // Features
            'features.view',
            'features.create',
            'features.edit',
            'features.delete',

            // Clinic Settings
            'clinic_settings.view',
            'clinic_settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Admin — full access (includes clinic_settings.view and clinic_settings.edit)
        $admin = Role::firstOrCreate(['name' => 'Admin']);
        $admin->givePermissionTo(Permission::all());

        // Doctor — own appointments, own patients, manage medical records, view notifications, view calendar
        $doctor = Role::firstOrCreate(['name' => 'Doctor']);
        $doctor->givePermissionTo([
            'patients.view',
            'appointments.view',
            'patient_visits.view',
            'patient_visits.create',
            'patient_visits.edit',
            'patient_visits.check_in',
            'patient_visits.check_out',
            'medical_records.view',
            'medical_records.create',
            'medical_records.edit',
            'services.view',
            'doctors.view',
            'doctors.schedules.edit',
            'notifications.view',
            'clinic_settings.view',
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
            'patient_visits.view',
            'patient_visits.create',
            'patient_visits.edit',
            'patient_visits.check_in',
            'patient_visits.check_out',
            'services.view',
            'notifications.view',
            'clinic_settings.view',
        ]);
    }
}
