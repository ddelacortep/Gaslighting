<script setup>
import '@/styles/map.css'
import { ref, onMounted, computed } from 'vue'
import { useGasStationsStore } from '@/stores/gasStations'
import { useMapView } from '@/composables/useMapView'
import FuelFilterBar from '@/components/FuelFilterBar.vue'
import SidebarStationCard from '@/components/SidebarStationCard.vue'
import StationCard from '@/components/StationCard.vue'

const gasStore = useGasStationsStore()
const mapContainerRef = ref(null)

const { initMap } = useMapView(mapContainerRef)

const isSidebarOpen = ref(false)

onMounted(() => {
  initMap()
})

const searchQuery = ref('')
const filteredStations = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return gasStore.stationsWithDistance.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.address.toLowerCase().includes(query)
  )
})

const handleLocate = (station) => {
  gasStore.selectStation(station)
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
          placeholder="Buscar zona o gasolinera..."
        />
      </header>
      
      <div class="map-sidebar-filters">
        <FuelFilterBar />
      </div>

      <div class="map-sidebar-sort">
        <span class="sort-label">Ordenar:</span>
        <button class="sort-btn active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Más cercana
        </button>
        <button class="sort-btn">
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
          placeholder="Buscar zona o gasolinera..."
        />
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
