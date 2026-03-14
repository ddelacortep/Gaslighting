<script setup>
import { computed } from 'vue'
import { brandColor, brandInitial } from '@/utils/brands'
import { useGasStationsStore } from '@/stores/gasStations'

const props = defineProps({
  station: { type: Object, required: true },
})

const emit = defineEmits(['locate'])

const gasStore = useGasStationsStore()

import { useFavoritesStore } from '@/stores/favorites'
const favoritesStore = useFavoritesStore()

const isFavorited = computed(() => favoritesStore.isFavorite(props.station.id))

const toggleFavorite = () => {
  favoritesStore.toggleFavorite(props.station)
}

const activeFuel = computed(() => gasStore.activeFuel)
const activeFuelLabel = computed(() => {
  if (activeFuel.value === 'gasolina95') return 'Gasolina 95'
  if (activeFuel.value === 'gasolina98') return 'Gasolina 98'
  if (activeFuel.value === 'diesel') return 'Diésel'
  return ''
})

const price = computed(() => {
  const val = props.station.prices?.[activeFuel.value]
  return val != null ? val.toFixed(3) : null
})

const avatarColor = computed(() => brandColor(props.station.brand))
const avatarLetter = computed(() => brandInitial(props.station.name))

const distance = computed(() => {
  if (props.station.distance == null) return null
  return props.station.distance < 1 
    ? `${Math.round(props.station.distance * 1000)} m` 
    : `${props.station.distance.toFixed(1)} km`
})
</script>

<template>
  <div class="sidebar-card">
    <div class="sidebar-card-top">
      <div class="sidebar-card-avatar" :style="{ background: avatarColor }">
        {{ avatarLetter }}
      </div>
      <div class="sidebar-card-info">
        <h3 class="sidebar-card-title">{{ station.name }}</h3>
        <p class="sidebar-card-address">{{ station.address }}</p>
      </div>
      <button class="sidebar-card-fav" @click.stop="toggleFavorite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'is-active': isFavorited }">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>

    <div class="sidebar-card-middle">
      <div class="sidebar-card-dist" v-if="distance">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="3 11 22 2 13 21 11 13 3 11"/>
        </svg>
        {{ distance }}
      </div>
      <div class="sidebar-card-price">
        <span class="price-label">{{ activeFuelLabel }}</span>
        <span class="price-value" v-if="price">{{ price }} &euro; <small>/L</small></span>
        <span class="price-value" v-else>--</span>
      </div>
    </div>

    <button class="sidebar-card-btn" @click="emit('locate', station)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      Ver en el mapa
    </button>
  </div>
</template>

<style scoped>
.sidebar-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card-top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.sidebar-card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.sidebar-card-info {
  flex: 1;
  min-width: 0;
}

.sidebar-card-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-card-address {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.sidebar-card-fav {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  margin: -4px;
}

.sidebar-card-fav svg {
  width: 20px;
  height: 20px;
  transition: all var(--transition);
}

.sidebar-card-fav svg.is-active {
  fill: var(--heart-red);
  stroke: var(--heart-red);
}

.sidebar-card-middle {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.sidebar-card-dist {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.sidebar-card-dist svg {
  width: 14px;
  height: 14px;
}

.sidebar-card-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price-label {
  font-size: 10px;
  color: var(--text-secondary);
}

.price-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.price-value small {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.sidebar-card-btn {
  width: 100%;
  background: var(--bg-input);
  color: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background var(--transition);
}

.sidebar-card-btn:hover {
  background: rgba(59, 130, 246, 0.1);
}

.sidebar-card-btn svg {
  width: 16px;
  height: 16px;
}
</style>
