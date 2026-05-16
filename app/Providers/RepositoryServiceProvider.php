<?php

namespace App\Providers;

use App\Repositories\AppointmentRepository;
use App\Repositories\DentalRecordRepository;
use App\Repositories\DoctorRepository;
use App\Repositories\DoctorScheduleRepository;
use App\Repositories\Eloquent\EloquentAppointmentRepository;
use App\Repositories\Eloquent\EloquentDentalRecordRepository;
use App\Repositories\Eloquent\EloquentDoctorRepository;
use App\Repositories\Eloquent\EloquentDoctorScheduleRepository;
use App\Repositories\Eloquent\EloquentFeatureRepository;
use App\Repositories\Eloquent\EloquentPatientRepository;
use App\Repositories\Eloquent\EloquentPatientVisitRepository;
use App\Repositories\Eloquent\EloquentQueueRepository;
use App\Repositories\Eloquent\EloquentServiceRepository;
use App\Repositories\Eloquent\EloquentUserRepository;
use App\Repositories\FeatureRepository;
use App\Repositories\PatientRepository;
use App\Repositories\PatientVisitRepository;
use App\Repositories\QueueRepository;
use App\Repositories\ServiceRepository;
use App\Repositories\UserRepository;
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
