<?php

namespace App\Enums;

enum DogHousingType: string
{
    case APARTMENT        = 'apartment';
    case HOUSE_NO_GARDEN  = 'house_no_garden';
    case HOUSE_WITH_GARDEN = 'house_with_garden';

    public function label(): string
    {
        return match($this) {
            self::APARTMENT         => 'Piso o apartamento',
            self::HOUSE_NO_GARDEN   => 'Casa sin jardín',
            self::HOUSE_WITH_GARDEN => 'Casa con jardín',
        };
    }
}