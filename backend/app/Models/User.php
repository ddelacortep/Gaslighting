<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Model
{
    use HasUuids;

    protected $fillable = [
        'platform',
        'app_version',
        'language_code',
        'last_active_at',
    ];

    protected $casts = [
        'created_at'     => 'datetime',
        'last_active_at' => 'datetime',
    ];

    // No updated_at column in schema
    const UPDATED_AT = null;

    public function favoriteGasStations(): HasMany
    {
        return $this->hasMany(FavoriteGasStation::class);
    }
}
