<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShelterAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Token no proporcionado'], 401);
        }

        $shelter = Shelter::where('api_token', $token)->first();

        if (!$shelter) {
            return response()->json(['message' => 'Token inválido'], 401);
        }

        Auth::guard('shelter')->setUser($shelter);

        return $next($request);
    }
}