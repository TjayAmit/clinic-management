<?php

namespace Database\Factories;

use App\Models\DentalRecord;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\PatientVisit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DentalRecord>
 */
class DentalRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'patient_visit_id' => null,
            'patient_id' => Patient::factory(),
            'dentist_id' => Doctor::factory(),
            'chief_complaint' => fake()->randomElement([
                'Tooth pain in upper left molar',
                'Sensitivity to cold on lower right',
                'Bleeding gums during brushing',
                'Chipped front tooth',
                'Jaw pain and clicking',
                'Routine check-up and cleaning',
                'Loose filling on back tooth',
            ]),
            'diagnosis' => fake()->optional()->randomElement([
                'Dental caries (cavity)',
                'Gingivitis',
                'Periodontitis',
                'Dental abscess',
                'Cracked tooth syndrome',
                'Temporomandibular disorder (TMD)',
                'Tooth erosion',
            ]),
            'treatment' => fake()->optional()->randomElement([
                'Composite resin filling placed',
                'Scaling and root planing performed',
                'Extraction completed without complications',
                'Root canal treatment initiated',
                'Crown preparation and temporary crown placed',
                'Fluoride varnish applied',
                'Occlusal adjustment performed',
            ]),
            'prescription' => fake()->optional()->randomElement([
                null,
                'Amoxicillin 500mg TID x 7 days',
                'Ibuprofen 400mg PRN for pain',
                'Chlorhexidine mouthwash 0.12% BID x 2 weeks',
                'Metronidazole 400mg TID x 5 days',
            ]),
            'notes' => fake()->optional()->sentence(),
        ];
    }

    public function withVisit(): static
    {
        return $this->state(fn (array $attributes) => [
            'patient_visit_id' => PatientVisit::factory()->state([
                'patient_id' => $attributes['patient_id'],
                'doctor_id' => $attributes['dentist_id'],
            ]),
        ]);
    }
}
