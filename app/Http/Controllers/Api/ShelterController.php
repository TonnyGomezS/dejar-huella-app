<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShelterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Shelter::query()->with('location');

        if ($request->has('autonomous_community')) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('autonomous_community', $request->autonomous_community);
            });
        }

        if ($request->has('province')) {
            $query->whereHas('location', function ($q) use ($request) {
                $q->where('province', $request->province);
            });
        }

        $shelters = $query->orderBy('name')->paginate(12);

        return response()->json($shelters);
    }

    public function show(Shelter $shelter): JsonResponse
    {
        $shelter->load('location', 'animals', 'events', 'campaigns');
        return response()->json($shelter);
    }
}