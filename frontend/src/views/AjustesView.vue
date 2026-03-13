<script setup>
import '@/styles/ajustes.css'
import { useAjustesView } from '@/composables/useAjustesView'
import { useRouter } from 'vue-router'

const {
  nearbyCount,
  fuelType,
  tankCapacity,
  consumption,
  darkMode,
  saveSettings,
  toggleDarkMode,
} = useAjustesView()

const router = useRouter()

const FUEL_LABELS = {
  gasolina95: 'Gasolina 95',
  gasolina98: 'Gasolina 98',
  diesel: 'Diésel',
}
</script>

<template>
  <div class="ajustes-view">
    <!-- Header -->
    <header class="ajustes-header">
      <button @click="router.push('/')" class="ajustes-header__back">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div class="ajustes-header__icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </div>
      <h1>Ajustes</h1>
    </header>

    <!-- Visualización -->
    <section class="settings-section">
      <p class="settings-section-title">Visualización</p>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-label">Gasolineras cercanas mostradas</div>
          <select class="settings-select" v-model="nearbyCount" @change="saveSettings">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Mi Vehículo -->
    <section class="settings-section">
      <p class="settings-section-title">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h2"/>
          <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>
        </svg>
        Mi Vehículo
      </p>
      <div class="settings-card">
        <div class="fuel-type-select">
          <span class="fuel-type-label">Tipo de Gasolina Habitual</span>
          <div class="fuel-type-btn">
             <select class="settings-select" v-model="fuelType" @change="saveSettings" style="width: 100%; text-align: left;">
                <option value="gasolina95">Gasolina 95</option>
                <option value="gasolina98">Gasolina 98</option>
                <option value="diesel">Diésel</option>
             </select>
          </div>
        </div>
        
        <div class="settings-row">
          <div class="settings-row-label">Tamaño Depósito</div>
          <div class="settings-input-group">
            <input class="settings-input" type="number" v-model.number="tankCapacity" @change="saveSettings" min="1" max="200" />
            <span class="settings-input-unit">litros</span>
          </div>
        </div>
        
        <div class="settings-row">
          <div class="settings-row-label">Consumo Medio</div>
          <div class="settings-input-group">
            <input class="settings-input" type="number" v-model.number="consumption" @change="saveSettings" min="1" max="30" step="0.1" />
            <span class="settings-input-unit">l/100km</span>
          </div>
        </div>
      </div>
      <p style="font-size: 10px; color: var(--text-dark); margin-top: 12px; padding: 0 4px;">Estos datos se usan para calcular el coste total de llenar tu depósito en la pestaña de Favoritos.</p>
    </section>

    <!-- Apariencia -->
    <section class="settings-section">
      <p class="settings-section-title">Apariencia</p>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-label">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            Modo Oscuro
          </div>
          <label class="toggle-switch">
            <input type="checkbox" :checked="darkMode" @change="toggleDarkMode" />
            <span class="toggle-track"></span>
            <span class="toggle-thumb"></span>
          </label>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="ajustes-footer">
      <p class="ajustes-footer-name">Gaslighting</p>
      <p class="ajustes-footer-version">Versión 1.0.0</p>
    </footer>
  </div>
</template>
