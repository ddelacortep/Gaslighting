import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const USER_ID_KEY = 'gaslighting-user-id'
const BASE_URL = '/api'

export const useFavoritesStore = defineStore('favorites', () => {
  const userId = ref(localStorage.getItem(USER_ID_KEY) || null)
  const favorites = ref([])
  const error = ref(null)

  // Set of gas_station_id strings for O(1) isFavorite() lookup
  const favoriteIds = computed(() => new Set(favorites.value.map(f => f.gas_station_id)))

  async function initUser() {
    if (userId.value) return
    try {
      const res = await fetch(`${BASE_URL}/users/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'web', app_version: '1.0.0' }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      userId.value = data.id
      localStorage.setItem(USER_ID_KEY, data.id)
    } catch (e) {
      console.error('[favorites] initUser error:', e)
      error.value = e.message || 'Failed to initialize user'
    }
  }

  async function loadFavorites() {
    if (!userId.value) return
    try {
      const res = await fetch(`${BASE_URL}/favorites/${userId.value}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      favorites.value = await res.json()
    } catch (e) {
      console.error('[favorites] loadFavorites error:', e)
      error.value = e.message || 'Failed to load favorites'
    }
  }

  async function addFavorite(station) {
    if (!userId.value) return
    try {
      const res = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          user_id: userId.value,
          gas_station: {
            external_provider_id: station.id,
            original_name: station.name,
            latitude: station.lat,
            longitude: station.lng,
            address: station.address ?? null,
            brand: station.brand ?? null,
          },
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await loadFavorites()
    } catch (e) {
      console.error('[favorites] addFavorite error:', e)
      error.value = e.message || 'Failed to add favorite'
    }
  }

  async function removeFavorite(stationId) {
    // stationId is the gas_station_id; we need the favorite UUID to DELETE
    const favorite = favorites.value.find(f => f.gas_station_id === stationId)
    if (!favorite) return
    try {
      const res = await fetch(`${BASE_URL}/favorites/${favorite.id}`, {
        method: 'DELETE',
      })
      if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
      await loadFavorites()
    } catch (e) {
      console.error('[favorites] removeFavorite error:', e)
      error.value = e.message || 'Failed to remove favorite'
    }
  }

  async function toggleFavorite(station) {
    if (isFavorite(station.id)) {
      await removeFavorite(station.id)
    } else {
      await addFavorite(station)
    }
  }

  function isFavorite(stationId) {
    return favoriteIds.value.has(stationId)
  }

  // Init on store creation
  ;(async () => {
    await initUser()
    await loadFavorites()
  })()

  return {
    userId,
    favorites,
    favoriteIds,
    error,
    initUser,
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  }
})
