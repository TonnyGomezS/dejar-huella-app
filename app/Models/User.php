<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'api_token',
        'location_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_verified_at',
        'api_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'role'              => UserRole::class,
    ];

    public function appNotifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'recipient');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', UserRole::ADMIN);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(Request::class);
    }

    public function eventRegistrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function volunteerRequests(): HasMany
    {
        return $this->hasMany(VolunteerRequest::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function dogCompatibilityProfile(): HasOne
    {
        return $this->hasOne(DogProfile::class);
    }

    public function catCompatibilityProfile(): HasOne
    {
        return $this->hasOne(CatProfile::class);
    }
}