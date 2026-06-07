<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Http\Request;

class AdminAuth
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

        if (!$user->isAdmin()) {
            return response()->json(['message' => 'No tienes permisos de administrador'], 403);
        }

        return $next($request);
    }
}