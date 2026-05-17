<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_settings', function (Blueprint $table) {
            $table->id();
            $table->string('clinic_name');
            $table->string('owner_name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->json('open_days')->nullable();
            $table->unsignedInteger('appointment_interval_minutes')->default(30);
            $table->string('logo_path')->nullable();
            $table->string('timezone')->default('Asia/Manila');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_settings');
    }
};
