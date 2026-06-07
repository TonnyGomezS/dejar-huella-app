<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    protected $fillable = [
        'shelter_id',
        'animal_id',
        'title',
        'description',
        'goal_amount',
        'status',
        'end_date',
    ];

    protected $casts = [
        'status'       => CampaignStatus::class,
        'goal_amount'  => 'decimal:2',
        'end_date'     => 'datetime',
    ];

    // Relaciones
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class)->withDefault();
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(CampaignUpdate::class);
    }

    // Calcula el total recaudado al vuelo
    public function raisedAmount(): float
    {
        return $this->donations()
            ->where('payment_status', PaymentStatus::COMPLETED)
            ->sum('amount');
    }

    // Calcula el porcentaje recaudado sobre el objetivo
    public function progressPercentage(): float
    {
        if ($this->goal_amount == 0) {
            return 0;
        }

        return min(100, round(($this->raisedAmount() / $this->goal_amount) * 100, 2));
    }

    // Comprueba si la campaña está activa
    public function isActive(): bool
    {
        return $this->status === CampaignStatus::ACTIVE;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', CampaignStatus::ACTIVE);
    }
}