<?php

use App\Enums\AppointmentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('doctors')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->cascadeOnDelete();
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', array_column(AppointmentStatus::cases(), 'value'))->default(AppointmentStatus::Pending->value);
            $table->text('notes')->nullable();
            $table->boolean('is_walk_in')->default(false);
            $table->string('walk_in_name')->nullable();
            $table->json('teeth_involved')->nullable();
            $table->foreignId('parent_appointment_id')
                ->nullable()
                ->constrained('appointments')
                ->nullOnDelete();
            $table->unsignedInteger('series_total')->nullable();
            $table->unsignedInteger('series_position')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
