<?php

namespace App\Enums;

enum CampaignStatus: string
{
    case ACTIVE    = 'active';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE    => 'Activa',
            self::COMPLETED => 'Completada',
            self::CANCELLED => 'Cancelada',
        };
    }
}