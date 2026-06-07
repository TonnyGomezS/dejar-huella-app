<?php

namespace App\Http\Controllers\Api\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str; // NECESARIO para generar el token aleatorio
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;


class UserAuthController extends Controller
{
    // Registro de usuario
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'email'                => 'required|email|unique:users,email',
            'password'             => ['required', 'confirmed', Password::min(8)],
            'phone'                => 'nullable|string|max:20',
            'autonomous_community' => 'nullable|string|max:255',
            'province'             => 'nullable|string|max:255',
            'municipality'         => 'nullable|string|max:255',
        ]);

        // Si el usuario indicó ubicación la buscamos o creamos
        $locationId = null;
        if (!empty($validated['autonomous_community']) &&
            !empty($validated['province']) &&
            !empty($validated['municipality'])) {

            $location   = Location::firstOrCreate([
                'autonomous_community' => Str::title(Str::lower($validated['autonomous_community'])),
                'province'             => Str::title(Str::lower($validated['province'])),
                'municipality'         => Str::title(Str::lower($validated['municipality'])),
            ]);
            $locationId = $location->id;
        }

        // Generamos un token único al registrar
        $token = Str::random(60);

        $user = User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'phone'     => $validated['phone'] ?? null,
            'role'      => UserRole::USER,
            'api_token' => $token, // Guardamos el token en la base de datos
            'location_id' => $locationId,
        ]);

        return response()->json([
            'message' => 'El usuario ha sido registrado correctamente',
            'user'    => $user,
            'token'   => $token, // Enviamos el token al cliente
        ], 201);
    }

    // Inicio de sesión
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        // Generamos un token nuevo al iniciar sesión y lo guardamos
        $user = Auth::user();
        $token = Str::random(60);
        $user->api_token = $token;
        $user->save();

        return response()->json([
            'message' => 'Ha iniciado sesión correctamente',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    // Cierre de sesión
    public function logout(Request $request): JsonResponse
    {
        // Eliminamos el token de la base de datos para "cerrar" la sesión
        $user = $request->user();
        $user->api_token = null;
        $user->save();

        return response()->json([
            'message' => 'La sesión se ha cerrado correctamente',
        ]);
    }

    // Datos del usuario autenticado
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}