<?php

namespace App\Services;

use App\Models\Animal;
use App\Models\CatProfile;

class CatCompatibilityService
{
    public function calculate(CatProfile $profile, Animal $cat): int
    {
        $score = 0;

        $score += $this->hoursAtHomeVsSociabilityAndAge($profile, $cat);
        $score += $this->companionTypeVsSociability($profile, $cat);
        $score += $this->experienceVsSpecialNeeds($profile, $cat);
        $score += $this->compatibilityWithAnimals($profile, $cat);
        $score += $this->compatibilityWithKids($profile, $cat);

        // Uso max para que si la puntuación da negativa por los penalizadores, se quede en 0 y no rompa la lógica
        return max(0, $score);
    }

    // Bloque 1: Horas en casa vs sociabilidad y edad (30 puntos)
    private function hoursAtHomeVsSociabilityAndAge(CatProfile $profile, Animal $cat): int
    {
        $hours      = $profile->hours_at_home->value;
        $age        = $cat->age_range->value;
        $sociability = $cat->sociability?->value ?? 'balanced';

        // Para evitar meter 50 ifs anidados que harían el código ilegible, estructuro los puntos en un array multidimensional como una matriz de decisión
        $table = [
            'kitten' => [
                'affectionate' => ['less_than_4' => -10, 'between_4_and_8' => 15, 'more_than_8' => 30],
                'balanced'     => ['less_than_4' => -5,  'between_4_and_8' => 20, 'more_than_8' => 30],
                'independent'  => ['less_than_4' => 5,   'between_4_and_8' => 25, 'more_than_8' => 30],
            ],
            'adult' => [
                'affectionate' => ['less_than_4' => 5,  'between_4_and_8' => 20, 'more_than_8' => 30],
                'balanced'     => ['less_than_4' => 15, 'between_4_and_8' => 25, 'more_than_8' => 30],
                'independent'  => ['less_than_4' => 20, 'between_4_and_8' => 30, 'more_than_8' => 30],
            ],
            'senior' => [
                'affectionate' => ['less_than_4' => 25, 'between_4_and_8' => 30, 'more_than_8' => 30],
                'balanced'     => ['less_than_4' => 25, 'between_4_and_8' => 30, 'more_than_8' => 30],
                'independent'  => ['less_than_4' => 25, 'between_4_and_8' => 30, 'more_than_8' => 30],
            ],
        ];

        // El operador ?? nos protege devolviendo 0 si por algún motivo llega un valor null o no controlado en los enums
        return $table[$age][$sociability][$hours] ?? 0;
    }

    // Bloque 2: Lo que busca el usuario vs sociabilidad (25 puntos)
    private function companionTypeVsSociability(CatProfile $profile, Animal $cat): int
    {
        $companionType = $profile->companion_type->value;
        $sociability   = $cat->sociability?->value ?? 'balanced';

        $table = [
            'independent'  => ['independent' => 25, 'balanced' => 15, 'affectionate' => -10],
            'balanced'     => ['independent' => 15, 'balanced' => 25, 'affectionate' => 15],
            'affectionate' => ['independent' => -10, 'balanced' => 15, 'affectionate' => 25],
        ];

        return $table[$companionType][$sociability] ?? 0;
    }

    // Bloque 3: Experiencia vs necesidades especiales (20 puntos)
    private function experienceVsSpecialNeeds(CatProfile $profile, Animal $cat): int
    {
        if (!$cat->special_needs) return 20;

        if (!$profile->accepts_special_needs) {
            return match($profile->experience_level->value) {
                'none'        => -15,
                'some'        => -5,
                'experienced' => 10,
            };
        }

        return match($profile->experience_level->value) {
            'none'        => 0,
            'some'        => 10,
            'experienced' => 20,
        };
    }

    // Bloque 4: Compatibilidad con otros animales (15 puntos)
    private function compatibilityWithAnimals(CatProfile $profile, Animal $cat): int
    {
        $hasOtherCats = $profile->has_other_cats;
        $hasDogs      = $profile->has_dogs;
        $score        = 0;
        $checks       = 0;

        if ($hasOtherCats) {
            $checks++;
            $score += $cat->good_with_cats ? 8 : -15;
        }

        if ($hasDogs) {
            $checks++;
            $score += $cat->good_with_dogs ? 7 : -15;
        }

        if ($checks === 0) return 15;

        return $score;
    }

    // Bloque 5: Compatibilidad con niños (10 puntos)
    private function compatibilityWithKids(CatProfile $profile, Animal $cat): int
    {
        if (!$profile->has_young_children) return 10;
        return $cat->good_with_kids ? 10 : -15;
    }

    public function label(int $score): string
    {
        // Uso match(true) evaluando expresiones lógicas directamente en los brazos del match, lo cual es más limpio que hacer un switch tradicional o una cadena larga de if/else
        return match(true) {
            $score === 0  => 'Incompatibilidad total',
            $score <= 39  => 'Compatibilidad baja',
            $score <= 69  => 'Compatibilidad media',
            default       => 'Compatibilidad alta',
        };
    }
}