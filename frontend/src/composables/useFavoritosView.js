import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { useGasStationsStore } from '@/stores/gasStations'
import { useSettingsStore } from '@/stores/settings'
import { brandColor, brandInitial } from '@/utils/brands'
import { calcTankCost } from '@/utils/price'
import { haversineKm } from '@/utils/geo'

export function useFavoritosView() {
  const router = useRouter()
  const favoritesStore = useFavoritesStore()
  const gasStore = useGasStationsStore()
  const settingsStore = useSettingsStore()

  // Join favorites with live station data from the gas stations store
  const favoritesWithLiveData = computed(() =>
    favoritesStore.favorites.map(fav => {
      const liveStation = gasStore.stations.find(s => s.id === fav.gas_station_id)
      const gs = fav.gas_station ?? {}

      // Use live station if available, otherwise fall back to cached backend data
      const lat = liveStation?.lat ?? parseFloat(gs.latitude)
      const lng = liveStation?.lng ?? parseFloat(gs.longitude)

      let distance = null
      if (gasStore.userLat != null && gasStore.userLng != null && lat && lng) {
        distance = haversineKm(gasStore.userLat, gasStore.userLng, lat, lng)
      }

      const price = liveStation?.prices?.[settingsStore.fuelType] ?? null
      const tankCost = calcTankCost(price, settingsStore.tankCapacity)

      return {
        ...fav,
        liveStation,
        displayName: fav.custom_name || liveStation?.name || gs.original_name,
        displayAddress: liveStation?.address || gs.address,
        brand: liveStation?.brand || gs.brand,
        price,
        tankCost,
        distance,
      }
    })
  )

  function getAvatarColor(fav) {
    return brandColor(fav.brand)
  }

  function getAvatarLetter(fav) {
    return brandInitial(fav.brand)
  }

  function goToMap(fav) {
    if (fav.liveStation) {
      gasStore.selectStation(fav.liveStation)
    }
    router.push('/')
  }

  function removeFavorite(fav) {
    favoritesStore.removeFavorite(fav.gas_station_id)
  }

  return {
    favoritesWithLiveData,
    favoritesStore,
    settingsStore,
    getAvatarColor,
    getAvatarLetter,
    goToMap,
    removeFavorite,
  }
}
