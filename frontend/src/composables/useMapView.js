import { ref, watch, onUnmounted } from 'vue'
import L from 'leaflet'
import { useGasStationsStore } from '@/stores/gasStations'
import { brandColor, brandInitial } from '@/utils/brands'

// Leaflet marker icon fix for Vite bundling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const MADRID_CENTER = [40.4168, -3.7038]
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

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
  const mapInstance = ref(null)
  const markerLayer = ref(null)
  // Map of stationId → Leaflet marker
  const markerMap = new Map()

  function initMap() {
    if (!mapContainerRef.value || mapInstance.value) return

    mapInstance.value = L.map(mapContainerRef.value, {
      center: MADRID_CENTER,
      zoom: 13,
      zoomControl: false,
    })

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(mapInstance.value)

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(mapInstance.value)

    markerLayer.value = L.layerGroup().addTo(mapInstance.value)

    // Click on map background → deselect station
    mapInstance.value.on('click', () => {
      gasStore.clearSelection()
    })
  }

  function renderMarkers(stations) {
    if (!markerLayer.value) return

    markerLayer.value.clearLayers()
    markerMap.clear()

    for (const station of stations) {
      if (!station.lat || !station.lng) continue

      const marker = L.marker([station.lat, station.lng], {
        icon: createMarkerIcon(station, gasStore.selectedStation?.id === station.id),
        zIndexOffset: gasStore.selectedStation?.id === station.id ? 1000 : 0,
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

  function flyToStation(station) {
    if (!mapInstance.value || !station) return
    mapInstance.value.flyTo([station.lat, station.lng], 15, { duration: 0.8 })
  }

  function destroyMap() {
    if (mapInstance.value) {
      mapInstance.value.remove()
      mapInstance.value = null
    }
    markerMap.clear()
  }

  // Watch filtered stations → re-render markers
  const stopStationsWatch = watch(
    () => gasStore.stationsWithDistance,
    (stations) => renderMarkers(stations),
    { immediate: true }
  )

  // Watch selected station → update marker icon + fly to
  const stopSelectionWatch = watch(
    () => gasStore.selectedStation,
    (newStation, prevStation) => {
      updateSelectedMarker(prevStation, newStation)
      if (newStation) flyToStation(newStation)
    }
  )

  // Watch active fuel → re-render markers (prices change)
  const stopFuelWatch = watch(
    () => gasStore.activeFuel,
    () => renderMarkers(gasStore.stationsWithDistance)
  )

  onUnmounted(() => {
    stopStationsWatch()
    stopSelectionWatch()
    stopFuelWatch()
    destroyMap()
  })

  return {
    mapInstance,
    initMap,
    destroyMap,
    flyToStation,
  }
}
