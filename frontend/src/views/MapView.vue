<script setup>
import '@/styles/map.css'
import { ref, onMounted, onActivated, nextTick, computed } from 'vue'
import { useGasStationsStore } from '@/stores/gasStations'
import { useSettingsStore } from '@/stores/settings'
import { useMapView } from '@/composables/useMapView'
import FuelFilterBar from '@/components/FuelFilterBar.vue'
import SidebarStationCard from '@/components/SidebarStationCard.vue'
import StationCard from '@/components/StationCard.vue'

defineOptions({ name: 'MapView' })

const gasStore = useGasStationsStore()
const settingsStore = useSettingsStore()
const mapContainerRef = ref(null)

const { initMap, flyTo, flyToUser, mapType, toggleMapType, mapInstance } = useMapView(mapContainerRef)

const isSidebarOpen = ref(false)
const sortMode = ref('distance')

onMounted(() => {
  initMap()
})

onActivated(() => {
  nextTick(() => {
    mapInstance.value?.invalidateSize()
  })
})

const searchQuery = ref('')

const sortedStations = computed(() => {
  const list = [...gasStore.stationsWithDistance]
  if (sortMode.value === 'price') {
    list.sort((a, b) => {
      const pa = a.prices?.[gasStore.activeFuel] ?? Infinity
      const pb = b.prices?.[gasStore.activeFuel] ?? Infinity
      return pa - pb
    })
  }
  return list
})

const filteredStations = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const base = query
    ? sortedStations.value.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query)
      )
    : sortedStations.value
  return base.slice(0, settingsStore.nearbyCount)
})

const handleLocate = (station) => {
  gasStore.selectStation(station)
}

// Geocode the search query and set the search center.
// Clears text filter so the full sorted list is shown near the new center.
async function handleSearchEnter() {
  const query = searchQuery.value.trim()
  if (!query) return

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=es`
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
    const data = await res.json()
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lng = parseFloat(data[0].lon)
      gasStore.setSearchCenter(lat, lng)
      flyTo(lat, lng)
      searchQuery.value = ''
    }
  } catch (e) {
    console.warn('[MapView] Geocoding error:', e)
  }
}

const averagePrice = computed(() => {
  const prices = gasStore.stationsWithDistance
    .map(s => s.prices?.[gasStore.activeFuel])
    .filter(p => p != null)
  if (!prices.length) return null
  return prices.reduce((a, b) => a + b, 0) / prices.length
})
</script>

<template>
  <div class="map-view">
    <!-- Desktop Left Sidebar / Mobile Drawer -->
    <aside class="map-sidebar" :class="{ 'is-open': isSidebarOpen }">
      <header class="map-sidebar-header">
        <div class="sidebar-top-row">
          <h1 class="map-title">Home</h1>
          <button class="btn-close-sidebar" @click="isSidebarOpen = false">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="map-search-input"
          placeholder="Buscar ciudad, provincia, código postal..."
          @keyup.enter="handleSearchEnter"
        />
      </header>

      <div class="map-sidebar-filters">
        <FuelFilterBar />
      </div>

      <div class="map-sidebar-sort">
        <button class="sort-btn" :class="{ active: sortMode === 'distance' }" @click="sortMode = 'distance'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Más cercana
        </button>
        <button class="sort-btn" :class="{ active: sortMode === 'price' }" @click="sortMode = 'price'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
          Más barata
        </button>
        <span class="sort-count">{{ filteredStations.length }} result.</span>
      </div>

      <div class="map-sidebar-list">
        <SidebarStationCard
          v-for="station in filteredStations"
          :key="station.id"
          :station="station"
          @locate="(s) => { handleLocate(s); isSidebarOpen = false }"
          @click="gasStore.selectStation(station)"
        />
      </div>
    </aside>

    <!-- Sidebar Overlay (Mobile Only) -->
    <div class="sidebar-overlay" v-if="isSidebarOpen" @click="isSidebarOpen = false"></div>

    <!-- Mobile Header -->
    <div class="map-mobile-header">
      <div class="map-mobile-search-row">
        <button class="btn-menu" @click="isSidebarOpen = true">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <input
          v-model="searchQuery"
          type="text"
          class="map-search-input"
          placeholder="Buscar ciudad, provincia, código postal..."
          @keyup.enter="handleSearchEnter"
        />
        <button class="btn-map-action" title="Mi ubicación" @click="gasStore.requestGeolocation(true)">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </button>
        <button class="btn-map-action" :title="mapType === 'satellite' ? 'Vista mapa' : 'Vista satélite'" @click="toggleMapType">
          <!-- When satellite: show map/layers icon (click → go to map) -->
          <svg v-if="mapType === 'satellite'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <!-- When map: show globe icon (click → go to satellite) -->
          <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </button>
      </div>
      <div class="map-mobile-filters">
        <FuelFilterBar />
      </div>
    </div>

    <!-- Main Map Area -->
    <div class="map-main">
      <div v-if="gasStore.loading" class="map-overlay">
        <div class="spinner"></div>
        <p>Cargando gasolineras...</p>
      </div>

      <div v-else-if="gasStore.error" class="map-overlay">
        <p>{{ gasStore.error }}</p>
        <button @click="gasStore.fetchStations()">Reintentar</button>
      </div>

      <div ref="mapContainerRef" class="map-container"></div>

      <!-- Station Detail Modal Wrapper (Center-Bottom) -->
      <Transition name="fade">
        <div v-if="gasStore.selectedStation" class="station-modal-wrapper" @click.stop>
          <StationCard
            :station="gasStore.selectedStation"
            :averagePrice="averagePrice"
            @close="gasStore.clearSelection()"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>
