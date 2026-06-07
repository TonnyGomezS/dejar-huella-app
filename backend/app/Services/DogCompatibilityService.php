<?php

namespace App\Services;

use App\Models\Animal;
use App\Models\DogProfile;

class DogCompatibilityService
{
    public function calculate(DogProfile $profile, Animal $dog): int
    {
        $score = 0;

        $score += $this->housingVsActivityAndSize($profile, $dog);
        $score += $this->freeTimeVsActivityAndAge($profile, $dog);
        $score += $this->experienceVsActivityAndAge($profile, $dog);
        $score += $this->compatibilityWithKids($profile, $dog);
        $score += $this->compatibilityWithAnimals($profile, $dog);

        return max(0, $score);
    }

    // Bloque 1: Vivienda vs tamaño y actividad (40 puntos)
    private function housingVsActivityAndSize(DogProfile $profile, Animal $dog): int
    {
        $housing  = $profile->housing_type->value;
        $size     = $dog->size?->value ?? 'medium';
        $activity = $dog->activity_level?->value ?? 'medium';

        $table = [
            'small' => [
                'low'    => ['apartment' => 40, 'house_no_garden' => 40, 'house_with_garden' => 40],
                'medium' => ['apartment' => 35, 'house_no_garden' => 40, 'house_with_garden' => 40],
                'high'   => ['apartment' => 20, 'house_no_garden' => 30, 'house_with_garden' => 40],
            ],
            'medium' => [
                'low'    => ['apartment' => 25, 'house_no_garden' => 40, 'house_with_garden' => 40],
                'medium' => ['apartment' => 15, 'house_no_garden' => 30, 'house_with_garden' => 40],
                'high'   => ['apartment' => -10, 'house_no_garden' => 10, 'house_with_garden' => 35],
            ],
            'large' => [
                'low'    => ['apartment' => 10, 'house_no_garden' => 25, 'house_with_garden' => 40],
                'medium' => ['apartment' => -5, 'house_no_garden' => 10, 'house_with_garden' => 35],
                'high'   => ['apartment' => -15, 'house_no_garden' => -5, 'house_with_garden' => 25],
            ],
        ];

        return $table[$size][$activity][$housing] ?? 0;
    }

    // Bloque 2: Tiempo libre vs actividad y edad (30 puntos)
    private function freeTimeVsActivityAndAge(DogProfile $profile, Animal $dog): int
    {
        $freeTime = $profile->free_time->value;
        $age      = $dog->age_range->value;
        $activity = $dog->activity_level?->value ?? 'medium';

        $table = [
            'puppy' => [
                'high'   => ['low' => -10, 'medium' => 15, 'high' => 30],
                'medium' => ['low' => -5,  'medium' => 20, 'high' => 30],
                'low'    => ['low' => 10,  'medium' => 25, 'high' => 30],
            ],
            'adult' => [
                'high'   => ['low' => 10, 'medium' => 20, 'high' => 30],
                'medium' => ['low' => 20, 'medium' => 30, 'high' => 30],
                'low'    => ['low' => 25, 'medium' => 30, 'high' => 30],
            ],
            'senior' => [
                'high'   => ['low' => 25, 'medium' => 30, 'high' => 30],
                'medium' => ['low' => 25, 'medium' => 30, 'high' => 30],
                'low'    => ['low' => 25, 'medium' => 30, 'high' => 30],
            ],
        ];

        return $table[$age][$activity][$freeTime] ?? 0;
    }

    // Bloque 3: Experiencia vs edad y actividad (20 puntos)
    private function experienceVsActivityAndAge(DogProfile $profile, Animal $dog): int
    {
        $experience = $profile->experience_level->value;
        $age        = $dog->age_range->value;
        $activity   = $dog->activity_level?->value ?? 'medium';

        $table = [
            'puppy' => [
                'high'   => ['none' => -10, 'some' => 10, 'experienced' => 20],
                'medium' => ['none' => -5,  'some' => 15, 'experienced' => 20],
                'low'    => ['none' => 5,   'some' => 15, 'experienced' => 20],
            ],
            'adult' => [
                'high'   => ['none' => 5,  'some' => 15, 'experienced' => 20],
                'medium' => ['none' => 15, 'some' => 20, 'experienced' => 20],
                'low'    => ['none' => 20, 'some' => 20, 'experienced' => 20],
            ],
            'senior' => [
                'high'   => ['none' => 20, 'some' => 20, 'experienced' => 20],
                'medium' => ['none' => 20, 'some' => 20, 'experienced' => 20],
                'low'    => ['none' => 20, 'some' => 20, 'experienced' => 20],
            ],
        ];

        return $table[$age][$activity][$experience] ?? 0;
    }

    // Bloque 4: Compatibilidad con niños (10 puntos)
    private function compatibilityWithKids(DogProfile $profile, Animal $dog): int
    {
        if (!$profile->has_young_children) return 10;
        return $dog->good_with_kids ? 10 : -15;
    }

    // Bloque 5: Compatibilidad con otros animales (10 puntos)
    private function compatibilityWithAnimals(DogProfile $profile, Animal $dog): int
    {
        $score = 0;
        $checks = 0;

        if ($profile->has_cats) {
            $checks++;
            $score += $dog->good_with_cats ? 5 : -10;
        }

        if ($profile->has_other_dogs) {
            $checks++;
            $score += $dog->good_with_dogs ? 5 : -10;
        }

        if ($checks === 0) return 5;

        return $score;
    }

    public function label(int $score): string
    {
        return match(true) {
            $score === 0  => 'Incompatibilidad total',
            $score <= 39  => 'Compatibilidad baja',
            $score <= 69  => 'Compatibilidad media',
            default       => 'Compatibilidad alta',
        };
    }
}