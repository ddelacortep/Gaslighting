<?php

use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/users/init', [UserController::class, 'registerInstance']);
Route::put('/users/{id}/activity', [UserController::class, 'updateActivity']);

Route::post('/favorites', [FavoriteController::class, 'addFavorite']);
Route::get('/favorites/{userId}', [FavoriteController::class, 'getFavoritesByUser']);
Route::put('/favorites/{favoriteId}', [FavoriteController::class, 'updateFavorite']);
Route::delete('/favorites/{favoriteId}', [FavoriteController::class, 'removeFavorite']);
