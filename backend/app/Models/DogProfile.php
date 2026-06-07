<?php

namespace App\Models;

use App\Enums\DogHousingType;
use App\Enums\DogFreeTime;
use App\Enums\AnimalExperienceLevel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DogProfile extends Model
{
    protected $fillable = [
        'user_id',
        'housing_type',
        'free_time',
        'experience_level',
        'has_young_children',
        'has_cats',
        'has_other_dogs',
        'accepts_special_needs',
    ];

    protected $casts = [
        'housing_type'     => DogHousingType::class,
        'free_time'        => DogFreeTime::class,
        'experience_level' => AnimalExperienceLevel::class,
        'has_young_children'    => 'boolean',
        'has_cats'              => 'boolean',
        'has_other_dogs'        => 'boolean',
        'accepts_special_needs' => 'boolean',
    ];

    // Relaciones
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}