<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Doctors
    Route::resource('doctors', DoctorController::class);

    // Doctor Schedules (managed from doctor profile)
    Route::prefix('doctor-schedules')->name('doctor-schedules.')->group(function () {
        Route::get('doctor/{doctor}', [DoctorScheduleController::class, 'index'])->name('index');
        Route::post('/', [DoctorScheduleController::class, 'store'])->name('store');
        Route::put('{doctorSchedule}', [DoctorScheduleController::class, 'update'])->name('update');
        Route::delete('{doctorSchedule}', [DoctorScheduleController::class, 'destroy'])->name('destroy');
    });

    // Patients
    Route::resource('patients', PatientController::class);

    // Services
    Route::resource('services', ServiceController::class);

    // Appointments
    Route::resource('appointments', AppointmentController::class);
    Route::patch('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::patch('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
    Route::patch('appointments/{appointment}/complete', [AppointmentController::class, 'complete'])->name('appointments.complete');

    // Patient Visits
    Route::resource('patient-visits', PatientVisitController::class)->except(['create', 'edit']);
    Route::patch('patient-visits/{patientVisit}/check-in', [PatientVisitController::class, 'checkIn'])->name('patient-visits.check-in');
    Route::patch('patient-visits/{patientVisit}/check-out', [PatientVisitController::class, 'checkOut'])->name('patient-visits.check-out');

    // Medical Records
    Route::resource('medical-records', MedicalRecordController::class);

    // Users
    Route::resource('users', UserController::class);

    // Roles
    Route::resource('roles', RoleController::class);

    // Activity Logs
    Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activityLogs.index');
    Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->name('activityLogs.show');
    Route::delete('activity-logs/{activityLog}', [ActivityLogController::class, 'destroy'])->name('activityLogs.destroy');
});

if (app()->environment('local')) {
    Route::middleware('auth')
        ->post('/dev/switch-user/{user}', [\App\Http\Controllers\Dev\SwitchUserController::class, '__invoke'])
        ->name('dev.switch-user');
}

require __DIR__.'/settings.php';
