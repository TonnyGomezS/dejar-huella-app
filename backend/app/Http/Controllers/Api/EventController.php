<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shelter;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Notification;
use App\Enums\EventRegistrationStatus;
use App\Enums\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    // Listar eventos
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->with('shelter');

        // Filtros opcionales
        if ($request->has('shelter_id')) {
            $query->where('shelter_id', $request->shelter_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Por defecto solo eventos futuros
        $query->where('event_date', '>=', now());
        $query->orderBy('event_date', 'asc');

        $events = $query->paginate(12);

        // Añadimos plazas disponibles a cada evento
        $events->getCollection()->transform(function ($event) {
            $event->available_spots = $event->hasAvailableSpots()
                ? $event->max_volunteers - $event->confirmedVolunteersCount()
                : 0;
            return $event;
        });

        return response()->json($events);
    }

    // Ver detalle de un evento
    public function show(Event $event): JsonResponse
    {
        $event->load('shelter');
        $event->available_spots = $event->max_volunteers - $event->confirmedVolunteersCount();

        return response()->json($event);
    }

    // Crear evento
    public function store(Request $request): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'required|string',
            'event_date'     => 'required|date|after:now',
            'location'       => 'required|string|max:255',
            'max_volunteers' => 'required|integer|min:1',
            'type'           => 'required|in:adoption_day,solidarity_market,open_day,volunteering,collective_walk,fundraising,awareness_talk',
        ]);

        $event = Event::create([
            ...$validated,
            'shelter_id' => $shelter->id,
        ]);

        return response()->json([
            'message' => 'Evento creado correctamente',
            'event'   => $event,
        ], 201);
    }

    // Editar evento
    public function update(Request $request, Event $event): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($event->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para editar este evento'
            ], 403);
        }

        $validated = $request->validate([
            'title'          => 'sometimes|string|max:255',
            'description'    => 'sometimes|string',
            'event_date'     => 'sometimes|date|after:now',
            'location'       => 'sometimes|string|max:255',
            'max_volunteers' => 'sometimes|integer|min:1',
            'type'           => 'sometimes|in:adoption_day,solidarity_market,open_day,volunteering,collective_walk,fundraising,awareness_talk',
        ]);

        $event->update($validated);

        return response()->json([
            'message' => 'Evento actualizado correctamente',
            'event'   => $event,
        ]);
    }

    // Eliminar evento
    public function destroy(Request $request, Event $event): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($event->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar este evento'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => 'Evento eliminado correctamente',
        ]);
    }

    // Inscribirse en un evento
    public function register(Request $request, Event $event): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        // Verificar que el evento no ha pasado
        if ($event->event_date < now()) {
            return response()->json([
                'message' => 'No puedes inscribirte en un evento pasado'
            ], 422);
        }

        // Verificar plazas disponibles
        if (!$event->hasAvailableSpots()) {
            return response()->json([
                'message' => 'No quedan plazas disponibles para este evento'
            ], 422);
        }

        // Verificar que no está ya inscrito
        $existingRegistration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->where('status', EventRegistrationStatus::CONFIRMED)
            ->exists();

        if ($existingRegistration) {
            return response()->json([
                'message' => 'Ya estás inscrito en este evento'
            ], 422);
        }

        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'user_id'  => $user->id,
            'status'   => EventRegistrationStatus::CONFIRMED,
        ]);

        // Notificar a la protectora
        Notification::create([
            'recipient_type' => 'Shelter',
            'recipient_id'   => $event->shelter_id,
            'type'           => NotificationType::NEW_EVENT_REGISTRATION,
            'title'          => NotificationType::NEW_EVENT_REGISTRATION->label(),
            'message'        => "{$user->name} se ha inscrito en {$event->title}",
        ]);

        return response()->json([
            'message'      => 'Inscripción confirmada correctamente',
            'registration' => $registration,
        ], 201);
    }

    // Cancelar inscripción
    public function cancelRegistration(Request $request, Event $event): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $registration = EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->where('status', EventRegistrationStatus::CONFIRMED)
            ->first();

        if (!$registration) {
            return response()->json([
                'message' => 'No tienes una inscripción activa en este evento'
            ], 404);
        }

        $registration->update(['status' => EventRegistrationStatus::CANCELLED]);

        return response()->json([
            'message' => 'Inscripción cancelada correctamente',
        ]);
    }

    // Ver inscritos en un evento
    public function registrations(Request $request, Event $event): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($event->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para ver los inscritos de este evento'
            ], 403);
        }

        $registrations = EventRegistration::where('event_id', $event->id)
            ->where('status', EventRegistrationStatus::CONFIRMED)
            ->with('user')
            ->get();

        return response()->json([
            'event'         => $event->title,
            'total'         => $registrations->count(),
            'registrations' => $registrations,
        ]);
    }

    private function getAuthenticatedUser(Request $request): User
    {
        return User::where('api_token', $request->bearerToken())->firstOrFail();
    }

    private function getAuthenticatedShelter(Request $request): Shelter
    {
        return Shelter::where('api_token', $request->bearerToken())->firstOrFail();
    }
}