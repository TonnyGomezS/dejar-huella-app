<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Animal;
use App\Models\DogProfile;
use App\Models\CatProfile;
use App\Services\DogCompatibilityService;
use App\Services\CatCompatibilityService;
use App\Enums\AnimalSpecies;
use App\Enums\AnimalStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CompatibilityController extends Controller
{
    // Obtener perfil de compatibilidad para perros
    public function getDogProfile(Request $request): JsonResponse
    {
        $user    = $this->getAuthenticatedUser($request);
        $profile = $user->dogCompatibilityProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'No tienes un perfil de compatibilidad para perros'
            ], 404);
        }

        return response()->json($profile);
    }

    // Crear o actualizar perfil de compatibilidad para perros
    public function saveDogProfile(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $validated = $request->validate([
            'housing_type'         => 'required|in:apartment,house_no_garden,house_with_garden',
            'free_time'            => 'required|in:low,medium,high',
            'experience_level'     => 'required|in:none,some,experienced',
            'has_young_children'   => 'boolean',
            'has_cats'             => 'boolean',
            'has_other_dogs'       => 'boolean',
            'accepts_special_needs'=> 'boolean',
        ]);

        $profile = DogProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'message' => 'Perfil de compatibilidad para perros guardado correctamente',
            'profile' => $profile,
        ], 201);
    }

    // Obtener perfil de compatibilidad para gatos
    public function getCatProfile(Request $request): JsonResponse
    {
        $user    = $this->getAuthenticatedUser($request);
        $profile = $user->catCompatibilityProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'No tienes un perfil de compatibilidad para gatos'
            ], 404);
        }

        return response()->json($profile);
    }

    // Crear o actualizar perfil de compatibilidad para gatos
    public function saveCatProfile(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $validated = $request->validate([
            'hours_at_home'        => 'required|in:less_than_4,between_4_and_8,more_than_8',
            'companion_type'       => 'required|in:independent,balanced,affectionate',
            'has_outdoor_access'   => 'boolean',
            'can_secure_windows'   => 'boolean',
            'has_vertical_space'   => 'boolean',
            'experience_level'     => 'required|in:none,some,experienced',
            'accepts_special_needs'=> 'boolean',
            'has_young_children'   => 'boolean',
            'has_other_cats'       => 'boolean',
            'has_dogs'             => 'boolean',
        ]);

        $profile = CatProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json([
            'message' => 'Perfil de compatibilidad para gatos guardado correctamente',
            'profile' => $profile,
        ], 201);
    }

    // Calcular compatibilidad con animales disponibles
    public function calculate(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $validated = $request->validate([
            'species' => 'required|in:dog,cat',
        ]);

        if ($validated['species'] === 'dog') {
            $profile = $user->dogCompatibilityProfile;

            if (!$profile) {
                return response()->json([
                    'message' => 'Necesitas completar tu perfil de compatibilidad para perros'
                ], 422);
            }

            $animals = Animal::where('species', AnimalSpecies::DOG)
                ->where('status', AnimalStatus::AVAILABLE)
                ->get();

            $service = new DogCompatibilityService();

        } else {
            $profile = $user->catCompatibilityProfile;

            if (!$profile) {
                return response()->json([
                    'message' => 'Necesitas completar tu perfil de compatibilidad para gatos'
                ], 422);
            }

            $animals = Animal::where('species', AnimalSpecies::CAT)
                ->where('status', AnimalStatus::AVAILABLE)
                ->get();

            $service = new CatCompatibilityService();
        }

        $results = $animals->map(function ($animal) use ($service, $profile) {
            $score = $service->calculate($profile, $animal);
            return [
                'animal'        => $animal,
                'compatibility' => $score,
                'label'         => $service->label($score),
            ];
        })->sortByDesc('compatibility')->values();

        return response()->json($results);
    }

    // Obtener el usuario autenticado desde el token
    private function getAuthenticatedUser(Request $request): User
    {
        return User::where('api_token', $request->bearerToken())->firstOrFail();
    }
}