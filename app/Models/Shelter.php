<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Shelter extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'description',
        'address',
        'phone',
        'image_url',
        'location_id',
        'api_token',
    ];

    protected $hidden = [
        'password',
        'api_token',
    ];

    protected $casts = [
        'password' => 'hashed',
    ];

    public function appNotifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'recipient');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    public function volunteerRequests(): HasMany
    {
        return $this->hasMany(VolunteerRequest::class);
    }
}