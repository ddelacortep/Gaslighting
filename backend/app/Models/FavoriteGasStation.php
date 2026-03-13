<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FavoriteGasStation extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'gas_station_id',
        'custom_name',
        'notes',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // No updated_at column in schema
    const UPDATED_AT = null;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function gasStation(): BelongsTo
    {
        return $this->belongsTo(GasStation::class, 'gas_station_id', 'external_provider_id');
    }
}
