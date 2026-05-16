<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Doctor;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Cache;

class AvailabilityService
{
    private const WINDOW_START = 480;  // 08:00
    private const WINDOW_END   = 1080; // 18:00
    private const SLOT_MINUTES = 60;
    private const CACHE_TTL    = 3600; // 1 hour
    private const KEY_PREFIX   = 'availability:';

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Pre-compute and cache availability for today + the next 6 days (7 total).
     */
    public function warmWeek(): void
    {
        $today = CarbonImmutable::today();

        for ($i = 0; $i < 7; $i++) {
            $date = $today->addDays($i);
            $data = $this->computeForDate($date);
            Cache::put(self::KEY_PREFIX.$date->toDateString(), $data, self::CACHE_TTL);
        }
    }

    /**
     * Return cached data for a single date, falling back to live computation
     * when the cache key is absent.
     */
    public function forDate(CarbonInterface $date): array
    {
        $key = self::KEY_PREFIX.$date->toDateString();

        return Cache::remember($key, self::CACHE_TTL, fn () => $this->computeForDate($date));
    }

    /**
     * Return availability for today + 6 more days as an array keyed by date string.
     */
    public function weekAhead(): array
    {
        $today  = CarbonImmutable::today();
        $result = [];

        for ($i = 0; $i < 7; $i++) {
            $date             = $today->addDays($i);
            $result[$date->toDateString()] = $this->forDate($date);
        }

        return $result;
    }

    // ── Core Computation ───────────────────────────────────────────────────────

    /**
     * Compute the full daily availability payload for a given date.
     * This is the canonical implementation; the existing controller's handleDaily()
     * produces the same shape and is left untouched.
     */
    private function computeForDate(CarbonInterface $date): array
    {
        $dateString = $date->toDateString();
        $excluded   = [AppointmentStatus::Cancelled->value, AppointmentStatus::NoShow->value];

        // Eager-load user to avoid N+1 when building doctor data.
        $doctors = Doctor::with('user')
            ->where('is_active', true)
            ->get();

        if ($doctors->isEmpty()) {
            return [
                'date'       => $dateString,
                'date_label' => $date->format('l, F j, Y'),
                'is_full'    => true,
                'slots'      => [],
                'summary'    => ['total_minutes' => 0, 'booked_minutes' => 0, 'free_minutes' => 0],
                'doctors'    => [],
            ];
        }

        // One query: fetch all relevant appointments for the day, grouped by doctor.
        $appointmentsByDoctor = Appointment::whereIn('doctor_id', $doctors->pluck('id'))
            ->whereDate('appointment_date', $dateString)
            ->whereNotIn('status', $excluded)
            ->get(['doctor_id', 'start_time', 'end_time'])
            ->groupBy('doctor_id');

        $totalMinutes             = 0;
        $totalBooked              = 0;
        $doctorData               = [];
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
            'date'       => $dateString,
            'date_label' => $date->format('l, F j, Y'),
            'is_full'    => $overallFull,
            'slots'      => $this->hourlySlots($allDoctorMergedIntervals),
            'summary'    => [
                'total_minutes'  => $totalMinutes,
                'booked_minutes' => $totalBooked,
                'free_minutes'   => max(0, $totalMinutes - $totalBooked),
            ],
            'doctors' => $doctorData,
        ];
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Parse [[start_time, end_time], ...] strings → merged intervals clamped to window.
     *
     * @param  array<int, array{0: string, 1: string}>  $raw
     * @return array<int, array{start: int, end: int}>
     */
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

    /**
     * Build per-hour slot availability (08:00–18:00) across all doctors.
     * A slot is "available" if at least one doctor has free time in that hour.
     *
     * @param  array<int, array<int, array{start: int, end: int}>>  $allMerged
     * @return array<int, array{time: string, period: string, available: bool}>
     */
    private function hourlySlots(array $allMerged): array
    {
        $slots = [];

        for ($t = self::WINDOW_START; $t < self::WINDOW_END; $t += self::SLOT_MINUTES) {
            $slotEnd   = $t + self::SLOT_MINUTES;
            $available = false;

            foreach ($allMerged as $merged) {
                $booked = 0;
                foreach ($merged as $interval) {
                    $overlapStart = max($t, $interval['start']);
                    $overlapEnd   = min($slotEnd, $interval['end']);
                    if ($overlapEnd > $overlapStart) {
                        $booked += $overlapEnd - $overlapStart;
                    }
                }
                if ($booked < self::SLOT_MINUTES) {
                    $available = true;
                    break;
                }
            }

            $slots[] = [
                'time'      => $this->fromMinutes($t),
                'period'    => $t < 12 * 60 ? 'morning' : 'afternoon',
                'available' => $available,
            ];
        }

        return $slots;
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
