<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\Notification;
use App\Enums\RequestStatus;
use App\Enums\VolunteerRequestStatus;
use App\Enums\AnimalStatus;
use App\Enums\CampaignStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ShelterDashboardController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $shelter = Shelter::where('api_token', $request->bearerToken())
            ->firstOrFail();

        // Solicitudes pendientes de revisar
        $pendingRequests = \App\Models\Request::whereHas('animal', function ($q) use ($shelter) {
                $q->where('shelter_id', $shelter->id);
            })
            ->where('status', RequestStatus::PENDING)
            ->count();

        // Eventos próximos en 7 días
        $upcomingEvents = $shelter->events()
            ->where('event_date', '>=', now())
            ->where('event_date', '<=', now()->addDays(7))
            ->count();

        // Solicitudes de voluntariado sin revisar
        $pendingVolunteer = $shelter->volunteerRequests()
            ->where('status', VolunteerRequestStatus::PENDING)
            ->count();

        // Notificaciones no leídas
        $unreadNotifications = Notification::where('recipient_type', 'Shelter')
            ->where('recipient_id', $shelter->id)
            ->whereNull('read_at')
            ->count();

        // Estadísticas generales
        $totalAnimals    = $shelter->animals()->count();
        $availableAnimals = $shelter->animals()
            ->where('status', AnimalStatus::AVAILABLE)
            ->count();
        $activeCampaigns = $shelter->campaigns()
            ->where('status', CampaignStatus::ACTIVE)
            ->count();

        // Animales más recientes
        $recentAnimals = $shelter->animals()
            ->latest()
            ->limit(6)
            ->get();

        // Solicitudes pendientes recientes agrupadas por animal
        $recentRequests = \App\Models\Request::whereHas('animal', function ($q) use ($shelter) {
                $q->where('shelter_id', $shelter->id);
            })
            ->where('status', RequestStatus::PENDING)
            ->with('animal', 'user')
            ->latest()
            ->limit(5)
            ->get();

        $recentActivity = Notification::where('recipient_type', 'Shelter')
            ->where('recipient_id', $shelter->id)
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'badges' => [
                'requests'      => $pendingRequests,
                'events'        => $upcomingEvents,
                'volunteer'     => $pendingVolunteer,
                'notifications' => $unreadNotifications,
            ],
            'stats' => [
                'total_animals'    => $totalAnimals,
                'available_animals'=> $availableAnimals,
                'pending_requests' => $pendingRequests,
                'active_campaigns' => $activeCampaigns,
            ],
            'recent_animals'  => $recentAnimals,
            'recent_requests' => $recentRequests,
            'recent_activity' => $recentActivity,
        ]);
    }
}