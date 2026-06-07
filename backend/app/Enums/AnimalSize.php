<?php

namespace App\Enums;

enum AnimalSize: string
{
    case SMALL  = 'small';
    case MEDIUM = 'medium';
    case LARGE = 'large';

    public function label(): string
    {
        return match($this) {
            self::SMALL  => 'Pequeño',
            self::MEDIUM => 'Mediano',
            self::LARGE => 'Grande',
        };
    }
}