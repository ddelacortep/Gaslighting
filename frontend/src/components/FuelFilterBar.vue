<script setup>
import { useGasStationsStore } from '@/stores/gasStations'

const gasStore = useGasStationsStore()

const fuels = [
  { key: 'gasolina95', label: 'Gasolina 95' },
  { key: 'gasolina98', label: 'Gasolina 98' },
  { key: 'diesel', label: 'Diésel' },
]
</script>

<template>
  <div class="fuel-filter-bar">
    <button
      v-for="fuel in fuels"
      :key="fuel.key"
      class="fuel-filter-btn"
      :class="{ active: gasStore.activeFuel === fuel.key }"
      @click="gasStore.setActiveFuel(fuel.key)"
    >
      {{ fuel.label }}
    </button>
  </div>
</template>
