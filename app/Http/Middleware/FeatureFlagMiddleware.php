<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Repositories\FeatureRepository;

class FeatureFlagMiddleware
{
    public function __construct(
        protected FeatureRepository $repository
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $routeName = $request->route()?->getName();
        
        if (!$routeName) {
            return $next($request);
        }

        // Define feature flags required for each route/module
        $routeFeatureFlags = $this->getRouteFeatureFlags($routeName);
        
        foreach ($routeFeatureFlags as $featureFlag) {
            if (!$this->isFeatureEnabled($featureFlag)) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Feature disabled',
                        'feature' => $featureFlag,
                    ], 403);
                }
                
                return redirect()->back()->with('error', "The '{$featureFlag}' feature is currently disabled.");
            }
        }

        return $next($request);
    }

    /**
     * Get feature flags required for specific routes.
     */
    protected function getRouteFeatureFlags(string $routeName): array
    {
        $featureFlags = [
            // Doctors
            'doctors.index' => ['doctors_management'],
            'doctors.create' => ['doctors_management'],
            'doctors.store' => ['doctors_management'],
            'doctors.show' => ['doctors_management'],
            'doctors.edit' => ['doctors_management'],
            'doctors.update' => ['doctors_management'],
            'doctors.destroy' => ['doctors_management'],
            'doctors.calendar' => ['doctors_management'],

            // Doctor Schedules
            'doctor-schedules.index' => ['doctor_schedules'],
            'doctor-schedules.store' => ['doctor_schedules'],
            'doctor-schedules.update' => ['doctor_schedules'],
            'doctor-schedules.destroy' => ['doctor_schedules'],

            // Schedule
            'schedule' => ['schedule_view'],

            // Daily Board
            'daily-board' => ['daily_board'],

            // Patients
            'patients.index' => ['patients_management'],
            'patients.create' => ['patients_management'],
            'patients.store' => ['patients_management'],
            'patients.show' => ['patients_management'],
            'patients.edit' => ['patients_management'],
            'patients.update' => ['patients_management'],
            'patients.destroy' => ['patients_management'],
            'patients.toggle-regular' => ['patients_management'],

            // Services
            'services.index' => ['services_management'],
            'services.create' => ['services_management'],
            'services.store' => ['services_management'],
            'services.show' => ['services_management'],
            'services.edit' => ['services_management'],
            'services.update' => ['services_management'],
            'services.destroy' => ['services_management'],

            // Features
            'features.index' => ['features_management'],
            'features.create' => ['features_management'],
            'features.store' => ['features_management'],
            'features.show' => ['features_management'],
            'features.edit' => ['features_management'],
            'features.update' => ['features_management'],
            'features.destroy' => ['features_management'],
            'features.enable' => ['features_management'],
            'features.disable' => ['features_management'],

            // Appointments
            'appointments.index' => ['appointments_management'],
            'appointments.create' => ['appointments_management'],
            'appointments.store' => ['appointments_management'],
            'appointments.show' => ['appointments_management'],
            'appointments.edit' => ['appointments_management'],
            'appointments.update' => ['appointments_management'],
            'appointments.destroy' => ['appointments_management'],
            'appointments.confirm' => ['appointments_management'],
            'appointments.in-queue' => ['appointments_management'],
            'appointments.in-progress' => ['appointments_management'],
            'appointments.needs-follow-up' => ['appointments_management'],
            'appointments.cancel' => ['appointments_management'],
            'appointments.complete' => ['appointments_management'],
            'appointments.no-show' => ['appointments_management'],
            'appointments.follow-up' => ['appointments_management'],

            // Queue
            'queue.index' => ['queue_management'],
            'queue.store' => ['queue_management'],
            'queue.update' => ['queue_management'],
            'queue.destroy' => ['queue_management'],
            'queue.call' => ['queue_management'],
            'queue.complete' => ['queue_management'],
            'queue.no-show' => ['queue_management'],
            'queue.reorder' => ['queue_management'],

            // Patient Visits
            'patient-visits.index' => ['medical_records'],
            'patient-visits.create' => ['medical_records'],
            'patient-visits.store' => ['medical_records'],
            'patient-visits.show' => ['medical_records'],
            'patient-visits.edit' => ['medical_records'],
            'patient-visits.update' => ['medical_records'],
            'patient-visits.destroy' => ['medical_records'],
            'patient-visits.check-in' => ['medical_records'],
            'patient-visits.check-out' => ['medical_records'],

            // Dental Records
            'dental-records.index' => ['medical_records'],
            'dental-records.create' => ['medical_records'],
            'dental-records.store' => ['medical_records'],
            'dental-records.show' => ['medical_records'],
            'dental-records.edit' => ['medical_records'],
            'dental-records.update' => ['medical_records'],
            'dental-records.destroy' => ['medical_records'],

            // Users
            'users.index' => ['users_management'],
            'users.create' => ['users_management'],
            'users.store' => ['users_management'],
            'users.show' => ['users_management'],
            'users.edit' => ['users_management'],
            'users.update' => ['users_management'],
            'users.destroy' => ['users_management'],

            // Roles
            'roles.index' => ['roles_management'],
            'roles.create' => ['roles_management'],
            'roles.store' => ['roles_management'],
            'roles.show' => ['roles_management'],
            'roles.edit' => ['roles_management'],
            'roles.update' => ['roles_management'],
            'roles.destroy' => ['roles_management'],

            // Activity Logs
            'activityLogs.index' => ['activity_logs'],
            'activityLogs.show' => ['activity_logs'],
            'activityLogs.destroy' => ['activity_logs'],
        ];

        return $featureFlags[$routeName] ?? [];
    }

    /**
     * Check if a feature flag is enabled.
     */
    protected function isFeatureEnabled(string $featureFlag): bool
    {
        $feature = $this->repository->findByKey($featureFlag);
        return $feature && $feature->isEnabled();
    }
}