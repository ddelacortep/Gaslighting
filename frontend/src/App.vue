<script setup>
import '@/styles/layout.css'
import { onMounted } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { useGasStationsStore } from '@/stores/gasStations'
import { useSettingsStore } from '@/stores/settings'

import AppBottomNav from '@/components/AppBottomNav.vue'

const gasStore = useGasStationsStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  gasStore.fetchStations()
  
  // Request location on mount
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gasStore.setUserLocation([pos.coords.latitude, pos.coords.longitude])
      },
      (err) => console.warn('Geolocation error:', err)
    )
  }
})

const toggleDarkMode = () => {
  settingsStore.toggleDarkMode()
}
</script>

<template>
  <div class="app-shell" :class="{ 'theme-dark': settingsStore.darkMode }">
    <main class="app-main">
      <RouterView />
    </main>

    <!-- Global Floating Actions (Desktop Only - Hidden via CSS on mobile) -->
    <div class="global-actions">
      <button class="action-btn" title="Capas del mapa">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/>
          <polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
        </svg>
      </button>

      <button class="action-btn" title="Mi ubicación">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      </button>

      <button class="action-btn" @click="toggleDarkMode" :title="settingsStore.darkMode ? 'Modo claro' : 'Modo oscuro'">
        <svg v-if="settingsStore.darkMode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <router-link to="/favoritos" class="action-btn" title="Favoritos">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </router-link>

      <router-link to="/ajustes" class="action-btn" title="Ajustes">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </router-link>
    </div>

    <!-- Mobile Bottom Navigation -->
    <AppBottomNav />
  </div>
</template>
