<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Repositories\AppointmentRepository;
use App\Repositories\DoctorRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AppointmentAvailabilityService
{
    private const WINDOW_START = 480;  // 08:00
    private const WINDOW_END   = 1080; // 18:00
    private const SLOT_MINUTES = 60;

    public function __construct(
        protected AppointmentRepository $appointmentRepository,
        protected DoctorRepository $doctorRepository,
    ) {}

    public function handleMonthly(Request $request): array
    {
        $request->validate(['month' => ['required', 'date_format:Y-m']]);

        $month    = Carbon::createFromFormat('Y-m', $request->input('month'))->startOfMonth();
        $endDate  = $month->copy()->endOfMonth();
        $excluded = [AppointmentStatus::Cancelled->value, AppointmentStatus::NoShow->value];

        $activeDoctors = $this->doctorRepository->all()->where('is_active', true)->count();

        if ($activeDoctors === 0) {
            return ['month' => $request->input('month'), 'days' => []];
        }

        $windowDuration = self::WINDOW_END - self::WINDOW_START;
        $totalCapacity  = $activeDoctors * $windowDuration;

        $appointments = Appointment::whereDate('appointment_date', '>=', $month)
            ->whereDate('appointment_date', '<=', $endDate)
            ->whereNotIn('status', $excluded)
            ->get(['appointment_date', 'start_time', 'end_time', 'doctor_id']);

        $byDate = $appointments->groupBy(
            fn ($a) => Carbon::parse($a->appointment_date)->toDateString()
        );

        $days   = [];
        $cursor = $month->copy();

        while ($cursor <= $endDate) {
            $dateKey  = $cursor->toDateString();
            $dayAppts = $byDate->get($dateKey, collect());
            $booked   = 0;

            foreach ($dayAppts->groupBy('doctor_id') as $doctorAppts) {
                $booked += $this->bookedMinutes(
                    $doctorAppts->map(fn ($a) => [$a->start_time, $a->end_time])->toArray()
                );
            }

            $freeMinutes = max(0, $totalCapacity - $booked);

            $days[$dateKey] = [
                'is_full'           => $freeMinutes <= 0,
                'free_minutes'      => $freeMinutes,
                'appointment_count' => $dayAppts->count(),
            ];

            $cursor->addDay();
        }

        return ['month' => $request->input('month'), 'days' => $days];
    }

    public function handleDaily(Request $request): array
    {
        $request->validate([
            'date'      => ['sometimes', 'date_format:Y-m-d'],
            'doctor_id' => ['sometimes', 'integer', 'exists:doctors,id'],
        ]);

        $carbon     = Carbon::parse($request->input('date', today()->toDateString()));
        $dateString = $carbon->toDateString();
        $excluded   = [AppointmentStatus::Cancelled->value, AppointmentStatus::NoShow->value];

        $doctors = $this->doctorRepository->all()->where('is_active', true);

        if ($request->filled('doctor_id')) {
            $doctors = $doctors->where('id', $request->integer('doctor_id'));
        }

        $doctors = $doctors->values();

        if ($doctors->isEmpty()) {
            return [
                'date'       => $dateString,
                'date_label' => $carbon->format('l, F j, Y'),
                'is_full'    => true,
                'slots'      => [],
                'summary'    => ['total_minutes' => 0, 'booked_minutes' => 0, 'free_minutes' => 0],
                'doctors'    => [],
            ];
        }

        $appointmentsByDoctor = Appointment::whereIn('doctor_id', $doctors->pluck('id'))
            ->whereDate('appointment_date', $dateString)
            ->whereNotIn('status', $excluded)
            ->get(['doctor_id', 'start_time', 'end_time'])
            ->groupBy('doctor_id');

        $totalMinutes            = 0;
        $totalBooked             = 0;
        $doctorData              = [];
        $allDoctorMergedIntervals = [];

        foreach ($doctors as $doctor) {
            $windowDuration = self::WINDOW_END - self::WINDOW_START;
            $totalMinutes  += $windowDuration;

            $appts        = $appointmentsByDoctor->get($doctor->id, collect());
            $rawIntervals = $appts->map(fn ($a) => [$a->start_time, $a->end_time])->toArray();
            $merged       = $this->mergeIntervals($rawIntervals);

            $bookedMins  = array_sum(array_map(fn ($i) => $i['end'] - $i['start'], $merged));
            $freeMins    = max(0, $windowDuration - $bookedMins);
            $totalBooked += $bookedMins;

            $allDoctorMergedIntervals[] = $merged;

            $doctorData[] = [
                'id'             => $doctor->id,
                'name'           => 'Dr. '.$doctor->user->name,
                'specialization' => $doctor->specialization,
                'working_today'  => true,
                'schedule'       => [
                    'start' => $this->fromMinutes(self::WINDOW_START),
                    'end'   => $this->fromMinutes(self::WINDOW_END),
                ],
                'is_full'        => $freeMins <= 0,
                'booked_minutes' => $bookedMins,
                'free_minutes'   => $freeMins,
                'next_available' => $this->nextAvailable(self::WINDOW_START, self::WINDOW_END, $merged),
            ];
        }

        $workingDoctors = collect($doctorData)->where('working_today', true);
        $overallFull    = $workingDoctors->isEmpty() || $workingDoctors->every(fn ($d) => $d['is_full']);

        return [
            'date'        => $dateString,
            'date_label'  => $carbon->format('l, F j, Y'),
            'is_full'     => $overallFull,
            'free_ranges' => $this->freeRanges($allDoctorMergedIntervals),
            'summary'     => [
                'total_minutes'  => $totalMinutes,
                'booked_minutes' => $totalBooked,
                'free_minutes'   => max(0, $totalMinutes - $totalBooked),
            ],
            'doctors' => $doctorData,
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function mergeIntervals(array $raw): array
    {
        $intervals = array_values(array_filter(
            array_map(fn ($r) => [
                'start' => max(self::WINDOW_START, $this->toMinutes($r[0])),
                'end'   => min(self::WINDOW_END,   $this->toMinutes($r[1])),
            ], $raw),
            fn ($i) => $i['end'] > $i['start']
        ));

        usort($intervals, fn ($a, $b) => $a['start'] <=> $b['start']);

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

        return $merged;
    }

    private function bookedMinutes(array $raw): int
    {
        $merged = $this->mergeIntervals($raw);

        return array_sum(array_map(fn ($i) => $i['end'] - $i['start'], $merged));
    }

    private function freeRanges(array $allMerged): array
    {
        $periods = [
            'morning'   => [self::WINDOW_START, 12 * 60],
            'afternoon' => [12 * 60,            self::WINDOW_END],
        ];

        $result = ['morning' => [], 'afternoon' => []];

        foreach ($periods as $period => [$pStart, $pEnd]) {
            $freeStart = null;

            for ($t = $pStart; $t < $pEnd; $t++) {
                $available = empty($allMerged);

                if (! $available) {
                    foreach ($allMerged as $merged) {
                        $doctorBooked = false;
                        foreach ($merged as $interval) {
                            if ($interval['start'] > $t) break;
                            if ($interval['end'] > $t) {
                                $doctorBooked = true;
                                break;
                            }
                        }
                        if (! $doctorBooked) {
                            $available = true;
                            break;
                        }
                    }
                }

                if ($available && $freeStart === null) {
                    $freeStart = $t;
                } elseif (! $available && $freeStart !== null) {
                    $result[$period][] = [
                        'from' => $this->fromMinutes($freeStart),
                        'to'   => $this->fromMinutes($t),
                    ];
                    $freeStart = null;
                }
            }

            if ($freeStart !== null) {
                $result[$period][] = [
                    'from' => $this->fromMinutes($freeStart),
                    'to'   => $this->fromMinutes($pEnd),
                ];
            }
        }

        return $result;
    }

    private function nextAvailable(int $windowStart, int $windowEnd, array $merged): ?string
    {
        $cursor = $windowStart;

        foreach ($merged as $interval) {
            if ($cursor < $interval['start']) {
                return $this->fromMinutes($cursor);
            }
            if ($cursor < $interval['end']) {
                $cursor = $interval['end'];
            }
        }

        return $cursor < $windowEnd ? $this->fromMinutes($cursor) : null;
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
}
