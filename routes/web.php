<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\DailyBoardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\DoctorScheduleController;
use App\Http\Controllers\FeatureController;
use App\Http\Controllers\DentalRecordController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\DoctorCalendarController;
use App\Http\Controllers\QueueController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ScheduleController;
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
    Route::resource('doctors', DoctorController::class)->middleware([
        'index'   => 'can:doctors.view',
        'show'    => 'can:doctors.view',
        'create'  => 'can:doctors.create',
        'store'   => 'can:doctors.create',
        'edit'    => 'can:doctors.edit',
        'update'  => 'can:doctors.edit',
        'destroy' => 'can:doctors.delete',
    ]);
    Route::get('doctors/{doctor}/calendar', DoctorCalendarController::class)
        ->middleware('can:doctors.view')
        ->name('doctors.calendar');

    // Doctor Schedules (managed from doctor profile)
    Route::prefix('doctor-schedules')->name('doctor-schedules.')->middleware('can:doctor_schedules.view')->group(function () {
        Route::get('doctor/{doctor}', [DoctorScheduleController::class, 'index'])->name('index');
        Route::post('/', [DoctorScheduleController::class, 'store'])->middleware('can:doctor_schedules.create')->name('store');
        Route::put('{doctorSchedule}', [DoctorScheduleController::class, 'update'])->middleware('can:doctor_schedules.edit')->name('update');
        Route::delete('{doctorSchedule}', [DoctorScheduleController::class, 'destroy'])->middleware('can:doctor_schedules.delete')->name('destroy');
    });

    // Today's schedule
    Route::get('schedule', ScheduleController::class)->name('schedule');

    // Daily Board
    Route::get('daily-board', DailyBoardController::class)->name('daily-board');

    // Patients
    Route::resource('patients', PatientController::class)->middleware([
        'index'   => 'can:patients.view',
        'show'    => 'can:patients.view',
        'create'  => 'can:patients.create',
        'store'   => 'can:patients.create',
        'edit'    => 'can:patients.edit',
        'update'  => 'can:patients.edit',
        'destroy' => 'can:patients.delete',
    ]);
    Route::patch('patients/{patient}/toggle-regular', [PatientController::class, 'toggleRegular'])
        ->middleware('can:patients.edit')
        ->name('patients.toggle-regular');

    // Services
    Route::resource('services', ServiceController::class)->middleware([
        'index'   => 'can:services.view',
        'show'    => 'can:services.view',
        'create'  => 'can:services.create',
        'store'   => 'can:services.create',
        'edit'    => 'can:services.edit',
        'update'  => 'can:services.edit',
        'destroy' => 'can:services.delete',
    ]);

    // Features
    Route::resource('features', FeatureController::class)->middleware([
        'index'   => 'can:features.view',
        'show'    => 'can:features.view',
        'create'  => 'can:features.create',
        'store'   => 'can:features.create',
        'edit'    => 'can:features.edit',
        'update'  => 'can:features.edit',
        'destroy' => 'can:features.delete',
    ]);
    Route::patch('features/{feature}/enable', [FeatureController::class, 'enable'])
        ->middleware('can:features.edit')
        ->name('features.enable');
    Route::patch('features/{feature}/disable', [FeatureController::class, 'disable'])
        ->middleware('can:features.edit')
        ->name('features.disable');

    // Appointments
    Route::resource('appointments', AppointmentController::class)->middleware([
        'index'   => 'can:appointments.view',
        'show'    => 'can:appointments.view',
        'create'  => 'can:appointments.create',
        'store'   => 'can:appointments.create',
        'edit'    => 'can:appointments.edit',
        'update'  => 'can:appointments.edit',
        'destroy' => 'can:appointments.delete',
    ]);
    Route::patch('appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])
        ->middleware('can:appointments.confirm')
        ->name('appointments.confirm');
    Route::patch('appointments/{appointment}/in-queue', [AppointmentController::class, 'markInQueue'])
        ->middleware('can:appointments.edit')
        ->name('appointments.in-queue');
    Route::patch('appointments/{appointment}/in-progress', [AppointmentController::class, 'markInProgress'])
        ->middleware('can:appointments.edit')
        ->name('appointments.in-progress');
    Route::patch('appointments/{appointment}/needs-follow-up', [AppointmentController::class, 'needsFollowUp'])
        ->middleware('can:appointments.edit')
        ->name('appointments.needs-follow-up');
    Route::patch('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel'])
        ->middleware('can:appointments.cancel')
        ->name('appointments.cancel');
    Route::patch('appointments/{appointment}/complete', [AppointmentController::class, 'complete'])
        ->middleware('can:appointments.edit')
        ->name('appointments.complete');
    Route::patch('appointments/{appointment}/no-show', [AppointmentController::class, 'noShow'])
        ->middleware('can:appointments.edit')
        ->name('appointments.no-show');
    Route::post('appointments/{appointment}/follow-up', [AppointmentController::class, 'createFollowUp'])
        ->middleware('can:appointments.create')
        ->name('appointments.follow-up');

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
    Route::resource('patient-visits', PatientVisitController::class);
    Route::patch('patient-visits/{patientVisit}/check-in', [PatientVisitController::class, 'checkIn'])->name('patient-visits.check-in');
    Route::patch('patient-visits/{patientVisit}/check-out', [PatientVisitController::class, 'checkOut'])->name('patient-visits.check-out');

    // Dental Records
    Route::resource('dental-records', DentalRecordController::class)->middleware([
        'index'   => 'can:medical_records.view',
        'show'    => 'can:medical_records.view',
        'create'  => 'can:medical_records.create',
        'store'   => 'can:medical_records.create',
        'edit'    => 'can:medical_records.edit',
        'update'  => 'can:medical_records.edit',
        'destroy' => 'can:medical_records.delete',
    ]);

    // Users
    Route::resource('users', UserController::class)->middleware([
        'index'   => 'can:users.view',
        'show'    => 'can:users.view',
        'create'  => 'can:users.create',
        'store'   => 'can:users.create',
        'edit'    => 'can:users.edit',
        'update'  => 'can:users.edit',
        'destroy' => 'can:users.delete',
    ]);

    // Roles
    Route::resource('roles', RoleController::class);

    // Activity Logs
    Route::get('activity-logs', [ActivityLogController::class, 'index'])
        ->middleware('can:activity_logs.view')
        ->name('activityLogs.index');
    Route::get('activity-logs/{activityLog}', [ActivityLogController::class, 'show'])
        ->middleware('can:activity_logs.view')
        ->name('activityLogs.show');
    Route::delete('activity-logs/{activityLog}', [ActivityLogController::class, 'destroy'])
        ->name('activityLogs.destroy');
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
