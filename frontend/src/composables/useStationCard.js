import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useFavoritesStore } from '@/stores/favorites'
import { brandColor, brandInitial } from '@/utils/brands'
import { formatPrice, calcTankCost, calcRoundTripCost } from '@/utils/price'
import { estimateMinutes, computeIsOpen } from '@/utils/geo'

const FUEL_LABELS = {
  gasolina95: 'Gasolina 95',
  gasolina98: 'Gasolina 98',
  diesel: 'Diésel',
}

export function useStationCard(stationRef) {
  const settingsStore = useSettingsStore()
  const favoritesStore = useFavoritesStore()

  const activeFuelLabel = computed(() => FUEL_LABELS[settingsStore.fuelType] ?? 'Gasolina 95')

  const activePrice = computed(() => {
    const s = stationRef.value
    if (!s) return null
    return s.prices?.[settingsStore.fuelType] ?? null
  })

  const formattedPrice = computed(() =>
    activePrice.value != null ? `${formatPrice(activePrice.value)} €/L` : '—'
  )

  const avatarColor = computed(() => brandColor(stationRef.value?.brand))
  const avatarLetter = computed(() => brandInitial(stationRef.value?.brand))

  const distanceText = computed(() => {
    const d = stationRef.value?.distance
    return d != null ? `${d.toFixed(1)} km` : null
  })

  const commuteText = computed(() => {
    const d = stationRef.value?.distance
    return d != null ? `${estimateMinutes(d)} min` : null
  })

  const tankCost = computed(() => {
    const price = activePrice.value
    return price != null ? calcTankCost(price, settingsStore.tankCapacity) : null
  })

  const roundTripCost = computed(() => {
    const d = stationRef.value?.distance
    const price = activePrice.value
    return calcRoundTripCost(d, settingsStore.consumption, price)
  })

  const isOpen = computed(() => computeIsOpen(stationRef.value?.schedule))

  const isFavorited = computed(() => favoritesStore.isFavorite(stationRef.value?.id))

  function toggleFavorite() {
    if (stationRef.value) {
      favoritesStore.toggleFavorite(stationRef.value)
    }
  }

  const fuels = computed(() => [
    { key: 'gasolina95', label: 'Gasolina 95', price: stationRef.value?.prices?.gasolina95 },
    { key: 'gasolina98', label: 'Gasolina 98', price: stationRef.value?.prices?.gasolina98 },
    { key: 'diesel', label: 'Diésel', price: stationRef.value?.prices?.diesel },
  ])

  return {
    activeFuelLabel,
    activePrice,
    formattedPrice,
    avatarColor,
    avatarLetter,
    distanceText,
    commuteText,
    tankCost,
    roundTripCost,
    isOpen,
    isFavorited,
    toggleFavorite,
    fuels,
    FUEL_LABELS,
  }
}
