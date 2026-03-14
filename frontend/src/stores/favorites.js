import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'gaslighting-favorites'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(favs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs))
  } catch {
    // ignore
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref(loadFromStorage())
  const error = ref(null)

  // Set of gas_station_id strings for O(1) isFavorite() lookup
  const favoriteIds = computed(() => new Set(favorites.value.map(f => f.gas_station_id)))

  function addFavorite(station) {
    if (isFavorite(station.id)) return
    favorites.value = [
      ...favorites.value,
      {
        id: station.id,
        gas_station_id: station.id,
        gas_station: {
          external_provider_id: station.id,
          original_name: station.name,
          latitude: station.lat,
          longitude: station.lng,
          address: station.address ?? null,
          brand: station.brand ?? null,
        },
      },
    ]
    saveToStorage(favorites.value)
  }

  function removeFavorite(stationId) {
    favorites.value = favorites.value.filter(f => f.gas_station_id !== stationId)
    saveToStorage(favorites.value)
  }

  function toggleFavorite(station) {
    if (isFavorite(station.id)) {
      removeFavorite(station.id)
    } else {
      addFavorite(station)
    }
  }

  function isFavorite(stationId) {
    return favoriteIds.value.has(stationId)
  }

  return {
    favorites,
    favoriteIds,
    error,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  }
})
