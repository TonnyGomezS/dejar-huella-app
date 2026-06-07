<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shelter;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    // Listar notificaciones del actor autenticado
    public function index(Request $request): JsonResponse
    {
        [$recipientType, $recipientId] = $this->getRecipient($request);

        $notifications = Notification::where('recipient_type', $recipientType)
            ->where('recipient_id', $recipientId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = Notification::where('recipient_type', $recipientType)
            ->where('recipient_id', $recipientId)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    // Marcar una notificación como leída
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        [$recipientType, $recipientId] = $this->getRecipient($request);

        if ($notification->recipient_type !== $recipientType ||
            $notification->recipient_id !== $recipientId) {
            return response()->json([
                'message' => 'No tienes permiso para marcar esta notificación'
            ], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notificación marcada como leída',
        ]);
    }

    // Marcar todas las notificaciones como leídas
    public function markAllAsRead(Request $request): JsonResponse
    {
        [$recipientType, $recipientId] = $this->getRecipient($request);

        Notification::where('recipient_type', $recipientType)
            ->where('recipient_id', $recipientId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Todas las notificaciones marcadas como leídas',
        ]);
    }

    // Detecta si el token pertenece a un usuario o a una protectora
    private function getRecipient(Request $request): array
    {
        $token = $request->bearerToken();

        $user = User::where('api_token', $token)->first();
        if ($user) {
            return ['User', $user->id];
        }

        $shelter = Shelter::where('api_token', $token)->first();
        if ($shelter) {
            return ['Shelter', $shelter->id];
        }

        abort(401, 'Token inválido');
    }
}