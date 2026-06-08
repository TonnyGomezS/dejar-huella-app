<?php

namespace App\Models;

use App\Enums\AnimalExperienceLevel;
use App\Enums\AnimalMaxHoursAlone;
use App\Enums\CatCompanionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatProfile extends Model
{
    protected $fillable = [
        'user_id',
        'hours_at_home',
        'has_outdoor_access',
        'can_secure_windows',
        'has_vertical_space',
        'experience_level',
        'companion_type',
        'accepts_special_needs',
        'has_young_children',
        'has_other_cats',
        'has_dogs',
    ];

    protected $casts = [
        // Convertimos a los objetos Enum directamente para poder hacer la lógica de compatibilidad con el algoritmo del match
        'hours_at_home'    => AnimalMaxHoursAlone::class,
        'experience_level' => AnimalExperienceLevel::class,
        'companion_type'   => CatCompanionType::class,
        'has_outdoor_access'    => 'boolean',
        'can_secure_windows'    => 'boolean',
        'has_vertical_space'    => 'boolean',
        'accepts_special_needs' => 'boolean',
        'has_young_children'    => 'boolean',
        'has_other_cats'        => 'boolean',
        'has_dogs'              => 'boolean',
    ];

    // Relaciones
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}