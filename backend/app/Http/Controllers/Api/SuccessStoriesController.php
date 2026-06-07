<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Animal;
use App\Enums\AnimalStatus;
use Illuminate\Http\JsonResponse;

class SuccessStoriesController extends Controller
{
    public function index(): JsonResponse
    {
        $stories = Animal::whereIn('status', [
                AnimalStatus::ADOPTED,
                AnimalStatus::FOSTERED,
                AnimalStatus::RESERVED,
            ])
            ->with('shelter')
            ->inRandomOrder()
            ->limit(1)
            ->get();

        return response()->json($stories);
    }
}