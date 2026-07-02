<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('middle_name')->nullable()->after('first_name');
            $table->string('civil_status')->nullable()->after('gender');
            $table->string('occupation')->nullable()->after('civil_status');
            $table->string('nationality')->nullable()->after('occupation');
            $table->string('street_address')->nullable()->after('address');
            $table->string('city')->nullable()->after('street_address');
            $table->string('province')->nullable()->after('city');
            $table->string('emergency_contact_relationship')->nullable()->after('emergency_contact_phone');
            $table->text('medical_history')->nullable()->after('allergies');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'middle_name',
                'civil_status',
                'occupation',
                'nationality',
                'street_address',
                'city',
                'province',
                'emergency_contact_relationship',
                'medical_history',
            ]);
        });
    }
};
