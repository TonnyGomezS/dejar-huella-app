<?php

namespace App\Enums;

enum AnimalExperienceLevel: string
{
    case NONE       = 'none';
    case SOME       = 'some';
    case EXPERIENCED = 'experienced';

    public function label(): string
    {
        return match($this) {
            self::NONE        => 'Sin experiencia',
            self::SOME        => 'Algo de experiencia',
            self::EXPERIENCED => 'Experimentado',
        };
    }
}