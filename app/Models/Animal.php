<?php

namespace App\Models;

use App\Enums\AnimalSpecies;
use App\Enums\AnimalGender;
use App\Enums\AnimalAgeRange;
use App\Enums\AnimalStatus;
use App\Enums\AnimalSize;
use App\Enums\AnimalActivityLevel;
use App\Enums\AnimalMaxHoursAlone;
use App\Enums\CatCompanionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Animal extends Model
{
    protected $fillable = [
        'shelter_id',
        'name',
        'species',
        'gender',
        'breed',
        'age_range',
        'good_with_kids',
        'good_with_cats',
        'good_with_dogs',
        'good_with_strangers',
        'special_needs',
        'status',
        'description',
        'image_url',
        'size',
        'activity_level',
        'max_hours_alone',
        'cat_companion_type',
        'indoor_only',
    ];

    protected $casts = [
        'species'             => AnimalSpecies::class,
        'gender'              => AnimalGender::class,
        'age_range'           => AnimalAgeRange::class,
        'status'              => AnimalStatus::class,
        'size'                => AnimalSize::class,
        'activity_level'      => AnimalActivityLevel::class,
        'max_hours_alone'     => AnimalMaxHoursAlone::class,
        'cat_companion_type'  => CatCompanionType::class,
        'good_with_kids'      => 'boolean',
        'good_with_cats'      => 'boolean',
        'good_with_dogs'      => 'boolean',
        'good_with_strangers' => 'boolean',
        'special_needs'       => 'boolean',
        'indoor_only'         => 'boolean',
    ];

    // Relaciones
    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(Request::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', AnimalStatus::AVAILABLE);
    }

    public function scopeDogs($query)
    {
        return $query->where('species', AnimalSpecies::DOG);
    }

    public function scopeCats($query)
    {
        return $query->where('species', AnimalSpecies::CAT);
    }

    // Comprueba si el animal es un perro
    public function isDog(): bool
    {
        return $this->species === AnimalSpecies::DOG;
    }

    // Comprueba si el animal es un gato
    public function isCat(): bool
    {
        return $this->species === AnimalSpecies::CAT;
    }
}