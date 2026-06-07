<?php

namespace App\Enums;

enum RequestType: string
{
    case ADOPTION    = 'adoption';
    case FOSTERING   = 'fostering';
    case SPONSORSHIP = 'sponsorship';

    public function label(): string
    {
        return match($this) {
            self::ADOPTION    => 'Adopción',
            self::FOSTERING   => 'Acogida temporal',
            self::SPONSORSHIP => 'Apadrinamiento',
        };
    }
}