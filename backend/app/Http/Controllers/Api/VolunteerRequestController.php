<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shelter;
use App\Models\VolunteerRequest;
use App\Models\Notification;
use App\Enums\VolunteerRequestStatus;
use App\Enums\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VolunteerRequestController extends Controller
{
    // Enviar solicitud de voluntariado a una protectora
    public function store(Request $request, Shelter $shelter): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $validated = $request->validate([
            'availability' => 'required|in:mornings,afternoons,weekends',
            'interests'    => 'required|string|max:500',
            'message'      => 'nullable|string',
        ]);

        // Verificar que no existe ya una solicitud pendiente a esta protectora
        $existingRequest = VolunteerRequest::where('user_id', $user->id)
            ->where('shelter_id', $shelter->id)
            ->where('status', VolunteerRequestStatus::PENDING)
            ->exists();

        if ($existingRequest) {
            return response()->json([
                'message' => 'Ya tienes una solicitud de voluntariado pendiente en esta protectora'
            ], 422);
        }

        $volunteerRequest = VolunteerRequest::create([
            'user_id'      => $user->id,
            'shelter_id'   => $shelter->id,
            'availability' => $validated['availability'],
            'interests'    => $validated['interests'],
            'message'      => $validated['message'] ?? null,
            'status'       => VolunteerRequestStatus::PENDING,
        ]);

        // Notificar a la protectora
        Notification::create([
            'recipient_type' => 'Shelter',
            'recipient_id'   => $shelter->id,
            'type'           => NotificationType::NEW_VOLUNTEER_REQUEST,
            'title'          => NotificationType::NEW_VOLUNTEER_REQUEST->label(),
            'message'        => "{$user->name} quiere colaborar como voluntario",
        ]);

        return response()->json([
            'message' => 'Solicitud de voluntariado enviada correctamente',
            'request' => $volunteerRequest,
        ], 201);
    }

    // Ver solicitudes enviadas por el usuario
    public function userRequests(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        $requests = VolunteerRequest::where('user_id', $user->id)
            ->with('shelter')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    // Cancelar solicitud
    public function cancel(Request $request, VolunteerRequest $volunteerRequest): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if ($volunteerRequest->user_id !== $user->id) {
            return response()->json([
                'message' => 'No tienes permiso para cancelar esta solicitud'
            ], 403);
        }

        if ($volunteerRequest->status !== VolunteerRequestStatus::PENDING) {
            return response()->json([
                'message' => 'Solo puedes cancelar solicitudes pendientes'
            ], 422);
        }

        $volunteerRequest->delete();

        return response()->json([
            'message' => 'Solicitud de voluntariado cancelada correctamente',
        ]);
    }

    // Ver solicitudes recibidas por la protectora
    public function shelterRequests(Request $request): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        $requests = VolunteerRequest::where('shelter_id', $shelter->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }

    // Aceptar solicitud
    public function accept(Request $request, VolunteerRequest $volunteerRequest): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($volunteerRequest->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para gestionar esta solicitud'
            ], 403);
        }

        if ($volunteerRequest->status !== VolunteerRequestStatus::PENDING) {
            return response()->json([
                'message' => 'Solo puedes aceptar solicitudes pendientes'
            ], 422);
        }

        $volunteerRequest->update(['status' => VolunteerRequestStatus::ACCEPTED]);

        // Notificar al usuario con su email para que la protectora pueda contactarle
        Notification::create([
            'recipient_type' => 'User',
            'recipient_id'   => $volunteerRequest->user_id,
            'type'           => NotificationType::NEW_VOLUNTEER_REQUEST,
            'title'          => '¡Tu solicitud de voluntariado ha sido aceptada!',
            'message'        => "La protectora {$shelter->name} ha aceptado tu solicitud. Se pondrá en contacto contigo pronto.",
        ]);

        return response()->json([
            'message'    => 'Solicitud aceptada correctamente',
            'request'    => $volunteerRequest,
            'user_email' => $volunteerRequest->user->email,
        ]);
    }

    // Rechazar solicitud
    public function reject(Request $request, VolunteerRequest $volunteerRequest): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($volunteerRequest->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para gestionar esta solicitud'
            ], 403);
        }

        if ($volunteerRequest->status !== VolunteerRequestStatus::PENDING) {
            return response()->json([
                'message' => 'Solo puedes rechazar solicitudes pendientes'
            ], 422);
        }

        $volunteerRequest->update(['status' => VolunteerRequestStatus::REJECTED]);

        // Notificar al usuario
        Notification::create([
            'recipient_type' => 'User',
            'recipient_id'   => $volunteerRequest->user_id,
            'type'           => NotificationType::NEW_VOLUNTEER_REQUEST,
            'title'          => 'Solicitud de voluntariado no aceptada',
            'message'        => "La protectora {$shelter->name} no ha podido aceptar tu solicitud de voluntariado.",
        ]);

        return response()->json([
            'message' => 'Solicitud rechazada correctamente',
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