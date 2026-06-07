<?php

namespace App\Enums;

enum CatCompanionType: string
{
    case INDEPENDENT  = 'independent';
    case BALANCED     = 'balanced';
    case AFFECTIONATE = 'affectionate';

    public function label(): string
    {
        return match($this) {
            self::INDEPENDENT  => 'Independiente',
            self::BALANCED     => 'Equilibrado',
            self::AFFECTIONATE => 'Cariñoso',
        };
    }
}