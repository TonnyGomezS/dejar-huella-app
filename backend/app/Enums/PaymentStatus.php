<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING   = 'pending';
    case COMPLETED = 'completed';
    case FAILED    = 'failed';

    public function label(): string
    {
        return match($this) {
            self::PENDING   => 'Pendiente',
            self::COMPLETED => 'Completado',
            self::FAILED    => 'Fallido',
        };
    }
}