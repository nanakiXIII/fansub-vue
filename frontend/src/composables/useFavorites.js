import { ref, watch } from 'vue'
import { useSettings } from './useSettings.js'
import { userSync } from '@/services/userSync.js'

const LS_KEY = 'fansub_favorites'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') }
  catch { return [] }
}

const favorites = ref(load()) // string[] de serieIds

watch(favorites, val => {
  localStorage.setItem(LS_KEY, JSON.stringify(val))
}, { deep: true })

export function hydrateFromServer(serverFavs) {
  favorites.value = serverFavs
}

export function resetFavorites() {
  favorites.value = []
}

export function useFavorites() {
  const settings = useSettings()

  function isFavorite(serieId) {
    return favorites.value.includes(serieId)
  }

  function toggleFavorite(serieId) {
    if (favorites.value.includes(serieId)) {
      favorites.value = favorites.value.filter(id => id !== serieId)
      if (settings.uid) userSync.removeFavorite(serieId).catch(console.error)
    } else {
      favorites.value = [...favorites.value, serieId]
      if (settings.uid) userSync.addFavorite(serieId).catch(console.error)
    }
  }

  return { favorites, isFavorite, toggleFavorite }
}
