<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class ShelterAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:255',
            'email'                => 'required|email|unique:shelters,email',
            'password'             => ['required', 'confirmed', Password::min(8)],
            'description'          => 'nullable|string',
            'address'              => 'required|string|max:255',
            'phone'                => 'nullable|string|max:20',
            'image_url'            => 'nullable|url',
            'autonomous_community' => 'required|string|max:255',
            'province'             => 'required|string|max:255',
            'municipality'         => 'required|string|max:255',
        ]);

        // Normalizamos antes de buscar o crear para evitar duplicados
        $autonomousCommunity = Str::title(Str::lower($validated['autonomous_community']));
        $province            = Str::title(Str::lower($validated['province']));
        $municipality        = Str::title(Str::lower($validated['municipality']));

        $location = Location::firstOrCreate([
            'autonomous_community' => $autonomousCommunity,
            'province'             => $province,
            'municipality'         => $municipality,
        ]);

        $token = Str::random(60);

        $shelter = Shelter::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'password'    => Hash::make($validated['password']),
            'description' => $validated['description'] ?? null,
            'address'     => $validated['address'],
            'phone'       => $validated['phone'] ?? null,
            'image_url'   => $validated['image_url'] ?? null,
            'location_id' => $location->id,
            'api_token'   => $token,
        ]);

        return response()->json([
            'message' => 'La protectora ha sido registrada correctamente',
            'shelter' => $shelter,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $shelter = Shelter::where('email', $validated['email'])->first();

        if (!$shelter || !Hash::check($validated['password'], $shelter->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
            ], 401);
        }

        $token = Str::random(60);
        $shelter->api_token = $token;
        $shelter->save();

        return response()->json([
            'message' => 'Ha iniciado sesión correctamente',
            'shelter' => $shelter,
            'token'   => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $shelter = Shelter::where(
            'api_token',
            $request->bearerToken()
        )->first();

        if ($shelter) {
            $shelter->api_token = null;
            $shelter->save();
        }

        return response()->json([
            'message' => 'La sesión se ha cerrado correctamente',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $shelter = Shelter::where(
            'api_token',
            $request->bearerToken()
        )->first();

        return response()->json($shelter);
    }
}