<?php

namespace App\Enums;

enum AnimalAgeRange: string
{
    case PUPPY  = 'puppy';  // Cría de perro
    case KITTEN = 'kitten'; // Cría de gato
    case ADULT  = 'adult';  // Adulto (perros y gatos)
    case SENIOR = 'senior'; // Senior (perros y gatos)

    public function label(): string
    {
        return match($this) {
            self::PUPPY  => 'Cachorro',
            self::KITTEN => 'Gatito',
            self::ADULT  => 'Adulto',
            self::SENIOR => 'Senior',
        };
    }
}