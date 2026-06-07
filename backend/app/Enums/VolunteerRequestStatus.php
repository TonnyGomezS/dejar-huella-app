<?php

namespace App\Enums;

enum VolunteerRequestStatus: string
{
    case PENDING  = 'pending';
    case ACCEPTED = 'accepted';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::PENDING  => 'Pendiente',
            self::ACCEPTED => 'Aceptada',
            self::REJECTED => 'Rechazada',
        };
    }
}