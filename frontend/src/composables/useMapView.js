import { ref, computed, watch, onUnmounted } from 'vue'
import L from 'leaflet'
import { useGasStationsStore } from '@/stores/gasStations'
import { useSettingsStore } from '@/stores/settings'
import { brandColor, brandInitial } from '@/utils/brands'

// Leaflet marker icon fix for Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const SPAIN_CENTER = [40.0, -3.5]
const DEFAULT_ZOOM = 11
const GPS_ZOOM = 12

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
const TILE_SAT_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'

function createMarkerIcon(station, isSelected) {
  const color = brandColor(station.brand)
  const letter = brandInitial(station.name)
  const price = station.prices?.[useGasStationsStore().activeFuel]
  const priceStr = price != null ? price.toFixed(3) : '—'

  return L.divIcon({
    className: '',
    html: `<div class="price-marker${isSelected ? ' price-marker--selected' : ''}">
      <div class="price-marker__avatar" style="background:${color}">${letter}</div>
      <span class="price-marker__price">${priceStr}€</span>
    </div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  })
}

export function useMapView(mapContainerRef) {
  const gasStore = useGasStationsStore()
  const settingsStore = useSettingsStore()
  const mapInstance = ref(null)
  const markerLayer = ref(null)
  const tileLayer = ref(null)
  const mapBounds = ref(null)
  const mapType = ref('map') // 'map' | 'satellite'
  const markerMap = new Map()
  const userMarker = ref(null)

  function placeUserMarker(lat, lng) {
    if (!mapInstance.value) return
    const icon = L.divIcon({
      className: '',
      html: `<div class="user-location-dot"><div class="user-location-dot__ring"></div><div class="user-location-dot__core"></div></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    })
    if (userMarker.value) {
      userMarker.value.setLatLng([lat, lng])
    } else {
      userMarker.value = L.marker([lat, lng], { icon, zIndexOffset: 500 }).addTo(mapInstance.value)
    }
  }

  function getTileConfig() {
    if (mapType.value === 'satellite') {
      return { url: TILE_SATELLITE, attribution: TILE_SAT_ATTRIBUTION }
    }
    return {
      url: settingsStore.darkMode ? TILE_DARK : TILE_LIGHT,
      attribution: TILE_ATTRIBUTION,
    }
  }

  function updateTileLayer() {
    if (!mapInstance.value) return
    if (tileLayer.value) tileLayer.value.remove()
    const { url, attribution } = getTileConfig()
    tileLayer.value = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(mapInstance.value)
  }

  function toggleMapType() {
    mapType.value = mapType.value === 'map' ? 'satellite' : 'map'
    updateTileLayer()
  }

  function flyTo(lat, lng, zoom = GPS_ZOOM) {
    if (!mapInstance.value) return
    mapInstance.value.flyTo([lat, lng], zoom, { duration: 0.8 })
  }

  function flyToStation(station) {
    if (!mapInstance.value || !station) return
    mapInstance.value.flyTo([station.lat, station.lng], 15, { duration: 0.8 })
  }

  function flyToUser() {
    if (gasStore.userLat !== null && gasStore.userLng !== null) {
      placeUserMarker(gasStore.userLat, gasStore.userLng)
      flyTo(gasStore.userLat, gasStore.userLng, GPS_ZOOM)
    }
  }

  function initMap() {
    if (!mapContainerRef.value || mapInstance.value) return

    mapInstance.value = L.map(mapContainerRef.value, {
      center: SPAIN_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
    })

    const { url, attribution } = getTileConfig()
    tileLayer.value = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(mapInstance.value)

    // Zoom control only on desktop (hidden via CSS on mobile)
    L.control.zoom({ position: 'topright' }).addTo(mapInstance.value)

    markerLayer.value = L.layerGroup().addTo(mapInstance.value)

    mapBounds.value = mapInstance.value.getBounds()
    mapInstance.value.on('moveend', () => {
      mapBounds.value = mapInstance.value.getBounds()
    })

    mapInstance.value.on('click', () => {
      gasStore.clearSelection()
    })

  }

  function renderMarkers(stations) {
    if (!markerLayer.value) return

    markerLayer.value.clearLayers()
    markerMap.clear()

    for (const station of stations) {
      const isSelected = gasStore.selectedStation?.id === station.id
      const marker = L.marker([station.lat, station.lng], {
        icon: createMarkerIcon(station, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      })

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e)
        gasStore.selectStation(station)
      })

      markerLayer.value.addLayer(marker)
      markerMap.set(station.id, marker)
    }
  }

  function updateSelectedMarker(prevStation, newStation) {
    if (prevStation) {
      const m = markerMap.get(prevStation.id)
      if (m) m.setIcon(createMarkerIcon(prevStation, false))
    }
    if (newStation) {
      const m = markerMap.get(newStation.id)
      if (m) {
        m.setIcon(createMarkerIcon(newStation, true))
        m.setZIndexOffset(1000)
      }
    }
  }

  function destroyMap() {
    if (mapInstance.value) {
      mapInstance.value.remove()
      mapInstance.value = null
    }
    markerMap.clear()
    userMarker.value = null
  }

  // Nearest N stations when a center is known, viewport-based fallback otherwise
  const visibleStations = computed(() => {
    if (gasStore.hasCenter) {
      return gasStore.stationsWithDistance.slice(0, settingsStore.nearbyCount)
    }
    if (!mapBounds.value) {
      return gasStore.stationsWithDistance.slice(0, settingsStore.nearbyCount)
    }
    return gasStore.stationsWithDistance
      .filter(s => s.lat && s.lng && mapBounds.value.contains([s.lat, s.lng]))
      .slice(0, settingsStore.nearbyCount)
  })

  const stopStationsWatch = watch(visibleStations, renderMarkers, { immediate: true })

  const stopBoundsWatch = watch(mapBounds, () => {
    renderMarkers(visibleStations.value)
  })

  const stopSelectionWatch = watch(
    () => gasStore.selectedStation,
    (newStation, prevStation) => {
      updateSelectedMarker(prevStation, newStation)
      if (newStation) flyToStation(newStation)
    }
  )

  const stopFuelWatch = watch(
    () => gasStore.activeFuel,
    () => renderMarkers(visibleStations.value)
  )

  // Solo volar al usuario cuando se solicita explícitamente (botón GPS)
  const stopFlyToUserWatch = watch(
    () => gasStore.flyToUserRequested,
    () => flyToUser()
  )

  const stopThemeWatch = watch(
    () => settingsStore.darkMode,
    () => updateTileLayer()
  )

  onUnmounted(() => {
    stopStationsWatch()
    stopBoundsWatch()
    stopSelectionWatch()
    stopFuelWatch()
    stopFlyToUserWatch()
    stopThemeWatch()
    destroyMap()
  })

  return {
    mapInstance,
    mapType,
    initMap,
    destroyMap,
    flyTo,
    flyToStation,
    flyToUser,
    toggleMapType,
  }
}
