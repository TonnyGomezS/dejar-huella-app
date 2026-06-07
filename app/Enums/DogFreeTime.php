<?php

namespace App\Enums;

enum DogFreeTime: string
{
    case LOW    = 'low';
    case MEDIUM = 'medium';
    case HIGH   = 'high';

    public function label(): string
    {
        return match($this) {
            self::LOW    => 'Poco tiempo libre',
            self::MEDIUM => 'Tiempo libre moderado',
            self::HIGH   => 'Mucho tiempo libre',
        };
    }
}