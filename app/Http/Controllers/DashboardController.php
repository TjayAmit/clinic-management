<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\DentalRecord;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $roles = $user->getRoleNames()->toArray();
        $today = Carbon::today();
        $weekEnd = $today->copy()->addDays(6);

        $stats = [];
        $todayAppointments = [];
        $recentAppointments = [];
        $recentPatients = [];
        $recentRecords = [];
        $statusBreakdown = [];

        // ─── Admin ───
        if (in_array('Admin', $roles)) {
            $stats = [
                ['label' => 'Total Patients', 'value' => Patient::count(), 'icon' => 'users'],
                ['label' => 'Total Doctors',  'value' => Doctor::count(),  'icon' => 'stethoscope'],
                ['label' => "Today's Appointments", 'value' => Appointment::whereDate('appointment_date', $today)->count(), 'icon' => 'calendar'],
                ['label' => 'Active Services', 'value' => Service::where('is_active', true)->count(), 'icon' => 'briefcase'],
            ];

            $todayAppointments = Appointment::with(['patient', 'doctor.user', 'service'])
                ->whereDate('appointment_date', $today)
                ->orderBy('start_time')
                ->limit(10)
                ->get();

            $recentAppointments = Appointment::with(['patient', 'doctor.user', 'service'])
                ->latest('created_at')
                ->limit(5)
                ->get();

            $statusBreakdown = [
                'pending' => Appointment::where('status', AppointmentStatus::Pending)->count(),
                'confirmed' => Appointment::where('status', AppointmentStatus::Confirmed)->count(),
                'completed' => Appointment::where('status', AppointmentStatus::Completed)->count(),
                'cancelled' => Appointment::where('status', AppointmentStatus::Cancelled)->count(),
                'no_show' => Appointment::where('status', AppointmentStatus::NoShow)->count(),
            ];
        }

        // ─── Staff ───
        if (in_array('Staff', $roles)) {
            $stats = [
                ['label' => "Today's Appointments", 'value' => Appointment::whereDate('appointment_date', $today)->count(), 'icon' => 'calendar'],
                ['label' => 'Pending', 'value' => Appointment::where('status', AppointmentStatus::Pending)->count(), 'icon' => 'clock'],
                ['label' => 'Total Patients', 'value' => Patient::count(), 'icon' => 'users'],
                ['label' => 'Upcoming Week', 'value' => Appointment::whereBetween('appointment_date', [$today, $weekEnd])->count(), 'icon' => 'calendar-days'],
            ];

            $todayAppointments = Appointment::with(['patient', 'doctor.user', 'service'])
                ->whereDate('appointment_date', $today)
                ->orderBy('start_time')
                ->limit(10)
                ->get();

            $recentPatients = Patient::latest('created_at')->limit(5)->get();
        }

        // ─── Doctor ───
        if (in_array('Doctor', $roles) && $user->doctor) {
            $doctorId = $user->doctor->id;

            $stats = [
                ['label' => "My Today's", 'value' => Appointment::where('doctor_id', $doctorId)->whereDate('appointment_date', $today)->count(), 'icon' => 'calendar'],
                ['label' => 'My Upcoming', 'value' => Appointment::where('doctor_id', $doctorId)->whereDate('appointment_date', '>', $today)->count(), 'icon' => 'calendar-days'],
                ['label' => 'My Patients', 'value' => Appointment::where('doctor_id', $doctorId)->distinct('patient_id')->count('patient_id'), 'icon' => 'users'],
                ['label' => 'My Records', 'value' => DentalRecord::where('dentist_id', $doctorId)->count(), 'icon' => 'clipboard'],
            ];

            $todayAppointments = Appointment::with(['patient', 'service'])
                ->where('doctor_id', $doctorId)
                ->whereDate('appointment_date', $today)
                ->orderBy('start_time')
                ->limit(10)
                ->get();

            $recentRecords = DentalRecord::with(['patient'])
                ->where('dentist_id', $doctorId)
                ->latest('created_at')
                ->limit(5)
                ->get();
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'todayAppointments' => $todayAppointments,
            'recentAppointments' => $recentAppointments,
            'recentPatients' => $recentPatients,
            'recentRecords' => $recentRecords,
            'statusBreakdown' => $statusBreakdown,
            'userRoles' => $roles,
        ]);
    }
}
