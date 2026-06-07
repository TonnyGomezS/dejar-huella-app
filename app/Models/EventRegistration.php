<?php

namespace App\Models;

use App\Enums\EventRegistrationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRegistration extends Model
{
    protected $fillable = [
        'event_id',
        'user_id',
        'status',
    ];

    protected $casts = [
        'status' => EventRegistrationStatus::class,
    ];

    // Relaciones
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Comprueba si el registro está confirmado
    public function isConfirmed(): bool
    {
        return $this->status === EventRegistrationStatus::CONFIRMED;
    }

    // Cancela el registro
    public function cancel(): void
    {
        $this->update(['status' => EventRegistrationStatus::CANCELLED]);
    }

    // Scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', EventRegistrationStatus::CONFIRMED);
    }
}