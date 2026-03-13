import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'gaslighting-settings'

export const useSettingsStore = defineStore('settings', () => {
  const nearbyCount = ref(20)
  const fuelType = ref('gasolina95')
  const tankCapacity = ref(50)
  const consumption = ref(6.5)
  const darkMode = ref(true)

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.nearbyCount !== undefined) nearbyCount.value = parsed.nearbyCount
      if (parsed.fuelType !== undefined) fuelType.value = parsed.fuelType
      if (parsed.tankCapacity !== undefined) tankCapacity.value = parsed.tankCapacity
      if (parsed.consumption !== undefined) consumption.value = parsed.consumption
      if (parsed.darkMode !== undefined) darkMode.value = parsed.darkMode
    } catch (e) {
      console.error('[settings] Failed to load from localStorage:', e)
    }
  }

  function save(newSettings) {
    if (newSettings.nearbyCount !== undefined) nearbyCount.value = newSettings.nearbyCount
    if (newSettings.fuelType !== undefined) fuelType.value = newSettings.fuelType
    if (newSettings.tankCapacity !== undefined) tankCapacity.value = newSettings.tankCapacity
    if (newSettings.consumption !== undefined) consumption.value = newSettings.consumption
    if (newSettings.darkMode !== undefined) darkMode.value = newSettings.darkMode

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nearbyCount: nearbyCount.value,
        fuelType: fuelType.value,
        tankCapacity: tankCapacity.value,
        consumption: consumption.value,
        darkMode: darkMode.value,
      }))
    } catch (e) {
      console.error('[settings] Failed to save to localStorage:', e)
    }
  }

  load()

  return {
    nearbyCount,
    fuelType,
    tankCapacity,
    consumption,
    darkMode,
    load,
    save,
  }
})
