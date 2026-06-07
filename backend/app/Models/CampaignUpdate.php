<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignUpdate extends Model
{
    protected $fillable = [
        'campaign_id',
        'title',
        'content',
        'image_url',
    ];

    // Relaciones
    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }
}