// src/composables/usePresentation.js
// Préférences personnelles (cookies) pour la présentation du contenu de l'accueil,
// indépendantes du thème visuel (data-theme / data-layout) ET indépendantes entre elles :
// - newsDisplay     : Actualités en liste ou en grille bento
// - releasesDisplay : Dernières sorties en liste ou en grille de posters

import { ref, watch } from 'vue'
import { getCookie, setCookie } from '@/utils/cookies.js'

function cookiePref(name, options) {
  const stored = getCookie(name)
  const value = ref(options.some(o => o.id === stored) ? stored : options[0].id)
  watch(value, (v) => setCookie(name, v))
  return value
}

export const newsDisplays = [
  { id: 'list',  label: 'Liste' },
  { id: 'bento', label: 'Grille bento' },
]
export const newsDisplay = cookiePref('newsDisplay', newsDisplays)

export const releasesDisplays = [
  { id: 'list', label: 'Liste' },
  { id: 'grid', label: 'Grille' },
]
export const releasesDisplay = cookiePref('releasesDisplay', releasesDisplays)
