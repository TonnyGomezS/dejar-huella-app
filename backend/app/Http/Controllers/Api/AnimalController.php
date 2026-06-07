<?php

namespace App\Http\Controllers\Api;

use App\Enums\AnimalSpecies;
use App\Enums\AnimalStatus;
use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Models\Shelter;
use App\Models\User;
use App\Services\DogCompatibilityService;
use App\Services\CatCompatibilityService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnimalController extends Controller
{
    // Listar animales con filtros
    public function index(Request $request): JsonResponse
    {
        $query = Animal::query();

        if ($request->has('species')) {
            $query->where('species', $request->species);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            $query->where('status', AnimalStatus::AVAILABLE);
        }

        if ($request->has('shelter_id')) {
            $query->where('shelter_id', $request->shelter_id);
        }

        if ($request->has('age_range')) {
            $query->where('age_range', $request->age_range);
        }

        if ($request->has('size')) {
            $query->where('size', $request->size);
        }

        $token   = $request->bearerToken();
        $user    = $token ? User::where('api_token', $token)->first() : null;
        $species = $request->species;

        $hasProfile = false;
        if ($user && $species) {
            $hasProfile = $species === 'dog'
                ? $user->dogCompatibilityProfile !== null
                : $user->catCompatibilityProfile !== null;
        }

        if ($hasProfile) {
            $animals = $query->with('shelter.location')->get();

            $profile = $species === 'dog'
                ? $user->dogCompatibilityProfile
                : $user->catCompatibilityProfile;

            $service = $species === 'dog'
                ? new DogCompatibilityService()
                : new CatCompatibilityService();

            $results = $animals->map(function ($animal) use ($service, $profile) {
                $score = $service->calculate($profile, $animal);
                return [
                    'animal'        => $animal,
                    'compatibility' => $score,
                    'label'         => $service->label($score),
                ];
            })->sortByDesc('compatibility')->take(50)->values();

            return response()->json([
                'data'        => $results,
                'has_profile' => true,
                'total'       => $results->count(),
            ]);
        }

        // Sin perfil: ordenamos por ubicación jerárquica y fecha
        if ($user && $user->location_id) {
            $userLocation = $user->location;

            $query->join('shelters', 'animals.shelter_id', '=', 'shelters.id')
                ->join('locations', 'shelters.location_id', '=', 'locations.id')
                ->orderByRaw("
                    CASE
                        WHEN locations.autonomous_community = ?
                             AND locations.province = ?
                             AND locations.municipality = ? THEN 0
                        WHEN locations.autonomous_community = ?
                             AND locations.province = ? THEN 1
                        WHEN locations.autonomous_community = ? THEN 2
                        ELSE 3
                    END
                ", [
                    $userLocation->autonomous_community,
                    $userLocation->province,
                    $userLocation->municipality,
                    $userLocation->autonomous_community,
                    $userLocation->province,
                    $userLocation->autonomous_community,
                ])
                ->orderBy('animals.created_at', 'desc')
                ->select('animals.*');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $animals = $query->with('shelter.location')->paginate(12);

        return response()->json([
            'data'        => $animals,
            'has_profile' => false,
            'total'       => $animals->total(),
        ]);
    }

    // Ver detalle de un animal
    public function show(Animal $animal): JsonResponse
    {
        $animal->load('shelter', 'campaigns');
        return response()->json($animal);
    }

    // Crear animal
    public function store(Request $request): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'species'             => 'required|in:dog,cat',
            'gender'              => 'required|in:male,female',
            'breed'               => 'nullable|string|max:255',
            'age_range'           => 'required|in:puppy,kitten,adult,senior',
            'good_with_kids'      => 'boolean',
            'good_with_cats'      => 'boolean',
            'good_with_dogs'      => 'boolean',
            'good_with_strangers' => 'boolean',
            'special_needs'       => 'boolean',
            'description'         => 'nullable|string',
            'image_url'           => 'nullable|url',
            'size'                => 'nullable|in:small,medium,large',
            'activity_level'      => 'nullable|in:low,medium,high',
            'max_hours_alone'     => 'nullable|in:less_than_4,between_4_and_8,more_than_8',
            'cat_companion_type'  => 'nullable|in:independent,balanced,affectionate',
            'indoor_only'         => 'nullable|boolean',
        ]);

        if ($validated['species'] === 'dog' && ($validated['age_range'] ?? '') === 'kitten') {
            return response()->json(['message' => 'Un perro no puede tener age_range kitten'], 422);
        }

        if ($validated['species'] === 'cat' && ($validated['age_range'] ?? '') === 'puppy') {
            return response()->json(['message' => 'Un gato no puede tener age_range puppy'], 422);
        }

        $animal = Animal::create([
            ...$validated,
            'shelter_id' => $shelter->id,
        ]);

        return response()->json([
            'message' => 'Animal publicado correctamente',
            'animal'  => $animal,
        ], 201);
    }

    // Editar animal
    public function update(Request $request, Animal $animal): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($animal->shelter_id !== $shelter->id) {
            return response()->json(['message' => 'No tienes permiso para editar este animal'], 403);
        }

        $validated = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'gender'              => 'sometimes|in:male,female',
            'breed'               => 'nullable|string|max:255',
            'age_range'           => 'sometimes|in:puppy,kitten,adult,senior',
            'good_with_kids'      => 'sometimes|boolean',
            'good_with_cats'      => 'sometimes|boolean',
            'good_with_dogs'      => 'sometimes|boolean',
            'good_with_strangers' => 'sometimes|boolean',
            'special_needs'       => 'sometimes|boolean',
            'description'         => 'nullable|string',
            'image_url'           => 'nullable|url',
            'size'                => 'nullable|in:small,medium,large',
            'activity_level'      => 'nullable|in:low,medium,high',
            'max_hours_alone'     => 'nullable|in:less_than_4,between_4_and_8,more_than_8',
            'cat_companion_type'  => 'nullable|in:independent,balanced,affectionate',
            'indoor_only'         => 'nullable|boolean',
        ]);

        $animal->update($validated);

        return response()->json([
            'message' => 'Animal actualizado correctamente',
            'animal'  => $animal,
        ]);
    }

    // Cambiar estado del animal
    public function updateStatus(Request $request, Animal $animal): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($animal->shelter_id !== $shelter->id) {
            return response()->json(['message' => 'No tienes permiso para modificar este animal'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:available,under_evaluation,reserved,fostered,adopted',
        ]);

        $animal->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'animal'  => $animal,
        ]);
    }

    // Eliminar animal
    public function destroy(Request $request, Animal $animal): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($animal->shelter_id !== $shelter->id) {
            return response()->json(['message' => 'No tienes permiso para eliminar este animal'], 403);
        }

        $animal->delete();

        return response()->json(['message' => 'Animal eliminado correctamente']);
    }

    private function getAuthenticatedShelter(Request $request): Shelter
    {
        return Shelter::where('api_token', $request->bearerToken())->firstOrFail();
    }
}