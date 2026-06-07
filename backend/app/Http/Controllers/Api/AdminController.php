<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shelter;
use App\Models\Animal;
use App\Models\Campaign;
use App\Models\Donation;
use App\Enums\UserRole;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    // Listar todos los usuarios
    public function listUsers(): JsonResponse
    {
        $users = User::where('role', UserRole::USER)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($users);
    }

    // Suspender usuario
    public function suspendUser(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'No puedes suspender a otro administrador'
            ], 403);
        }

        // Invalidamos el token para cerrar su sesión inmediatamente
        $user->update(['api_token' => null]);

        return response()->json([
            'message' => "Usuario {$user->name} suspendido correctamente",
        ]);
    }

    // Eliminar usuario
    public function deleteUser(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'No puedes eliminar a otro administrador'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Usuario eliminado correctamente',
        ]);
    }

    // Listar todas las protectoras
    public function listShelters(): JsonResponse
    {
        $shelters = Shelter::with('location')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($shelters);
    }

    // Verificar protectora
    public function verifyShelter(Shelter $shelter): JsonResponse
    {
        // Añadiremos un campo 'verified_at' en el futuro
        // Por ahora simplemente confirmamos que existe
        return response()->json([
            'message' => "Protectora {$shelter->name} verificada correctamente",
            'shelter' => $shelter,
        ]);
    }

    // Suspender protectora
    public function suspendShelter(Shelter $shelter): JsonResponse
    {
        // Invalidamos el token para cerrar su sesión inmediatamente
        $shelter->update(['api_token' => null]);

        return response()->json([
            'message' => "Protectora {$shelter->name} suspendida correctamente",
        ]);
    }

    // Eliminar protectora
    public function deleteShelter(Shelter $shelter): JsonResponse
    {
        $shelter->delete();

        return response()->json([
            'message' => 'Protectora eliminada correctamente',
        ]);
    }

    // Estadísticas generales
    public function stats(): JsonResponse
    {
        return response()->json([
            'users'     => User::where('role', UserRole::USER)->count(),
            'shelters'  => Shelter::count(),
            'animals'   => Animal::count(),
            'campaigns' => Campaign::count(),
            'donations' => Donation::where('payment_status', PaymentStatus::COMPLETED)->sum('amount'),
        ]);
    }
}