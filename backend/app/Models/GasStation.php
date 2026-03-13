<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GasStation extends Model
{
    protected $primaryKey = 'external_provider_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'external_provider_id',
        'original_name',
        'latitude',
        'longitude',
        'address',
        'brand',
    ];

    protected $casts = [
        'latitude'   => 'decimal:8',
        'longitude'  => 'decimal:8',
        'updated_at' => 'datetime',
    ];

    // No created_at column in schema
    const CREATED_AT = null;

    public function favorites(): HasMany
    {
        return $this->hasMany(FavoriteGasStation::class, 'gas_station_id', 'external_provider_id');
    }
}
