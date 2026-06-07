<?php

namespace App\Enums;

enum RequestStatus: string
{
    case PENDING   = 'pending';
    case ACCEPTED  = 'accepted';
    case REJECTED  = 'rejected';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::PENDING   => 'Pendiente',
            self::ACCEPTED  => 'Aceptada',
            self::REJECTED  => 'Rechazada',
            self::CANCELLED => 'Cancelada',
        };
    }
}