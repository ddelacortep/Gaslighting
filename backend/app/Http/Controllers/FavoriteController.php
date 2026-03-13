<?php

namespace App\Http\Controllers;

use App\Models\FavoriteGasStation;
use App\Models\GasStation;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function addFavorite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'                              => 'required|uuid|exists:users,id',
            'gas_station'                          => 'required|array',
            'gas_station.external_provider_id'     => 'required|string|max:100',
            'gas_station.original_name'            => 'required|string|max:200',
            'gas_station.latitude'                 => 'required|numeric|between:-90,90',
            'gas_station.longitude'                => 'required|numeric|between:-180,180',
            'gas_station.address'                  => 'nullable|string|max:500',
            'gas_station.brand'                    => 'nullable|string|max:100',
            'custom_name'                          => 'nullable|string|max:100',
            'notes'                                => 'nullable|string|max:500',
        ]);

        // Sync the gas station cache (insert or update)
        GasStation::updateOrCreate(
            ['external_provider_id' => $validated['gas_station']['external_provider_id']],
            [
                'original_name' => $validated['gas_station']['original_name'],
                'latitude'      => $validated['gas_station']['latitude'],
                'longitude'     => $validated['gas_station']['longitude'],
                'address'       => $validated['gas_station']['address'] ?? null,
                'brand'         => $validated['gas_station']['brand'] ?? null,
            ]
        );

        try {
            $favorite = FavoriteGasStation::create([
                'user_id'         => $validated['user_id'],
                'gas_station_id'  => $validated['gas_station']['external_provider_id'],
                'custom_name'     => $validated['custom_name'] ?? null,
                'notes'           => $validated['notes'] ?? null,
            ]);
        } catch (QueryException) {
            return response()->json(['message' => 'This gas station is already in your favorites.'], 422);
        }

        return response()->json(
            $favorite->load('gasStation'),
            201
        );
    }

    public function getFavoritesByUser(string $userId): JsonResponse
    {
        $favorites = FavoriteGasStation::with('gasStation:external_provider_id,original_name,latitude,longitude,address,brand')
            ->select(['id', 'user_id', 'gas_station_id', 'custom_name', 'notes', 'created_at'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($favorites);
    }

    public function updateFavorite(Request $request, string $favoriteId): JsonResponse
    {
        $validated = $request->validate([
            'custom_name' => 'nullable|string|max:100',
            'notes'       => 'nullable|string|max:500',
        ]);

        $updated = FavoriteGasStation::where('id', $favoriteId)
            ->update($validated);

        if (! $updated) {
            return response()->json(['message' => 'Favorite not found.'], 404);
        }

        return response()->json(null, 204);
    }

    public function removeFavorite(string $favoriteId): JsonResponse
    {
        $deleted = FavoriteGasStation::where('id', $favoriteId)->delete();

        if (! $deleted) {
            return response()->json(['message' => 'Favorite not found.'], 404);
        }

        return response()->json(null, 204);
    }
}
