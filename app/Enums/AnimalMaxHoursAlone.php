<?php

namespace App\Enums;

enum AnimalMaxHoursAlone: string
{
    case LESS_THAN_4    = 'less_than_4';
    case BETWEEN_4_AND_8 = 'between_4_and_8';
    case MORE_THAN_8    = 'more_than_8';

    public function label(): string
    {
        return match($this) {
            self::LESS_THAN_4     => 'Menos de 4 horas',
            self::BETWEEN_4_AND_8 => 'Entre 4 y 8 horas',
            self::MORE_THAN_8     => 'Más de 8 horas',
        };
    }
}