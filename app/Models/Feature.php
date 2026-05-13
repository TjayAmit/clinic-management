<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'key', 'description', 'is_enabled', 'enabled_by', 'enabled_at'])]
class Feature extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'enabled_at' => 'datetime',
        ];
    }

    public function enabledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enabled_by');
    }
}
