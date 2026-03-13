import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const API_URL = '/ministerio-api/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'

function parsePrice(str) {
  if (!str || str.trim() === '') return null
  const parsed = parseFloat(str.replace(',', '.'))
  return isNaN(parsed) ? null : parsed
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function normalizeStation(raw) {
  return {
    id: raw['IDEESS'],
    name: raw['Rótulo'],
    lat: parseFloat(raw['Latitud'].replace(',', '.')),
    lng: parseFloat(raw['Longitud (WGS84)'].replace(',', '.')),
    address: raw['Dirección'],
    schedule: raw['Horario'],
    brand: (raw['Rótulo'] || '').toUpperCase(),
    prices: {
      gasolina95: parsePrice(raw['Precio Gasolina 95 E5']),
      gasolina98: parsePrice(raw['Precio Gasolina 98 E5']),
      diesel: parsePrice(raw['Precio Gasoleo A']),
    },
    distance: null,
  }
}

export const useGasStationsStore = defineStore('gasStations', () => {
  const stations = ref([])
  const selectedStation = ref(null)
  const activeFuel = ref('gasolina95')
  const loading = ref(false)
  const error = ref(null)
  const userLat = ref(null)
  const userLng = ref(null)

  const filteredStations = computed(() =>
    stations.value.filter(s => s.prices[activeFuel.value] !== null)
  )

  const stationsWithDistance = computed(() => {
    const list = [...filteredStations.value]
    if (userLat.value !== null && userLng.value !== null) {
      return list.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    }
    return list
  })

  async function fetchStations() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const raw = data['ListaEESSPrecio'] || []
      stations.value = raw
        .filter(s => s['IDProvincia'] === '28')
        .map(normalizeStation)
      calculateDistances()
    } catch (e) {
      console.error('[gasStations] fetchStations error:', e)
      error.value = e.message || 'Error fetching stations'
    } finally {
      loading.value = false
    }
  }

  function setActiveFuel(fuel) {
    activeFuel.value = fuel
  }

  function selectStation(station) {
    selectedStation.value = station
  }

  function clearSelection() {
    selectedStation.value = null
  }

  function calculateDistances() {
    if (userLat.value === null || userLng.value === null) return
    stations.value = stations.value.map(s => ({
      ...s,
      distance: haversine(userLat.value, userLng.value, s.lat, s.lng),
    }))
  }

  function requestGeolocation() {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by this browser.'
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        userLat.value = position.coords.latitude
        userLng.value = position.coords.longitude
        calculateDistances()
      },
      err => {
        console.error('[gasStations] Geolocation error:', err)
        error.value = 'Unable to retrieve your location.'
      }
    )
  }

  return {
    stations,
    selectedStation,
    activeFuel,
    loading,
    error,
    userLat,
    userLng,
    filteredStations,
    stationsWithDistance,
    fetchStations,
    setActiveFuel,
    selectStation,
    clearSelection,
    requestGeolocation,
    calculateDistances,
  }
})
