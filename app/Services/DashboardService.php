<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\DentalRecord;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use App\Repositories\AppointmentRepository;
use App\Repositories\DentalRecordRepository;
use App\Repositories\DoctorRepository;
use App\Repositories\PatientRepository;
use App\Repositories\ServiceRepository;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    public function __construct(
        protected AppointmentRepository $appointmentRepository,
        protected PatientRepository $patientRepository,
        protected DoctorRepository $doctorRepository,
        protected ServiceRepository $serviceRepository,
        protected DentalRecordRepository $dentalRecordRepository,
    ) {}

    public function getData(User $user): array
    {
        $roles = $user->getRoleNames()->toArray();
        $today = Carbon::today();
        $weekEnd = $today->copy()->addDays(6);

        $stats = [];
        $todayAppointments = [];
        $recentAppointments = [];
        $recentPatients = [];
        $recentRecords = [];
        $statusBreakdown = [];
        $weekAppointments = [];
        $doctorId = null;

        // ─── Admin ───
        if (in_array('Admin', $roles)) {
            $stats = [
                ['label' => 'Total Patients', 'value' => $this->patientRepository->all()->count(), 'icon' => 'users'],
                ['label' => 'Total Doctors',  'value' => $this->doctorRepository->all()->count(),  'icon' => 'stethoscope'],
                ['label' => "Today's Appointments", 'value' => $this->appointmentRepository->getByDate($today->toDateString())->count(), 'icon' => 'calendar'],
                ['label' => 'Active Services', 'value' => $this->serviceRepository->getActive()->count(), 'icon' => 'briefcase'],
            ];

            $todayAppointments = $this->appointmentRepository->getByDate($today->toDateString())
                ->take(10);

            $recentAppointments = $this->appointmentRepository->getByStatus('pending')
                ->take(5);

            $statusBreakdown = [
                'pending' => $this->appointmentRepository->getByStatus('pending')->count(),
                'confirmed' => $this->appointmentRepository->getByStatus('confirmed')->count(),
                'completed' => $this->appointmentRepository->getByStatus('completed')->count(),
                'cancelled' => $this->appointmentRepository->getByStatus('cancelled')->count(),
                'no_show' => $this->appointmentRepository->getByStatus('no_show')->count(),
            ];
        }

        // ─── Staff ───
        if (in_array('Staff', $roles)) {
            $stats = [
                ['label' => "Today's Appointments", 'value' => $this->appointmentRepository->getByDate($today->toDateString())->count(), 'icon' => 'calendar'],
                ['label' => 'Pending', 'value' => $this->appointmentRepository->getByStatus('pending')->count(), 'icon' => 'clock'],
                ['label' => 'Total Patients', 'value' => $this->patientRepository->all()->count(), 'icon' => 'users'],
                ['label' => 'Upcoming Week', 'value' => $this->appointmentRepository->getByDate($today->toDateString())->count(), 'icon' => 'calendar-days'],
            ];

            $todayAppointments = $this->appointmentRepository->getByDate($today->toDateString())
                ->take(10);

            $recentPatients = $this->patientRepository->all()->take(5);
        }

        // ─── Doctor ───
        if (in_array('Doctor', $roles) && $user->doctor) {
            $doctorId = $user->doctor->id;

            $stats = [
                ['label' => "My Today's", 'value' => $this->appointmentRepository->getByDoctor($doctorId, $today->toDateString())->count(), 'icon' => 'calendar'],
                ['label' => 'My Upcoming', 'value' => $this->appointmentRepository->getByDoctor($doctorId, $today->addDay()->toDateString())->count(), 'icon' => 'calendar-days'],
                ['label' => 'My Patients', 'value' => $this->appointmentRepository->getByDoctor($doctorId)->pluck('patient_id')->unique()->count(), 'icon' => 'users'],
                ['label' => 'My Records', 'value' => $this->dentalRecordRepository->getByDentist($doctorId)->count(), 'icon' => 'clipboard'],
            ];

            $todayAppointments = $this->appointmentRepository->getByDoctor($doctorId, $today->toDateString())
                ->take(10);

            $recentRecords = $this->dentalRecordRepository->getByDentist($doctorId)
                ->take(5);

            $weekAppts = $this->appointmentRepository->getByDoctor($doctorId)
                ->filter(fn ($a) => Carbon::parse($a->appointment_date)->between($today, $weekEnd));

            foreach ($weekAppts as $appt) {
                $dateKey = $appt->appointment_date->format('Y-m-d');
                $weekAppointments[$dateKey][] = $appt;
            }
        }

        return [
            'stats' => $stats,
            'todayAppointments' => $todayAppointments,
            'recentAppointments' => $recentAppointments,
            'recentPatients' => $recentPatients,
            'recentRecords' => $recentRecords,
            'statusBreakdown' => $statusBreakdown,
            'userRoles' => $roles,
            'weekAppointments' => $weekAppointments,
            'doctorId' => $doctorId,
        ];
    }
}
