// src/composables/useImageOverlay.js
// Préférence globale : intensité du dégradé teinté appliqué par-dessus
// les images (bannières, affiches). Stockée en cookie en attendant
// que l'API gère les préférences utilisateur.

import { ref, computed, watch } from 'vue'
import { getCookie, setCookie } from '@/utils/cookies.js'

const stored = getCookie('overlayOpacity')

// Pourcentage affiché/réglé par l'utilisateur (0 = image pure, 100 = dégradé plein)
export const overlayOpacity = ref(stored !== null ? Number(stored) : 55)

// Valeur prête à l'emploi pour une propriété CSS `opacity` (0-1)
export const overlayAlpha = computed(() => overlayOpacity.value / 100)

watch(overlayOpacity, (value) => setCookie('overlayOpacity', String(value)))
