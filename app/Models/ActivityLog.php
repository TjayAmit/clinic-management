<?php

namespace App\Models;

use Database\Factories\ActivityLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['log_name', 'description', 'subject_type', 'subject_id', 'event', 'causer_type', 'causer_id', 'attribute_changes', 'properties'])]
class ActivityLog extends Model
{
    /** @use HasFactory<ActivityLogFactory> */
    use HasFactory;

    protected $casts = [
        'attribute_changes' => 'array',
        'properties' => 'array',
    ];

    /**
     * Get the subject that this activity log belongs to.
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the causer (user) of this activity.
     */
    public function causer(): MorphTo
    {
        return $this->morphTo();
    }
}
