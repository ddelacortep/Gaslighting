<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function registerInstance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform'      => 'nullable|string|max:50',
            'app_version'   => 'nullable|string|max:50',
            'language_code' => 'nullable|string|max:10',
        ]);

        $user = User::create($validated);

        return response()->json(['id' => $user->id], 201);
    }

    public function updateActivity(string $id): JsonResponse
    {
        $updated = User::where('id', $id)->update(['last_active_at' => now()]);

        if (! $updated) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        return response()->json(null, 204);
    }
}
