<?php

use App\Http\Controllers\Api\Auth\UserAuthController;
use App\Http\Controllers\Api\Auth\ShelterAuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AnimalController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CompatibilityController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\ShelterController;
use App\Http\Controllers\Api\ShelterDashboardController;
use App\Http\Controllers\Api\SuccessStoriesController;
use App\Http\Controllers\Api\UserDashboardController;
use App\Http\Controllers\Api\VolunteerRequestController;
use Illuminate\Support\Facades\Route;

// Rutas públicas de autenticación de usuarios
Route::prefix('auth')->group(function () {
    Route::post('register', [UserAuthController::class, 'register']);
    Route::post('login',    [UserAuthController::class, 'login']);
});

// Rutas protegidas de usuarios
Route::middleware('auth.user')->prefix('auth')->group(function () {
    Route::post('logout', [UserAuthController::class, 'logout']);
    Route::get('me',      [UserAuthController::class, 'me']);
});

// Rutas públicas de autenticación de protectoras
Route::prefix('shelters/auth')->group(function () {
    Route::post('register', [ShelterAuthController::class, 'register']);
    Route::post('login',    [ShelterAuthController::class, 'login']);
});

// Rutas protegidas de protectoras
Route::middleware('auth.shelter')->prefix('shelters/auth')->group(function () {
    Route::post('logout', [ShelterAuthController::class, 'logout']);
    Route::get('me',      [ShelterAuthController::class, 'me']);
});

// Rutas públicas de animales
Route::get('animals',             [AnimalController::class, 'index']);
Route::get('animals/{animal}',    [AnimalController::class, 'show']);

// Rutas protegidas de animales (solo protectoras)
Route::middleware('auth.shelter')->group(function () {
    Route::post('animals',                    [AnimalController::class, 'store']);
    Route::put('animals/{animal}',            [AnimalController::class, 'update']);
    Route::patch('animals/{animal}/status',   [AnimalController::class, 'updateStatus']);
    Route::delete('animals/{animal}',         [AnimalController::class, 'destroy']);
});

// Rutas protegidas de compatibilidad (solo usuarios)
Route::middleware('auth.user')->prefix('compatibility')->group(function () {
    Route::get('dog',  [CompatibilityController::class, 'getDogProfile']);
    Route::post('dog', [CompatibilityController::class, 'saveDogProfile']);
    Route::get('cat',  [CompatibilityController::class, 'getCatProfile']);
    Route::post('cat', [CompatibilityController::class, 'saveCatProfile']);
});

// Rutas públicas
Route::post('animals/{animal}/requests', [RequestController::class, 'store'])
    ->middleware('auth.user');

// Rutas protegidas de usuarios
Route::middleware('auth.user')->group(function () {
    Route::get('requests',                          [RequestController::class, 'userRequests']);
    Route::delete('requests/{animalRequest}',       [RequestController::class, 'cancel']);
});

// Rutas protegidas de protectoras
Route::middleware('auth.shelter')->group(function () {
    Route::get('shelter/requests',                          [RequestController::class, 'shelterRequests']);
    Route::patch('requests/{animalRequest}/accept',         [RequestController::class, 'accept']);
    Route::patch('requests/{animalRequest}/reject',         [RequestController::class, 'reject']);
});

