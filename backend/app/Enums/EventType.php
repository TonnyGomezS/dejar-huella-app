<?php

namespace App\Enums;

enum EventType: string
{
    case ADOPTION_DAY      = 'adoption_day';
    case SOLIDARITY_MARKET = 'solidarity_market';
    case OPEN_DAY          = 'open_day';
    case VOLUNTEERING      = 'volunteering';
    case COLLECTIVE_WALK   = 'collective_walk';
    case FUNDRAISING       = 'fundraising';
    case AWARENESS_TALK    = 'awareness_talk';

    public function label(): string
    {
        return match($this) {
            self::ADOPTION_DAY      => 'Jornada de adopción',
            self::SOLIDARITY_MARKET => 'Mercadillo solidario',
            self::OPEN_DAY          => 'Puertas abiertas',
            self::VOLUNTEERING      => 'Voluntariado',
            self::COLLECTIVE_WALK   => 'Paseo colectivo',
            self::FUNDRAISING       => 'Recaudación de fondos',
            self::AWARENESS_TALK    => 'Charla de concienciación',
        };
    }
}