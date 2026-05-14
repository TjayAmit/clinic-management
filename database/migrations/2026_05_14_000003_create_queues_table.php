<?php

use App\Enums\QueueStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->cascadeOnDelete();
            $table->date('queue_date');
            $table->unsignedInteger('position');
            $table->enum('status', array_column(QueueStatus::cases(), 'value'))
                ->default(QueueStatus::Waiting->value);
            $table->timestamp('called_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['appointment_id', 'queue_date']);
            $table->index(['queue_date', 'status']);
            $table->index(['queue_date', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
