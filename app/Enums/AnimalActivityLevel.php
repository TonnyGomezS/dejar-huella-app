<?php

namespace App\Enums;

enum AnimalActivityLevel: string
{
    case LOW  = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';

    public function label(): string
    {
        return match($this) {
            self::LOW  => 'Bajo',
            self::MEDIUM => 'Medio',
            self::HIGH => 'Alto',
        };
    }
}