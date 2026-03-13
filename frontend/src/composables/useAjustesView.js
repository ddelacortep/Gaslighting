import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'

export function useAjustesView() {
  const settingsStore = useSettingsStore()
  const { nearbyCount, fuelType, tankCapacity, consumption, darkMode } = storeToRefs(settingsStore)

  function saveSettings() {
    settingsStore.save({
      nearbyCount: nearbyCount.value,
      fuelType: fuelType.value,
      tankCapacity: tankCapacity.value,
      consumption: consumption.value,
      darkMode: darkMode.value,
    })
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    saveSettings()
  }

  return {
    nearbyCount,
    fuelType,
    tankCapacity,
    consumption,
    darkMode,
    saveSettings,
    toggleDarkMode,
  }
}
