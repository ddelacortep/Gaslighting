<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navItems = [
  { 
    name: 'Gasolineras', 
    path: '/', 
    icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'
  },
  { 
    name: 'Favoritos', 
    path: '/favoritos', 
    icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
  },
  { 
    name: 'Ajustes', 
    path: '/ajustes', 
    icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'
  }
]

const isActive = (path) => route.path === path
</script>

<template>
  <nav class="app-bottom-nav">
    <button 
      v-for="item in navItems" 
      :key="item.name"
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="router.push(item.path)"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path :d="item.icon" v-if="item.name !== 'Gasolineras' && item.name !== 'Ajustes'" />
        <!-- Custom paths for cleaner execution if icons are complex like Ajustes -->
        <template v-if="item.name === 'Gasolineras'">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </template>
        <template v-else-if="item.name === 'Ajustes'">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </template>
        <template v-else>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </template>
      </svg>
      <span class="nav-label">{{ item.name }}</span>
    </button>
  </nav>
</template>

<style scoped>
.app-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
  background: var(--bg-sidebar);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 8px;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
}

.nav-item {
  flex: 1;
  height: var(--bottom-nav-height);
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: var(--text-dark);
  cursor: pointer;
  transition: color var(--transition);
}

.nav-icon {
  width: 26px;
  height: 26px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

.nav-item.active {
  color: var(--accent);
}

.nav-item.active .nav-icon {
  stroke: var(--accent);
}

@media (min-width: 768px) {
  .app-bottom-nav {
    display: none;
  }
}
</style>
