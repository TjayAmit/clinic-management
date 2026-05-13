<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stores the weekly recurring availability per dentist
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dentist_id')->constrained('doctors')->cascadeOnDelete();
            $table->tinyInteger('day_of_week'); // 0=Sunday … 6=Saturday
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_available')->default(true);
            $table->timestamps();

            $table->unique(['dentist_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
