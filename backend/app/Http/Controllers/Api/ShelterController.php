<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShelterController extends Controller
{
    // Listar protectoras con filtros geográficos
    public function index(Request $request): JsonResponse
    {
        $query = Shelter::query()->with('location');

        // Filtro por Comunidad Autónoma: consultamos la existencia y atributos dentro de la relación 'location' usando un closure
        if ($request->has('autonomous_community')) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('autonomous_community', $request->autonomous_community);
            });
        }

        // Filtro por Provincia: realizamos la misma consulta relacional avanzada para acotar los resultados
        if ($request->has('province')) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('province', $request->province);
            });
        }

        $shelters = $query->orderBy('name')->paginate(12);

        return response()->json($shelters);
    }

    // Ver el perfil detallado de una protectora
    public function show(Shelter $shelter): JsonResponse
    {
        $shelter->load('location', 'animals', 'events', 'campaigns');
        
        return response()->json($shelter);
    }
}