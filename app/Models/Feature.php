<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'key', 'description', 'is_enabled', 'enabled_by', 'enabled_at'])]
class Feature extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Get the user who enabled this feature flag.
     */
    public function enabledBy()
    {
        return $this->belongsTo(User::class, 'enabled_by');
    }

    /**
     * Scope a query to only include enabled feature flags.
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope a query to only include disabled feature flags.
     */
    public function scopeDisabled($query)
    {
        return $query->where('is_enabled', false);
    }

    /**
     * Scope a query to find feature flag by key.
     */
    public function scopeByKey($query, string $key)
    {
        return $query->where('key', $key);
    }

    /**
     * Check if feature flag is enabled.
     */
    public function isEnabled(): bool
    {
        return $this->is_enabled;
    }

    /**
     * Check if feature flag is disabled.
     */
    public function isDisabled(): bool
    {
        return ! $this->is_enabled;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'enabled_at' => 'datetime',
        ];
    }
}
