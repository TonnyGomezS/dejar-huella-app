<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Location extends Model
{
    protected $fillable = [
        'autonomous_community',
        'province',
        'municipality',
    ];

    // Normalización automática antes de guardar
    protected static function booted(): void
    {
        static::creating(function (Location $location) {
            $location->autonomous_community = Str::title(Str::lower($location->autonomous_community));
            $location->province             = Str::title(Str::lower($location->province));
            $location->municipality         = Str::title(Str::lower($location->municipality));
        });

        static::updating(function (Location $location) {
            $location->autonomous_community = Str::title(Str::lower($location->autonomous_community));
            $location->province             = Str::title(Str::lower($location->province));
            $location->municipality         = Str::title(Str::lower($location->municipality));
        });
    }

    // Relaciones
    public function shelters(): HasMany
    {
        return $this->hasMany(Shelter::class);
    }
}