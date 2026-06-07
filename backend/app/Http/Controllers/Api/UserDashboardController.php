<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Animal;
use App\Models\Campaign;
use App\Enums\AnimalStatus;
use App\Enums\CampaignStatus;
use App\Enums\PaymentStatus;
use App\Enums\RequestStatus;
use App\Enums\VolunteerRequestStatus;
use App\Enums\EventRegistrationStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserDashboardController extends Controller
{
    // Endpoint único que devuelve todo lo necesario para el dashboard
    public function summary(Request $request): JsonResponse
    {
        $user = User::where('api_token', $request->bearerToken())->firstOrFail();

        // Solicitudes recientes con animal y protectora
        $requests = $user->requests()
            ->with('animal.shelter')
            ->latest()
            ->limit(5)
            ->get();

        // Estadísticas
        $eventsCount = $user->eventRegistrations()
            ->where('status', EventRegistrationStatus::CONFIRMED)
            ->count();

        $donationsCount = $user->donations()
            ->where('payment_status', PaymentStatus::COMPLETED)
            ->count();

        $pendingCount =
            $user->requests()
                ->where('status', RequestStatus::PENDING)
                ->count() +
            $user->volunteerRequests()
                ->where('status', VolunteerRequestStatus::PENDING)
                ->count() +
            $user->eventRegistrations()
                ->where('status', EventRegistrationStatus::CONFIRMED)
                ->count();

        // Historia de éxito aleatoria
        $story = Animal::whereIn('status', [
                AnimalStatus::ADOPTED,
                AnimalStatus::FOSTERED,
                AnimalStatus::RESERVED,
            ])
            ->with('shelter')
            ->inRandomOrder()
            ->first();

        // Campañas más cerca del objetivo
        $campaigns = Campaign::where('status', CampaignStatus::ACTIVE)
            ->with('shelter', 'animal')
            ->get()
            ->map(function ($campaign) {
                $raised   = $campaign->raisedAmount();
                $progress = $campaign->goal_amount > 0
                    ? round(($raised / $campaign->goal_amount) * 100, 1)
                    : 0;
                $campaign->raised_amount    = $raised;
                $campaign->progress_percent = $progress;
                return $campaign;
            })
            ->sortByDesc('progress_percent')
            ->take(4)
            ->values();

        return response()->json([
            'requests'      => $requests,
            'stats'         => [
                'events'    => $eventsCount,
                'donations' => $donationsCount,
                'pending'   => $pendingCount,
            ],
            'success_story' => $story,
            'campaigns'     => $campaigns,
        ]);
    }

    // Total de donaciones completadas
    public function donations(Request $request): JsonResponse
    {
        $user = User::where('api_token', $request->bearerToken())->firstOrFail();

        return response()->json([
            'total' => $user->donations()
                ->where('payment_status', PaymentStatus::COMPLETED)
                ->count(),
        ]);
    }

    // Total de inscripciones a eventos
    public function events(Request $request): JsonResponse
    {
        $user = User::where('api_token', $request->bearerToken())->firstOrFail();

        return response()->json([
            'total' => $user->eventRegistrations()
                ->where('status', EventRegistrationStatus::CONFIRMED)
                ->count(),
        ]);
    }

    // Total de solicitudes pendientes de todo tipo
    public function pendingCount(Request $request): JsonResponse
    {
        $user = User::where('api_token', $request->bearerToken())->firstOrFail();

        $animalRequests = $user->requests()
            ->where('status', RequestStatus::PENDING)
            ->count();

        $volunteerRequests = $user->volunteerRequests()
            ->where('status', VolunteerRequestStatus::PENDING)
            ->count();

        $eventRegistrations = $user->eventRegistrations()
            ->where('status', EventRegistrationStatus::CONFIRMED)
            ->count();

        return response()->json([
            'total'               => $animalRequests + $volunteerRequests + $eventRegistrations,
            'animal_requests'     => $animalRequests,
            'volunteer_requests'  => $volunteerRequests,
            'event_registrations' => $eventRegistrations,
        ]);
    }
    public function eventsList(Request $request): JsonResponse
    {
        $user = User::where('api_token', $request->bearerToken())->firstOrFail();

        $registrations = $user->eventRegistrations()
            ->with('event.shelter')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($registration) {
                return [
                    'id'     => $registration->id,
                    'status' => $registration->status,
                    'event'  => $registration->event,
                ];
            });
        return response()->json($registrations);
    }
    public function donationsList(Request $request): JsonResponse
    {
        $user = User::where('api_token', $request->bearerToken())->firstOrFail();

        $donations = $user->donations()
            ->with('campaign.shelter', 'campaign.animal')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($donations);
    }
}