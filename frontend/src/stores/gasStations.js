import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const API_URL = '/ministerio-api/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/'
const SEARCH_RADIUS_KM = 25

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
  const searchCenterLat = ref(null)
  const searchCenterLng = ref(null)
  // Incrementar para señalar al mapa que debe volar a la ubicación del usuario
  const flyToUserRequested = ref(0)

  const filteredStations = computed(() =>
    stations.value.filter(s => s.prices[activeFuel.value] !== null)
  )

  // Distances computed reactively from search center (if set) or user GPS
  const stationsWithDistance = computed(() => {
    const cLat = searchCenterLat.value ?? userLat.value
    const cLng = searchCenterLng.value ?? userLng.value

    if (cLat === null || cLng === null) {
      return filteredStations.value
    }

    const withDist = filteredStations.value.map(s => ({
      ...s,
      distance: haversine(cLat, cLng, s.lat, s.lng),
    }))

    // Apply radius only when a search center (not GPS) is active
    const inRange = searchCenterLat.value !== null
      ? withDist.filter(s => s.distance <= SEARCH_RADIUS_KM)
      : withDist

    return inRange.sort((a, b) => a.distance - b.distance)
  })

  async function fetchStations() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const raw = data['ListaEESSPrecio'] || []
      stations.value = raw.map(normalizeStation)
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

  // Set a geographic search center (from geocoding). Clears GPS priority.
  function setSearchCenter(lat, lng) {
    searchCenterLat.value = lat
    searchCenterLng.value = lng
  }

  // Set user GPS location. Clears any active search center.
  function setUserLocation(lat, lng) {
    userLat.value = lat
    userLng.value = lng
    searchCenterLat.value = null
    searchCenterLng.value = null
  }

  function requestGeolocation(triggerFly = false) {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by this browser.'
      return
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        userLat.value = position.coords.latitude
        userLng.value = position.coords.longitude
        searchCenterLat.value = null
        searchCenterLng.value = null
        if (triggerFly) flyToUserRequested.value++
      },
      err => {
        console.error('[gasStations] Geolocation error:', err)
        error.value = 'Unable to retrieve your location.'
      }
    )
  }

  // True when distances are computed from a real center (GPS or search)
  const hasCenter = computed(() =>
    userLat.value !== null || searchCenterLat.value !== null
  )

  return {
    stations,
    selectedStation,
    activeFuel,
    loading,
    error,
    userLat,
    userLng,
    flyToUserRequested,
    hasCenter,
    filteredStations,
    stationsWithDistance,
    fetchStations,
    setActiveFuel,
    selectStation,
    clearSelection,
    setUserLocation,
    setSearchCenter,
    requestGeolocation,
  }
})
