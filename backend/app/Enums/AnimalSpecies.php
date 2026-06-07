<?php

namespace App\Enums;

enum AnimalSpecies: string
{
    case DOG  = 'dog';
    case CAT = 'cat';

    public function label(): string
    {
        return match($this) {
            self::DOG  => 'Perro',
            self::CAT => 'Gato',
        };
    }
}