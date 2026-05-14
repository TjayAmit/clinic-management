<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\DentalRecordController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', DashboardController::class)->name('dashboard');

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

    // Features
    Route::resource('features', FeatureController::class);
    Route::patch('features/{feature}/enable', [FeatureController::class, 'enable'])->name('features.enable');
    Route::patch('features/{feature}/disable', [FeatureController::class, 'disable'])->name('features.disable');

    // Appointments
    Route::resource('appointments', AppointmentController::class);
    Route::patch('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->name('appointments.confirm');
    Route::patch('appointments/{appointment}/in-queue', [AppointmentController::class, 'markInQueue'])->name('appointments.in-queue');
    Route::patch('appointments/{appointment}/in-progress', [AppointmentController::class, 'markInProgress'])->name('appointments.in-progress');
    Route::patch('appointments/{appointment}/needs-follow-up', [AppointmentController::class, 'needsFollowUp'])->name('appointments.needs-follow-up');
    Route::patch('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('appointments.cancel');
    Route::patch('appointments/{appointment}/complete', [AppointmentController::class, 'complete'])->name('appointments.complete');
    Route::patch('appointments/{appointment}/no-show', [AppointmentController::class, 'noShow'])->name('appointments.no-show');
    Route::post('appointments/{appointment}/follow-up', [AppointmentController::class, 'createFollowUp'])->name('appointments.follow-up');

    // Queue
    Route::prefix('queue')->name('queue.')->group(function () {
        Route::get('/', [QueueController::class, 'index'])->name('index');
        Route::post('/', [QueueController::class, 'store'])->name('store');
        Route::put('{queue}', [QueueController::class, 'update'])->name('update');
        Route::delete('{queue}', [QueueController::class, 'destroy'])->name('destroy');
        Route::patch('{queue}/call', [QueueController::class, 'call'])->name('call');
        Route::patch('{queue}/complete', [QueueController::class, 'complete'])->name('complete');
        Route::patch('{queue}/no-show', [QueueController::class, 'noShow'])->name('no-show');
        Route::post('reorder', [QueueController::class, 'reorder'])->name('reorder');
    });

    // Patient Visits
    Route::resource('patient-visits', PatientVisitController::class)->except(['create', 'edit']);
    Route::patch('patient-visits/{patientVisit}/check-in', [PatientVisitController::class, 'checkIn'])->name('patient-visits.check-in');
    Route::patch('patient-visits/{patientVisit}/check-out', [PatientVisitController::class, 'checkOut'])->name('patient-visits.check-out');

    // Dental Records
    Route::resource('dental-records', DentalRecordController::class);

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
    Route::middleware('auth')->group(function () {
        Route::post('/dev/switch-user/{user}', [\App\Http\Controllers\Dev\SwitchUserController::class, '__invoke'])
            ->name('dev.switch-user');

    });
    
    // Email previews
    Route::get('/dev/email-preview', [\App\Http\Controllers\Dev\EmailPreviewController::class, 'index'])
        ->name('dev.email-preview.index');
    Route::get('/dev/email-preview/{key}', [\App\Http\Controllers\Dev\EmailPreviewController::class, 'show'])
        ->name('dev.email-preview.show');
}

require __DIR__.'/settings.php';
