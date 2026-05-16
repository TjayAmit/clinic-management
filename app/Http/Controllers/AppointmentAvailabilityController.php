<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AppointmentAvailabilityController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'date' => ['sometimes', 'date_format:Y-m-d'],
            'doctor_id' => ['sometimes', 'integer', 'exists:doctors,id'],
        ]);

        $carbon = Carbon::parse($request->input('date', today()->toDateString()));
        $dateString = $carbon->toDateString();
        $dayOfWeek = strtolower($carbon->format('l')); // e.g. "friday"

        $excludedStatuses = [AppointmentStatus::Cancelled->value, AppointmentStatus::NoShow->value];

        $doctors = Doctor::with(['user', 'schedules'])
            ->where('is_active', true)
            ->when($request->filled('doctor_id'), fn ($q) => $q->where('id', $request->integer('doctor_id')))
            ->get();

        if ($doctors->isEmpty()) {
            return response()->json([
                'date' => $dateString,
                'date_label' => $carbon->format('l, F j, Y'),
                'is_full' => true,
                'summary' => [
                    'total_minutes' => 0,
                    'booked_minutes' => 0,
                    'free_minutes' => 0,
                ],
                'doctors' => [],
            ]);
        }

        // Eager-load appointments for the given date in a single query, then key by doctor_id
        $doctorIds = $doctors->pluck('id');
        $appointmentsByDoctor = \App\Models\Appointment::whereIn('doctor_id', $doctorIds)
            ->whereDate('appointment_date', $dateString)
            ->whereNotIn('status', $excludedStatuses)
            ->get(['doctor_id', 'start_time', 'end_time'])
            ->groupBy('doctor_id');

        $totalMinutes = 0;
        $totalBooked = 0;
        $doctorData = [];
        $allFull = true;

        foreach ($doctors as $doctor) {
            /** @var \App\Models\DoctorSchedule|null $schedule */
            $schedule = $doctor->schedules->first(
                fn ($s) => $s->day_of_week instanceof \App\Enums\DayOfWeek
                    ? $s->day_of_week->value === $dayOfWeek
                    : $s->day_of_week === $dayOfWeek
            );

            // Doctors with no schedules at all are treated as always available (no window = unbounded).
            // Doctors who have schedules but none matching today are not working.
            $hasAnySchedules = $doctor->schedules->isNotEmpty();

            if ($hasAnySchedules && $schedule === null) {
                // Doctor has schedules configured but not for this day — not working today.
                $doctorData[] = [
                    'id' => $doctor->id,
                    'name' => 'Dr. '.$doctor->user->name,
                    'specialization' => $doctor->specialization,
                    'working_today' => false,
                    'schedule' => null,
                    'is_full' => true,
                    'booked_minutes' => 0,
                    'free_minutes' => 0,
                    'next_available' => null,
                ];
                continue;
            }

            if ($hasAnySchedules && $schedule !== null && ! $schedule->is_available) {
                // Schedule exists for today but marked unavailable.
                $doctorData[] = [
                    'id' => $doctor->id,
                    'name' => 'Dr. '.$doctor->user->name,
                    'specialization' => $doctor->specialization,
                    'working_today' => false,
                    'schedule' => null,
                    'is_full' => true,
                    'booked_minutes' => 0,
                    'free_minutes' => 0,
                    'next_available' => null,
                ];
                continue;
            }

            // Working today — either no schedules at all, or has a matching available schedule.
            $allFull = false; // At least one doctor is working; will be adjusted below per free_minutes.

            // Determine schedule window in minutes since midnight.
            if ($schedule !== null) {
                $windowStart = $this->toMinutes($schedule->start_time);
                $windowEnd = $this->toMinutes($schedule->end_time);
            } else {
                // No schedule configured: treat as full working day (08:00–17:00 default).
                $windowStart = 8 * 60;   // 480
                $windowEnd = 17 * 60;    // 1020
            }

            $windowDuration = max(0, $windowEnd - $windowStart);
            $totalMinutes += $windowDuration;

            // Build sorted booked intervals clamped to the schedule window.
            $appointments = $appointmentsByDoctor->get($doctor->id, collect());
            $intervals = $appointments
                ->map(fn ($a) => [
                    'start' => max($windowStart, $this->toMinutes($a->start_time)),
                    'end' => min($windowEnd, $this->toMinutes($a->end_time)),
                ])
                ->filter(fn ($i) => $i['end'] > $i['start'])
                ->sortBy('start')
                ->values()
                ->toArray();

            // Merge overlapping intervals to get true booked minutes.
            $merged = [];
            foreach ($intervals as $interval) {
                if (empty($merged)) {
                    $merged[] = $interval;
                } else {
                    $last = &$merged[count($merged) - 1];
                    if ($interval['start'] <= $last['end']) {
                        $last['end'] = max($last['end'], $interval['end']);
                    } else {
                        $merged[] = $interval;
                    }
                }
            }

            $bookedMinutes = array_sum(array_map(fn ($i) => $i['end'] - $i['start'], $merged));
            $freeMinutes = max(0, $windowDuration - $bookedMinutes);
            $totalBooked += $bookedMinutes;

            $isDoctorFull = $freeMinutes <= 0;
            if ($isDoctorFull) {
                // This working doctor is full; don't flip $allFull back to false.
            } else {
                $allFull = false;
            }

            $nextAvailable = $this->computeNextAvailable($windowStart, $windowEnd, $merged);

            $doctorData[] = [
                'id' => $doctor->id,
                'name' => 'Dr. '.$doctor->user->name,
                'specialization' => $doctor->specialization,
                'working_today' => true,
                'schedule' => [
                    'start' => $this->fromMinutes($windowStart),
                    'end' => $this->fromMinutes($windowEnd),
                ],
                'is_full' => $isDoctorFull,
                'booked_minutes' => $bookedMinutes,
                'free_minutes' => $freeMinutes,
                'next_available' => $nextAvailable,
            ];
        }

        // If every entry in $doctorData has working_today = false, $allFull should stay true.
        // Re-derive: overall is_full = no working doctor has free_minutes > 0.
        $workingDoctors = collect($doctorData)->where('working_today', true);
        $overallFull = $workingDoctors->isEmpty() || $workingDoctors->every(fn ($d) => $d['is_full']);

        return response()->json([
            'date' => $dateString,
            'date_label' => $carbon->format('l, F j, Y'),
            'is_full' => $overallFull,
            'summary' => [
                'total_minutes' => $totalMinutes,
                'booked_minutes' => $totalBooked,
                'free_minutes' => max(0, $totalMinutes - $totalBooked),
            ],
            'doctors' => $doctorData,
        ]);
    }

    private function toMinutes(string $time): int
    {
        [$h, $m] = array_map('intval', explode(':', $time));

        return $h * 60 + $m;
    }

    private function fromMinutes(int $minutes): string
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    /**
     * Find the first minute in [windowStart, windowEnd) not covered by any merged interval.
     * Intervals must already be sorted and merged.
     *
     * @param  array<int, array{start: int, end: int}>  $mergedIntervals
     */
    private function computeNextAvailable(int $windowStart, int $windowEnd, array $mergedIntervals): ?string
    {
        $cursor = $windowStart;

        foreach ($mergedIntervals as $interval) {
            if ($cursor < $interval['start']) {
                // Gap found before this interval.
                return $this->fromMinutes($cursor);
            }
            // Advance cursor past this interval.
            if ($cursor < $interval['end']) {
                $cursor = $interval['end'];
            }
        }

        // Gap after all intervals (or no intervals at all).
        if ($cursor < $windowEnd) {
            return $this->fromMinutes($cursor);
        }

        return null;
    }
}
