// src/composables/useTheme.js
// Préférence globale : palette de couleurs du site. Stockée en cookie
// en attendant que l'API gère les préférences utilisateur, et appliquée
// via un attribut data-theme sur <html> (voir les variables CSS dans style.css).

import { ref, computed, watch } from 'vue'
import { getCookie, setCookie } from '@/utils/cookies.js'
import { http } from '@/services/http.js'
import { socket } from '@/services/socket.js'

export const themes = [
  { id: 'braise',   label: 'Braise',    swatch: ['#0f0f13', '#f47521', '#e8e8f0'] },
  { id: 'ametiste', label: 'Améthyste', swatch: ['#120f1a', '#a855f7', '#ece8f5'] },
  { id: 'abysses',  label: 'Abysses',   swatch: ['#0a121a', '#22d3ee', '#e4eef5'] },
  { id: 'sakura',   label: 'Sakura',    swatch: ['#170f14', '#f4537e', '#f5e8ee'] },
  { id: 'air',      label: 'Air',       swatch: ['#13151c', '#3d6dce', '#ebeef5'] },
]

// Palettes créées depuis l'administration (backend/src/models/Theme.js), en plus
// des 5 thèmes intégrés ci-dessus. Chargées de façon asynchrone (voir loadCustomThemes).
export const customThemes = ref([])

const CUSTOM_VARS = {
  bg0: '--color-bg-0', bg1: '--color-bg-1', bg2: '--color-bg-2', bg3: '--color-bg-3', bg4: '--color-bg-4',
  orange: '--color-orange', orangeHover: '--color-orange-hover',
  ink1: '--color-ink-1', ink2: '--color-ink-2', ink3: '--color-ink-3',
}

// Combine thèmes intégrés + thèmes personnalisés, dans un format uniforme pour les sélecteurs
export const allThemes = computed(() => [
  ...themes,
  ...customThemes.value.map(t => ({
    id: t.slug,
    label: t.label,
    custom: true,
    colors: t.colors,
    swatch: [
      `rgb(${t.colors.bg0})`,
      `rgb(${t.colors.orange})`,
      `rgb(${t.colors.ink1})`,
    ],
  })),
])

let customFetchPromise = null
export function loadCustomThemes() {
  if (!customFetchPromise) {
    customFetchPromise = http.get('/themes')
      .then((list) => { customThemes.value = Array.isArray(list) ? list : [] })
      .catch(() => {})
  }
  return customFetchPromise
}

// Recharge la liste (après une création/modification/suppression depuis l'admin,
// ou quand un autre admin la modifie — voir l'écoute socket ci-dessous).
export function refreshCustomThemes() {
  customFetchPromise = null
  return loadCustomThemes()
}

socket.on('themes:update', () => refreshCustomThemes().then(() => applyThemeVars(theme.value)))

// Aperçu en direct (admin uniquement) : applique des couleurs candidates sans toucher au
// cookie ni au thème réellement actif — purement visuel, local à cet onglet, à annuler
// avec stopThemePreview() une fois l'édition terminée.
export function previewThemeColors(colors) {
  for (const [key, cssVar] of Object.entries(CUSTOM_VARS)) {
    document.documentElement.style.setProperty(cssVar, colors[key])
  }
}

export function stopThemePreview() {
  applyThemeVars(theme.value)
}

// Applique soit l'attribut data-theme (thèmes intégrés, palette définie dans style.css),
// soit des variables CSS en ligne sur <html> (thèmes personnalisés, sans règle CSS statique).
function applyThemeVars(value) {
  const custom = customThemes.value.find(t => t.slug === value)
  if (custom) {
    document.documentElement.setAttribute('data-theme', value)
    for (const [key, cssVar] of Object.entries(CUSTOM_VARS)) {
      document.documentElement.style.setProperty(cssVar, custom.colors[key])
    }
  } else {
    // Retire d'éventuelles variables laissées par un thème personnalisé précédent
    for (const cssVar of Object.values(CUSTOM_VARS)) {
      document.documentElement.style.removeProperty(cssVar)
    }
    document.documentElement.setAttribute('data-theme', value)
  }
}

const stored = getCookie('theme')

export const theme = ref(stored || themes[0].id)

// Applique l'attribut tout de suite (rendu), mais n'écrit le cookie que sur un vrai
// changement de valeur — sinon un visiteur sans préférence se verrait assigner un cookie
// dès le chargement du module, avant même que le défaut admin (settings.js) ait pu s'appliquer.
applyThemeVars(theme.value)
watch(theme, (value) => {
  applyThemeVars(value)
  setCookie('theme', value)
})
// Une fois les thèmes personnalisés chargés, réapplique au cas où le thème actif en soit un
// (au premier rendu, ses couleurs ne sont pas encore connues).
loadCustomThemes().then(() => applyThemeVars(theme.value))

export const layouts = [
  { id: 'default', label: 'Classique',     icon: '▣' },
  { id: 'glass',   label: 'Glassmorphism', icon: '◈' },
  { id: 'gundam',  label: 'Gundam',        icon: '⚙' },
  { id: 'flux',    label: 'FLUX 2026',     icon: '◆' },
  { id: 'stream',  label: 'Stream',        icon: '▶' },
]

const storedLayout = getCookie('layout')
export const layout = ref(layouts.some(l => l.id === storedLayout) ? storedLayout : 'default')

document.documentElement.setAttribute('data-layout', layout.value)
watch(layout, (value) => {
  document.documentElement.setAttribute('data-layout', value)
  document.documentElement.style.removeProperty('background-color')
  setCookie('layout', value)
})
