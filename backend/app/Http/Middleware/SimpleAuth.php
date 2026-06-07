<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <--- IMPORTANTE: Importa Auth

class SimpleAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token no proporcionado'], 401);
        }

        $user = User::where('api_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        // --- LA LÍNEA MÁGICA ---
        // Esto le dice a Laravel: "El usuario logueado es este"
        Auth::login($user);

        return $next($request);
    }
}