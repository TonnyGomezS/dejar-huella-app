<?php

namespace App\Models;

use App\Enums\RequestType;
use App\Enums\RequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Request extends Model
{
    protected $fillable = [
        'user_id',
        'animal_id',
        'type',
        'status',
        'message',
        'end_date',
    ];

    protected $casts = [
        'type'     => RequestType::class,
        'status'   => RequestStatus::class,
        'end_date' => 'date',
    ];

    // Relaciones
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', RequestStatus::PENDING);
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', RequestStatus::ACCEPTED);
    }

    public function scopeByType($query, RequestType $type)
    {
        return $query->where('type', $type);
    }

    // Comprueba si la solicitud es una acogida temporal
    public function isFostering(): bool
    {
        return $this->type === RequestType::FOSTERING;
    }

    // Comprueba si la solicitud está pendiente
    public function isPending(): bool
    {
        return $this->status === RequestStatus::PENDING;
    }
}