<script setup>
import '@/styles/station-card.css'
import { ref, toRef, computed } from 'vue'
import { useStationCard } from '@/composables/useStationCard'
import { useSettingsStore } from '@/stores/settings'
import { useGasStationsStore } from '@/stores/gasStations'
import wazeIcon from '@/img/waze_icon.png'

const props = defineProps({
  station: { type: Object, required: true },
  averagePrice: { type: Number, default: null },
})

const emit = defineEmits(['close'])

const stationRef = toRef(props, 'station')
const settingsStore = useSettingsStore()
const gasStore = useGasStationsStore()

function openNavigation(app) {
  const { lat, lng } = props.station
  const uLat = gasStore.userLat
  const uLng = gasStore.userLng
  let url
  if (app === 'google') {
    url = uLat != null
      ? `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  } else if (app === 'waze') {
    url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
  } else if (app === 'apple') {
    url = uLat != null
      ? `https://maps.apple.com/?saddr=${uLat},${uLng}&daddr=${lat},${lng}`
      : `https://maps.apple.com/?daddr=${lat},${lng}`
  }
  window.open(url, '_blank')
}

const isExpanded = ref(false)

const {
  activeFuelLabel,
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
} = useStationCard(stationRef)

const showFuels = ref(true)
const showSchedule = ref(false)

const priceDelta = computed(() => {
  const currentFuelKey = settingsStore.fuelType
  const price = props.station?.prices?.[currentFuelKey]
  if (price == null || props.averagePrice == null) return null
  return (price - props.averagePrice).toFixed(3)
})

const isDeltaPositive = computed(() => priceDelta.value && parseFloat(priceDelta.value) > 0)
const isDeltaNegative = computed(() => priceDelta.value && parseFloat(priceDelta.value) < 0)

const handleSummaryClick = () => {
  if (!isExpanded.value) {
    isExpanded.value = true
  }
}

const closeDetail = () => {
  if (isExpanded.value) {
    isExpanded.value = false
  } else {
    emit('close')
  }
}
</script>

<template>
  <div 
    class="station-card" 
    :class="{ 'is-summary': !isExpanded, 'is-expanded': isExpanded }"
    @click="handleSummaryClick"
  >
    <div class="drawer-handle" v-if="isExpanded"></div>

    <!-- Header -->
    <div class="station-card__header">
      <div class="station-card__avatar" :style="{ background: avatarColor }">
        {{ avatarLetter }}
      </div>
      <div class="station-card__title-group">
        <h3 class="station-card__name">{{ station.name }}</h3>
        <div class="station-card__metadata">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          <span>{{ distanceText }}</span>
          <span 
            class="station-status-pill" 
            :class="{ open: isOpen === true, closed: isOpen === false }"
          >
            {{ isOpen === true ? 'Abierto' : isOpen === false ? 'Cerrado' : 'Desconocido' }}
          </span>
        </div>
      </div>
      <div class="station-card__price-group">
        <span class="station-card__fuel-type">{{ activeFuelLabel }}</span>
        <span class="station-card__price-val">{{ formattedPrice }}</span>
      </div>
      <button class="station-card__close" @click.stop="closeDetail">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Summary Actions -->
    <div class="mobile-summary-actions" v-if="!isExpanded">
      <button class="mobile-action-btn" @click.stop="toggleFavorite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'is-active': isFavorited }">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        Añadir favorito
      </button>
      <button class="mobile-action-btn primary" @click.stop="isExpanded = true">
        Ver detalles
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>

    <template v-if="isExpanded">
      <!-- Favorite Action -->
      <div class="station-card__actions">
        <button class="btn-favorite" @click="toggleFavorite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'is-active': isFavorited }">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {{ isFavorited ? 'Eliminar de favoritos' : 'Añadir a favoritos' }}
        </button>
      </div>

      <!-- Navigation Buttons -->
      <div class="station-card__navigation">
        <button class="nav-btn nav-btn--google" @click.stop="openNavigation('google')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          Google Maps
        </button>
        <button class="nav-btn nav-btn--waze" @click.stop="openNavigation('waze')">
          <img :src="wazeIcon" class="nav-btn__img" alt="Waze" />
          Waze
        </button>
        <button class="nav-btn nav-btn--apple" @click.stop="openNavigation('apple')">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.029 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
          </svg>
          Apple Maps
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="station-card__stats">
        <div class="stat-item">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M3 11V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 11h18M3 11v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>
            </svg>
          </div>
          <span class="stat-val">{{ tankCost ? `${tankCost} €` : '—' }}</span>
          <span class="stat-label">Depósito {{ settingsStore.tankCapacity }}L</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <span class="stat-val" :class="{ positive: isDeltaPositive, negative: isDeltaNegative }">
            {{ priceDelta != null ? `${parseFloat(priceDelta) > 0 ? '+' : ''}${priceDelta} €` : '—' }}
          </span>
          <span class="stat-label">Sobre la media</span>
        </div>
        <div class="stat-item">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h2"/>
              <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>
            </svg>
          </div>
          <span class="stat-val">{{ roundTripCost ? `${roundTripCost} €` : '—' }}</span>
          <span class="stat-label">Ir y volver</span>
        </div>
      </div>

      <!-- Accordions -->
      <div class="station-card__sections">
        <div class="accordion-item" :class="{ 'is-open': showFuels }">
          <button class="accordion-header" @click="showFuels = !showFuels">
            <svg class="accordion-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 11h18M3 11V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5M3 11v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>
            </svg>
            Todos los combustibles
            <svg class="accordion-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-show="showFuels" class="accordion-content">
            <div class="fuel-list">
              <div 
                v-for="fuel in fuels" 
                :key="fuel.key" 
                class="fuel-item"
                :class="{ 'is-active': fuel.key === settingsStore.fuelType }"
              >
                <span class="fuel-name">{{ fuel.label }}</span>
                <span class="fuel-price">{{ fuel.price != null ? `${fuel.price.toFixed(3)} €/L` : '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item" :class="{ 'is-open': showSchedule }">
          <button class="accordion-header" @click="showSchedule = !showSchedule">
            <svg class="accordion-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Horarios
            <svg class="accordion-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div v-show="showSchedule" class="accordion-content">
            <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">{{ station.schedule || 'Horario no detallado' }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="station-card__footer">
        <div class="footer-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          {{ station.address }}
        </div>
      </div>
    </template>
  </div>
</template>