// Rutas públicas de eventos
Route::get('events',         [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);

// Rutas protegidas de usuarios
Route::middleware('auth.user')->group(function () {
    Route::post('events/{event}/register',   [EventController::class, 'register']);
    Route::delete('events/{event}/register', [EventController::class, 'cancelRegistration']);
});

// Rutas protegidas de protectoras
Route::middleware('auth.shelter')->group(function () {
    Route::post('events',                                    [EventController::class, 'store']);
    Route::put('events/{event}',                             [EventController::class, 'update']);
    Route::delete('events/{event}',                          [EventController::class, 'destroy']);
    Route::get('shelter/events/{event}/registrations',       [EventController::class, 'registrations']);
});

// Rutas protegidas de usuarios
Route::middleware('auth.user')->group(function () {
    Route::post('shelters/{shelter}/volunteer',                      [VolunteerRequestController::class, 'store']);
    Route::get('volunteer-requests',                                 [VolunteerRequestController::class, 'userRequests']);
    Route::delete('volunteer-requests/{volunteerRequest}',           [VolunteerRequestController::class, 'cancel']);
});

// Rutas protegidas de protectoras
Route::middleware('auth.shelter')->group(function () {
    Route::get('shelter/volunteer-requests',                                  [VolunteerRequestController::class, 'shelterRequests']);
    Route::patch('volunteer-requests/{volunteerRequest}/accept',              [VolunteerRequestController::class, 'accept']);
    Route::patch('volunteer-requests/{volunteerRequest}/reject',              [VolunteerRequestController::class, 'reject']);
});

// Rutas públicas de campañas
Route::get('campaigns/near-goal',    [CampaignController::class, 'nearGoal']);
Route::get('campaigns',              [CampaignController::class, 'index']);
Route::get('campaigns/{campaign}',   [CampaignController::class, 'show']);
Route::get('campaigns/{campaign}/updates', [CampaignController::class, 'updates']);

// Rutas protegidas de usuarios
Route::middleware('auth.user')->group(function () {
    Route::post('campaigns/{campaign}/donate', [CampaignController::class, 'donate']);
});

// Rutas protegidas de protectoras
Route::middleware('auth.shelter')->group(function () {
    Route::post('campaigns',                          [CampaignController::class, 'store']);
    Route::put('campaigns/{campaign}',                [CampaignController::class, 'update']);
    Route::patch('campaigns/{campaign}/close',        [CampaignController::class, 'close']);
    Route::delete('campaigns/{campaign}',             [CampaignController::class, 'destroy']);
    Route::post('campaigns/{campaign}/updates',       [CampaignController::class, 'storeUpdate']);
});

// Notificaciones para usuarios
Route::middleware('auth.user')->group(function () {
    Route::get('notifications',                               [NotificationController::class, 'index']);
    Route::patch('notifications/{notification}/read',         [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all',                    [NotificationController::class, 'markAllAsRead']);
});

// Notificaciones para protectoras
Route::middleware('auth.shelter')->group(function () {
    Route::get('notifications',                               [NotificationController::class, 'index']);
    Route::patch('notifications/{notification}/read',         [NotificationController::class, 'markAsRead']);
    Route::patch('notifications/read-all',                    [NotificationController::class, 'markAllAsRead']);
});

// Rutas de administración
Route::middleware('auth.admin')->prefix('admin')->group(function () {
    Route::get('users',                      [AdminController::class, 'listUsers']);
    Route::patch('users/{user}/suspend',     [AdminController::class, 'suspendUser']);
    Route::delete('users/{user}',            [AdminController::class, 'deleteUser']);

    Route::get('shelters',                   [AdminController::class, 'listShelters']);
    Route::patch('shelters/{shelter}/verify',  [AdminController::class, 'verifyShelter']);
    Route::patch('shelters/{shelter}/suspend', [AdminController::class, 'suspendShelter']);
    Route::delete('shelters/{shelter}',        [AdminController::class, 'deleteShelter']);

    Route::get('stats',                      [AdminController::class, 'stats']);
});

Route::get('success-stories', [SuccessStoriesController::class, 'index']);

Route::get('shelters',         [ShelterController::class, 'index']);
Route::get('shelters/{shelter}', [ShelterController::class, 'show']);

Route::middleware('auth.user')->prefix('dashboard')->group(function () {
    Route::get('summary',        [UserDashboardController::class, 'summary']);
    Route::get('donations',      [UserDashboardController::class, 'donations']);
    Route::get('donations/list', [UserDashboardController::class, 'donationsList']);
    Route::get('events',         [UserDashboardController::class, 'events']);
    Route::get('events/list',    [UserDashboardController::class, 'eventsList']);
    Route::get('pending-count',  [UserDashboardController::class, 'pendingCount']);
});

Route::middleware('auth.shelter')->prefix('shelter-dashboard')->group(function () {
    Route::get('summary', [ShelterDashboardController::class, 'summary']);
});