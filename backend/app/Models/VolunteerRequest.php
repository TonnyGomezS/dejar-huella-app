<?php

namespace App\Models;

use App\Enums\VolunteerAvailability;
use App\Enums\VolunteerRequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VolunteerRequest extends Model
{
    protected $fillable = [
        'user_id',
        'shelter_id',
        'availability',
        'interests',
        'message',
        'status',
    ];

    protected $casts = [
        'availability' => VolunteerAvailability::class,
        'status'       => VolunteerRequestStatus::class,
    ];

    // Relaciones
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    // Comprueba si la solicitud está pendiente
    public function isPending(): bool
    {
        return $this->status === VolunteerRequestStatus::PENDING;
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', VolunteerRequestStatus::PENDING);
    }

    public function scopeByAvailability($query, VolunteerAvailability $availability)
    {
        return $query->where('availability', $availability);
    }
}