<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Shelter;
use App\Models\Animal;
use App\Models\Campaign;
use App\Models\CampaignUpdate;
use App\Models\Donation;
use App\Models\Notification;
use App\Enums\CampaignStatus;
use App\Enums\PaymentStatus;
use App\Enums\NotificationType;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    // Listar campañas activas
    public function index(Request $request): JsonResponse
    {
        $query = Campaign::query()
            ->where('status', CampaignStatus::ACTIVE)
            ->with('shelter', 'animal');

        if ($request->has('shelter_id')) {
            $query->where('shelter_id', $request->shelter_id);
        }

        if ($request->has('animal_id')) {
            $query->where('animal_id', $request->animal_id);
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate(12);

        $campaigns->getCollection()->transform(function ($campaign) {
            $campaign->raised_amount    = $campaign->raisedAmount();
            $campaign->progress_percent = $campaign->progressPercentage();
            return $campaign;
        });

        return response()->json($campaigns);
    }

    // Ver detalle de una campaña con sus actualizaciones
    public function show(Campaign $campaign): JsonResponse
    {
        $campaign->load('shelter', 'animal', 'updates');
        $campaign->raised_amount    = $campaign->raisedAmount();
        $campaign->progress_percent = $campaign->progressPercentage();

        return response()->json($campaign);
    }

    // Crear campaña
    public function store(Request $request): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'goal_amount' => 'required|numeric|min:1',
            'end_date'    => 'required|date|after:today',
            'animal_id'   => 'nullable|exists:animals,id',
        ]);

        // Verificar que el animal pertenece a esta protectora
        if (!empty($validated['animal_id'])) {
            $animal = Animal::find($validated['animal_id']);
            if ($animal->shelter_id !== $shelter->id) {
                return response()->json([
                    'message' => 'Este animal no pertenece a tu protectora'
                ], 403);
            }
        }

        $campaign = Campaign::create([
            ...$validated,
            'shelter_id' => $shelter->id,
            'status'     => CampaignStatus::ACTIVE,
        ]);

        return response()->json([
            'message'  => 'Campaña creada correctamente',
            'campaign' => $campaign,
        ], 201);
    }

    // Editar campaña
    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($campaign->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para editar esta campaña'
            ], 403);
        }

        if ($campaign->status !== CampaignStatus::ACTIVE) {
            return response()->json([
                'message' => 'Solo puedes editar campañas activas'
            ], 422);
        }

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'goal_amount' => 'sometimes|numeric|min:1',
            'end_date'    => 'sometimes|date|after:today',
        ]);

        $campaign->update($validated);

        return response()->json([
            'message'  => 'Campaña actualizada correctamente',
            'campaign' => $campaign,
        ]);
    }

    // Cerrar campaña manualmente
    public function close(Request $request, Campaign $campaign): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($campaign->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para cerrar esta campaña'
            ], 403);
        }

        if ($campaign->status !== CampaignStatus::ACTIVE) {
            return response()->json([
                'message' => 'Esta campaña ya está cerrada'
            ], 422);
        }

        $campaign->update(['status' => CampaignStatus::COMPLETED]);

        return response()->json([
            'message'  => 'Campaña cerrada correctamente',
            'campaign' => $campaign,
        ]);
    }

    // Eliminar campaña
    public function destroy(Request $request, Campaign $campaign): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($campaign->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar esta campaña'
            ], 403);
        }

        if ($campaign->status === CampaignStatus::ACTIVE) {
            return response()->json([
                'message' => 'No puedes eliminar una campaña activa, ciérrala primero'
            ], 422);
        }

        $campaign->delete();

        return response()->json([
            'message' => 'Campaña eliminada correctamente',
        ]);
    }

    // Donar a una campaña
    public function donate(Request $request, Campaign $campaign): JsonResponse
    {
        $user = $this->getAuthenticatedUser($request);

        if ($campaign->status !== CampaignStatus::ACTIVE) {
            return response()->json([
                'message' => 'Esta campaña no está activa'
            ], 422);
        }

        $validated = $request->validate([
            'amount'      => 'required|numeric|min:1',
            'card_number' => 'required|digits:16',
            'expiry'      => 'required|string',
            'cvv'         => 'required|digits:3',
        ]);

        // Simulamos el pago: si termina en 0000 falla, si no completa
        $lastFour      = substr($validated['card_number'], -4);
        $paymentStatus = $lastFour === '0000' ? PaymentStatus::FAILED : PaymentStatus::COMPLETED;

        // Los datos de tarjeta nunca se guardan
        $donation = Donation::create([
            'campaign_id'    => $campaign->id,
            'user_id'        => $user->id,
            'amount'         => $validated['amount'],
            'payment_status' => $paymentStatus,
        ]);

        if ($paymentStatus === PaymentStatus::COMPLETED) {
            Notification::create([
                'recipient_type' => 'Shelter',
                'recipient_id'   => $campaign->shelter_id,
                'type'           => NotificationType::NEW_DONATION,
                'title'          => NotificationType::NEW_DONATION->label(),
                'message'        => "{$user->name} ha donado {$validated['amount']}€ a la campaña {$campaign->title}",
            ]);

            if ($campaign->raisedAmount() >= $campaign->goal_amount) {
                $campaign->update(['status' => CampaignStatus::COMPLETED]);
            }

            return response()->json([
                'message'          => '¡Donación realizada correctamente!',
                'donation'         => $donation,
                'raised_amount'    => $campaign->raisedAmount(),
                'progress_percent' => $campaign->progressPercentage(),
            ], 201);
        }

        return response()->json([
            'message'  => 'El pago no pudo procesarse. Comprueba los datos de tu tarjeta.',
            'donation' => $donation,
        ], 422);
    }

    // Publicar actualización de campaña
    public function storeUpdate(Request $request, Campaign $campaign): JsonResponse
    {
        $shelter = $this->getAuthenticatedShelter($request);

        if ($campaign->shelter_id !== $shelter->id) {
            return response()->json([
                'message' => 'No tienes permiso para publicar actualizaciones en esta campaña'
            ], 403);
        }

        $validated = $request->validate([
            'title'     => 'required|string|max:255',
            'content'   => 'required|string',
            'image_url' => 'nullable|url',
        ]);

        $update = CampaignUpdate::create([
            'campaign_id' => $campaign->id,
            'title'       => $validated['title'],
            'content'     => $validated['content'],
            'image_url'   => $validated['image_url'] ?? null,
        ]);

        return response()->json([
            'message' => 'Actualización publicada correctamente',
            'update'  => $update,
        ], 201);
    }

    // Ver actualizaciones de una campaña
    public function updates(Campaign $campaign): JsonResponse
    {
        $updates = CampaignUpdate::where('campaign_id', $campaign->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($updates);
    }

    private function getAuthenticatedUser(Request $request): User
    {
        return User::where('api_token', $request->bearerToken())->firstOrFail();
    }

    private function getAuthenticatedShelter(Request $request): Shelter
    {
        return Shelter::where('api_token', $request->bearerToken())->firstOrFail();
    }

    public function nearGoal(): JsonResponse
    {
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

        return response()->json($campaigns);
    }
}