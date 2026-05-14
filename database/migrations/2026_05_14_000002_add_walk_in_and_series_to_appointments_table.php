<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->boolean('is_walk_in')->default(false)->after('notes');
            $table->json('teeth_involved')->nullable()->after('is_walk_in');
            $table->foreignId('parent_appointment_id')
                ->nullable()
                ->constrained('appointments')
                ->nullOnDelete()
                ->after('teeth_involved');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['parent_appointment_id']);
            $table->dropColumn(['is_walk_in', 'teeth_involved', 'parent_appointment_id']);
        });
    }
};
