<?php

namespace App\Models;

use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    protected $fillable = [
        'recipient_type',
        'recipient_id',
        'type',
        'title',
        'message',
        'read_at',
    ];

    protected $casts = [
        'type'    => NotificationType::class,
        'read_at' => 'datetime',
    ];

    // Relación polimórfica: devuelve el User o el Shelter destinatario
    public function recipient(): MorphTo
    {
        return $this->morphTo();
    }

    // Scope para filtrar notificaciones no leídas
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    // Marca la notificación como leída
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }
}