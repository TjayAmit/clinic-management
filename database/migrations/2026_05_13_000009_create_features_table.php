<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('key', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_enabled')->default(false);
            $table->foreignId('enabled_by')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamp('enabled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['key']);
            $table->index(['is_enabled']);
            $table->index(['deleted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('features');
    }
};
