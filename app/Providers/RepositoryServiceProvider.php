<?php

namespace App\Providers;

use App\Repositories\Eloquent\{
    EloquentAppointmentRepository,
    EloquentDoctorRepository,
    EloquentDoctorScheduleRepository,
    EloquentDentalRecordRepository,
    EloquentFeatureRepository,
    EloquentPatientRepository,
    EloquentPatientVisitRepository,
    EloquentQueueRepository,
    EloquentServiceRepository,
    EloquentUserRepository,
};

use App\Repositories\{
    AppointmentRepository,
    DoctorRepository,
    DoctorScheduleRepository,
    DentalRecordRepository,
    FeatureRepository,
    PatientRepository,
    PatientVisitRepository,
    QueueRepository,
    ServiceRepository,
    UserRepository,
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
            PatientRepository::class,
            EloquentPatientRepository::class
        );

        $this->app->bind(
            ServiceRepository::class,
            EloquentServiceRepository::class
        );

        $this->app->bind(
            DoctorScheduleRepository::class,
            EloquentDoctorScheduleRepository::class
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
    }
}
