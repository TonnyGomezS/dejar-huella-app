<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Animal;
use App\Models\Shelter;
use App\Models\Request as AnimalRequest;
use App\Enums\RequestStatus;
use App\Enums\RequestType;
use App\Enums\AnimalStatus;
use App\Enums\NotificationType;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RequestController extends Controller
{
    // Enviar solicitud sobre un animal
    public function store(Request $request, Animal $animal): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $validated = $request->validate([
            'type'     => 'required|in:adoption,fostering,sponsorship',
            'message'  => 'nullable|string',
            'end_date' => 'required_if:type,fostering|nullable|date|after:today',
        ]);

        // Verificar que el animal está disponible
        if ($animal->status !== AnimalStatus::AVAILABLE) {
            return response()->json([
                'message' => 'Este animal no está disponible actualmente'
            ], 422);
        }

        // Verificar que no existe ya una solicitud pendiente del mismo tipo
        $existingRequest = AnimalRequest::where('user_id', $user->id)
            ->where('animal_id', $animal->id)
            ->where('type', $validated['type'])
            ->whereIn('status', [RequestStatus::PENDING, RequestStatus::ACCEPTED])
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'message' => 'Ya tienes una solicitud activa de este tipo para este animal'
            ], 422);
        }

        $animalRequest = AnimalRequest::create([
            'user_id'   => $user->id,
            'animal_id' => $animal->id,
            'type'      => $validated['type'],
            'status'    => RequestStatus::PENDING,
            'message'   => $validated['message'] ?? null,
            'end_date'  => $validated['end_date'] ?? null,
        ]);

        // Cambiar estado del animal a under_evaluation
        $animal->update(['status' => AnimalStatus::UNDER_EVALUATION]);

        // Notificar a la protectora
        $this->notifyShelter($animal->shelter_id, $validated['type'], $animal);

        return response()->json([
            'message' => 'Solicitud enviada correctamente',
            'request' => $animalRequest,
        ], 201);
    }

    // Ver solicitudes enviadas por el usuario
    public function userRequests(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $requests = AnimalRequest::where('user_id', $user->id)
            ->with('animal.shelter')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    // Cancelar solicitud
    public function cancel(Request $request, AnimalRequest $animalRequest): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if ($animalRequest->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permiso para cancelar esta solicitud'
            ], 403);
        }

        if ($animalRequest->status !== RequestStatus::PENDING) {
            return response()->json([
                'message' => 'Solo puedes cancelar solicitudes pendientes'
            ], 422);
        }

        $animalRequest->update(['status' => RequestStatus::CANCELLED]);

        // Si no hay más solicitudes pendientes volver el animal a available
        $this->checkAndRestoreAnimalStatus($animalRequest->animal);

        return response()->json([
            'message' => 'Solicitud cancelada correctamente',
        ]);
    }

    // Ver solicitudes recibidas por la protectora
    public function shelterRequests(Request $request): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        $query = AnimalRequest::whereHas('animal', function ($q) use ($shelter) {
            $q->where('shelter_id', $shelter->id);
        })->with('animal', 'user');

        // Filtro por estado
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

        return response()->json($requests);
    }

    // Aceptar solicitud
    public function accept(Request $request, AnimalRequest $animalRequest): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($animalRequest->animal->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para gestionar esta solicitud'
            ], 403);
        }

        if ($animalRequest->status !== RequestStatus::PENDING) {
            return response()->json([
                'message' => 'Solo puedes aceptar solicitudes pendientes'
            ], 422);
        }

        $animalRequest->update(['status' => RequestStatus::ACCEPTED]);

        // Cambiar estado del animal según el tipo de solicitud
        $this->updateAnimalStatus($animalRequest);

        // Rechazar automáticamente las demás solicitudes pendientes
        $this->rejectOtherRequests($animalRequest);

        // Notificar al usuario
        $this->notifyUser($animalRequest);

        return response()->json([
            'message'  => 'Solicitud aceptada correctamente',
            'request'  => $animalRequest,
            'user_email' => $animalRequest->user->email,
        ]);
    }

    // Rechazar solicitud
    public function reject(Request $request, AnimalRequest $animalRequest): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($animalRequest->animal->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para gestionar esta solicitud'
            ], 403);
        }

        if ($animalRequest->status !== RequestStatus::PENDING) {
            return response()->json([
                'message' => 'Solo puedes rechazar solicitudes pendientes'
            ], 422);
        }

        $animalRequest->update(['status' => RequestStatus::REJECTED]);

        // Comprobar si quedan solicitudes pendientes
        $this->checkAndRestoreAnimalStatus($animalRequest->animal);

        // Notificar al usuario
        $this->notifyUser($animalRequest);

        return response()->json([
            'message' => 'Solicitud rechazada correctamente',
        ]);
    }

    // Cambiar estado del animal según el tipo de solicitud aceptada
    private function updateAnimalStatus(AnimalRequest $animalRequest): void
    {
        $status = match($animalRequest->type) {
            RequestType::ADOPTION    => AnimalStatus::ADOPTED,
            RequestType::FOSTERING   => AnimalStatus::FOSTERED,
            RequestType::SPONSORSHIP => AnimalStatus::RESERVED,
        };

        $animalRequest->animal->update(['status' => $status]);
    }

    // Rechazar automáticamente las demás solicitudes pendientes del animal
    private function rejectOtherRequests(AnimalRequest $acceptedRequest): void
    {
        AnimalRequest::where('animal_id', $acceptedRequest->animal_id)
            ->where('id', '!=', $acceptedRequest->id)
            ->where('status', RequestStatus::PENDING)
            ->update(['status' => RequestStatus::REJECTED]);
    }

    // Restaurar estado del animal si no quedan solicitudes pendientes
    private function checkAndRestoreAnimalStatus(Animal $animal): void
    {
        $hasPendingRequests = AnimalRequest::where('animal_id', $animal->id)
            ->where('status', RequestStatus::PENDING)
            ->exists();

        if (!$hasPendingRequests) {
            $animal->update(['status' => AnimalStatus::AVAILABLE]);
        }
    }

    // Notificar a la protectora cuando recibe una solicitud
    private function notifyShelter(int $shelterId, string $type, Animal $animal): void
    {
        $notificationType = match($type) {
            'adoption'    => NotificationType::NEW_ADOPTION_REQUEST,
            'fostering'   => NotificationType::NEW_FOSTERING_REQUEST,
            'sponsorship' => NotificationType::NEW_SPONSORSHIP_REQUEST,
        };

        Notification::create([
            'recipient_type' => 'Shelter',
            'recipient_id'   => $shelterId,
            'type'           => $notificationType,
            'title'          => $notificationType->label(),
            'message'        => "Has recibido una nueva solicitud para {$animal->name}",
        ]);
    }

    // Notificar al usuario cuando su solicitud es aceptada o rechazada
    private function notifyUser(AnimalRequest $animalRequest): void
    {
        $notificationType = match([$animalRequest->type->value, $animalRequest->status->value]) {
            ['adoption',    'accepted'] => NotificationType::ADOPTION_REQUEST_ACCEPTED,
            ['adoption',    'rejected'] => NotificationType::ADOPTION_REQUEST_REJECTED,
            ['fostering',   'accepted'] => NotificationType::FOSTERING_REQUEST_ACCEPTED,
            ['fostering',   'rejected'] => NotificationType::FOSTERING_REQUEST_REJECTED,
            ['sponsorship', 'accepted'] => NotificationType::SPONSORSHIP_REQUEST_ACCEPTED,
            ['sponsorship', 'rejected'] => NotificationType::SPONSORSHIP_REQUEST_REJECTED,
        };

        Notification::create([
            'recipient_type' => 'User',
            'recipient_id'   => $animalRequest->user_id,
            'type'           => $notificationType,
            'title'          => $notificationType->label(),
            'message'        => "Tu solicitud para {$animalRequest->animal->name} ha sido {$animalRequest->status->label()}",
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