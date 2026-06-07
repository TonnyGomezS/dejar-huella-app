<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    protected $fillable = [
        'campaign_id',
        'user_id',
        'amount',
        'payment_status',
        'transaction_id',
    ];

    protected $casts = [
        'payment_status' => PaymentStatus::class,
        'amount'         => 'decimal:2',
    ];

    // Relaciones
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Comprueba si el pago está completado
    public function isCompleted(): bool
    {
        return $this->payment_status === PaymentStatus::COMPLETED;
    }

    // Comprueba si el pago está pendiente
    public function isPending(): bool
    {
        return $this->payment_status === PaymentStatus::PENDING;
    }

    // Comprueba si el pago ha fallado
    public function hasFailed(): bool
    {
        return $this->payment_status === PaymentStatus::FAILED;
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('payment_status', PaymentStatus::COMPLETED);
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', PaymentStatus::PENDING);
    }
}