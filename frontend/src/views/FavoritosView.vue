<script setup>
import '@/styles/favoritos.css'
import { useFavoritosView } from '@/composables/useFavoritosView'
import { useRouter } from 'vue-router'

const {
  favoritesWithLiveData,
  favoritesStore,
  settingsStore,
  getAvatarColor,
  getAvatarLetter,
  goToMap,
  removeFavorite,
} = useFavoritosView()

const router = useRouter()

const FUEL_LABELS = {
  gasolina95: 'Gasolina 95',
  gasolina98: 'Gasolina 98',
  diesel: 'Diésel',
}
</script>

<template>
  <div class="favoritos-view">
    <!-- Header -->
    <header class="favoritos-header">
      <button @click="router.push('/')" class="favoritos-header__back">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <svg class="favoritos-header__icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <h1>Mis Favoritos</h1>
    </header>

    <!-- Empty state -->
    <div v-if="!favoritesStore.favorites.length" class="favoritos-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <p>Aún no tienes favoritos.</p>
    </div>

    <!-- Favorites list -->
    <div class="favoritos-list" v-else>
      <div
        v-for="fav in favoritesWithLiveData"
        :key="fav.id"
        class="favorito-card"
      >
        <div class="favorito-card__top">
          <div
            class="favorito-card__avatar"
            :style="{ background: getAvatarColor(fav) }"
          >
            {{ getAvatarLetter(fav) }}
          </div>
          <div class="favorito-card__info">
            <h3 class="favorito-card__name">{{ fav.displayName }}</h3>
            <p class="favorito-card__address">{{ fav.displayAddress }}</p>
          </div>
          <button class="favorito-card__heart" @click="removeFavorite(fav)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        <div class="favorito-card__stats">
          <div class="favorito-card__meta-row">
            <div class="favorito-card__meta-item">
              <span class="meta-label">{{ FUEL_LABELS[settingsStore.fuelType] }}</span>
              <span class="meta-val">{{ fav.price != null ? `${fav.price.toFixed(3)} €/L` : '—' }}</span>
            </div>
            <div class="favorito-card__meta-item">
               <span class="meta-label">Distancia</span>
               <span class="meta-val">{{ fav.distance != null ? `${fav.distance.toFixed(1)} km` : '—' }}</span>
            </div>
          </div>
          
          <div class="favorito-card__price-bar">
            <span class="price-bar-label">Total precio depósito</span>
            <span class="price-bar-val">{{ fav.tankCost ? `${fav.tankCost} €` : '—' }}</span>
          </div>
        </div>

        <div class="favorito-card__actions">
          <button class="fav-card-map-btn" @click="goToMap(fav)">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Ver en el mapa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
