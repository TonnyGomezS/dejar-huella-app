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
        'shelter_id',    // ID de la protectora que crea la campaña (FK)
        'animal_id',     // por si la donación es para un perro/gato concreto, si no se queda vacío
        'title',
        'description',
        'goal_amount',   // el dinero total que se quiere conseguir
        'status',
        'end_date',
    ];

    protected $casts = [
        'status'       => CampaignStatus::class,
        'goal_amount'  => 'decimal:2', // para que guarde bien los decimales del dinero
        'end_date'     => 'datetime',
    ];

    // Una campaña pertenece a una protectora
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    // El animal asociado. Ponemos withDefault para que no de error si la campaña es general
    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class)->withDefault();
    }

    // Todas las donaciones que ha recibido esta campaña
    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(CampaignUpdate::class);
    }

    // Suma solo las donaciones que se han completado y pagado de verdad
    public function raisedAmount(): float
    {
        return $this->donations()
            ->where('payment_status', PaymentStatus::COMPLETED)
            ->sum('amount');
    }

    // Saca el porcentaje para la barra de progreso de la web (con un máximo de 100%)
    public function progressPercentage(): float
    {
        if ($this->goal_amount == 0) {
            return 0;
        }

        return min(100, round(($this->raisedAmount() / $this->goal_amount) * 100, 2));
    }

    public function isActive(): bool
    {
        return $this->status === CampaignStatus::ACTIVE;
    }

    // Filtro para buscar rápido en la base de datos las campañas que siguen activas
    public function scopeActive($query)
    {
        return $query->where('status', CampaignStatus::ACTIVE);
    }
}