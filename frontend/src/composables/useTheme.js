// src/composables/useTheme.js
// Préférence globale : palette de couleurs du site. Stockée en cookie
// en attendant que l'API gère les préférences utilisateur, et appliquée
// via un attribut data-theme sur <html> (voir les variables CSS dans style.css).

import { ref, watch } from 'vue'
import { getCookie, setCookie } from '@/utils/cookies.js'

export const themes = [
  { id: 'braise',   label: 'Braise',    swatch: ['#0f0f13', '#f47521', '#e8e8f0'] },
  { id: 'ametiste', label: 'Améthyste', swatch: ['#120f1a', '#a855f7', '#ece8f5'] },
  { id: 'abysses',  label: 'Abysses',   swatch: ['#0a121a', '#22d3ee', '#e4eef5'] },
  { id: 'sakura',   label: 'Sakura',    swatch: ['#170f14', '#f4537e', '#f5e8ee'] },
  { id: 'air',      label: 'Air',       swatch: ['#13151c', '#3d6dce', '#ebeef5'] },
]

const stored = getCookie('theme')

export const theme = ref(themes.some(t => t.id === stored) ? stored : themes[0].id)

// Applique l'attribut tout de suite (rendu), mais n'écrit le cookie que sur un vrai
// changement de valeur — sinon un visiteur sans préférence se verrait assigner un cookie
// dès le chargement du module, avant même que le défaut admin (settings.js) ait pu s'appliquer.
document.documentElement.setAttribute('data-theme', theme.value)
watch(theme, (value) => {
  document.documentElement.setAttribute('data-theme', value)
  setCookie('theme', value)
})

export const layouts = [
  { id: 'default', label: 'Classique',     icon: '▣' },
  { id: 'glass',   label: 'Glassmorphism', icon: '◈' },
  { id: 'gundam',  label: 'Gundam',        icon: '⚙' },
  { id: 'flux',    label: 'FLUX 2026',     icon: '◆' },
]

const storedLayout = getCookie('layout')
export const layout = ref(layouts.some(l => l.id === storedLayout) ? storedLayout : 'default')

document.documentElement.setAttribute('data-layout', layout.value)
watch(layout, (value) => {
  document.documentElement.setAttribute('data-layout', value)
  document.documentElement.style.removeProperty('background-color')
  setCookie('layout', value)
})
