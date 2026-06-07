<?php

namespace App\Models;

use App\Enums\EventType;
use App\Enums\EventRegistrationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'shelter_id',
        'title',
        'description',
        'event_date',
        'location',
        'max_volunteers',
        'type',
    ];

    protected $casts = [
        'type'           => EventType::class,
        'event_date'     => 'datetime',
        'max_volunteers' => 'integer',
    ];

    // Relaciones
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    // Devuelve el número de voluntarios confirmados
    public function confirmedVolunteersCount(): int
    {
        return $this->registrations()
            ->where('status', EventRegistrationStatus::CONFIRMED)
            ->count();
    }

    // Comprueba si el evento tiene plazas disponibles
    public function hasAvailableSpots(): bool
    {
        return $this->confirmedVolunteersCount() < $this->max_volunteers;
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now());
    }

    public function scopeByType($query, EventType $type)
    {
        return $query->where('type', $type);
    }
}