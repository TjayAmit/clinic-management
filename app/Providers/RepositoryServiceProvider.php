<?php

namespace App\Providers;

use App\Repositories\{
    AppointmentRepository,
    ClinicSettingRepository,
    DentalRecordRepository,
    DoctorRepository,
    DoctorScheduleRepository,
    FeatureRepository,
    PatientRepository,
    PatientVisitRepository,
    QueueRepository,
    RoleRepository,
    ServiceRepository,
    UserRepository,
};

use App\Repositories\Eloquent\{
    EloquentAppointmentRepository,
    EloquentClinicSettingRepository,
    EloquentDentalRecordRepository,
    EloquentDoctorRepository,
    EloquentDoctorScheduleRepository,
    EloquentFeatureRepository,
    EloquentPatientRepository,
    EloquentPatientVisitRepository,
    EloquentQueueRepository,
    EloquentRoleRepository,
    EloquentServiceRepository,
    EloquentUserRepository,
};

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            UserRepository::class,
            EloquentUserRepository::class
        );

        $this->app->bind(
            DoctorRepository::class,
            EloquentDoctorRepository::class
        );

        $this->app->bind(
            FeatureRepository::class,
            EloquentFeatureRepository::class
        );

        $this->app->bind(
            PatientRepository::class,
            EloquentPatientRepository::class
        );

        $this->app->bind(
            ServiceRepository::class,
            EloquentServiceRepository::class
        );

        $this->app->bind(
            AppointmentRepository::class,
            EloquentAppointmentRepository::class
        );

        $this->app->bind(
            PatientVisitRepository::class,
            EloquentPatientVisitRepository::class
        );

        $this->app->bind(
            DentalRecordRepository::class,
            EloquentDentalRecordRepository::class
        );

        $this->app->bind(
            FeatureRepository::class,
            EloquentFeatureRepository::class
        );

        $this->app->bind(
            QueueRepository::class,
            EloquentQueueRepository::class
        );

        $this->app->bind(
            ClinicSettingRepository::class,
            EloquentClinicSettingRepository::class
        );

        $this->app->bind(
            RoleRepository::class,
            EloquentRoleRepository::class
        );

        $this->app->bind(
            DoctorScheduleRepository::class,
            EloquentDoctorScheduleRepository::class
        );
    }
}

