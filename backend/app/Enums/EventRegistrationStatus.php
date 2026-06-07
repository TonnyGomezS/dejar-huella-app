<?php

namespace App\Enums;

enum EventRegistrationStatus: string
{
    case CONFIRMED = 'confirmed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::CONFIRMED => 'Confirmado',
            self::CANCELLED => 'Cancelado',
        };
    }
}