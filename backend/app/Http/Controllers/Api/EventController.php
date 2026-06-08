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

        // Por defecto filtramos para mostrar solo eventos que no hayan pasado y los ordenamos cronológicamente
        $query->where('event_date', '>=', now());
        $query->orderBy('event_date', 'asc');

        $events = $query->paginate(12);

        // Añadimos las plazas disponibles dinámicamente mapeando la colección interna del paginador sin alterar el estado en la BD
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

        // Control de acceso: verificamos que la protectora autenticada es la dueña del evento
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

        // Patrón Fail-Fast: Validamos todas las precondiciones restrictivas antes de ejecutar cualquier escritura en la base de datos
        
        // 1. Evitar inscripciones extemporáneas
        if ($event->event_date < now()) {
            return response()->json([
                'message' => 'No puedes inscribirte en un evento pasado'
            ], 422);
        }

        // 2. Control de aforo basándonos en las relaciones del modelo Event
        if (!$event->hasAvailableSpots()) {
            return response()->json([
                'message' => 'No quedan plazas disponibles para este evento'
            ], 422);
        }

        // 3. Control de duplicados (evitar que un usuario se apunte dos veces al mismo evento)
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

        // Sistema de logs/notificaciones interno para mantener informada a la protectora
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

        // Cambiamos el estado a CANCELLED en lugar de hacer un delete físico para conservar el histórico y la trazabilidad de la asistencia
        $registration->update(['status' => EventRegistrationStatus::CANCELLED]);

        return response()->json([
            'message' => 'Inscripción cancelada correctamente',
        ]);
    }

    // Ver inscritos en un evento (Exclusivo para la protectora organizadora)
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
            ->with('user') // Eager loading de la relación de usuarios para optimizar la consulta y evitar el problema de N+1
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