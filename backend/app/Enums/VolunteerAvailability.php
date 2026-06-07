<?php

namespace App\Enums;

enum VolunteerAvailability: string
{
    case MORNINGS   = 'mornings';
    case AFTERNOONS = 'afternoons';
    case WEEKENDS   = 'weekends';

    public function label(): string
    {
        return match($this) {
            self::MORNINGS   => 'Mañanas',
            self::AFTERNOONS => 'Tardes',
            self::WEEKENDS   => 'Fines de semana',
        };
    }
}