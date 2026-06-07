<?php

return [

    'defaults' => [
        'guard'     => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver'   => 'sanctum',
            'provider' => 'users',
        ],
        'shelter' => [
            'driver'   => 'sanctum',
            'provider' => 'shelters',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model'  => App\Models\User::class,
        ],
        'shelters' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Shelter::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 10,
        ],
    ],

    'password_timeout' => 10800,

];