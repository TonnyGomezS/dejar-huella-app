<?php

namespace App\Enums;

enum UserRole: string
{
    case USER  = 'user';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match($this) {
            self::USER  => 'Usuario',
            self::ADMIN => 'Administrador',
        };
    }
}