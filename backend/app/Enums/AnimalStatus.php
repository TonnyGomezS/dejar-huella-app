<?php

namespace App\Enums;

enum AnimalStatus: string
{
    case AVAILABLE  = 'available';
    case UNDER_EVALUATION = 'under_evaluation';
    case RESERVED = 'reserved';
    case FOSTERED = 'fostered';
    case ADOPTED = 'adopted';

    public function label(): string
    {
        return match($this) {
            self::AVAILABLE  => 'Disponible',
            self::UNDER_EVALUATION => 'Bajo evaluación',
            self::RESERVED => 'Reservado',
            self::FOSTERED => 'En acogida',
            self::ADOPTED => 'Adoptado',
        };
    }
}