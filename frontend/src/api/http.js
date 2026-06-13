// src/api/http.js
// =============================================
// Helper HTTP de base.
// Toutes les fonctions API l'utilisent pour faire
// leurs requêtes. Ne pas importer directement
// dans les composants — passer par les modules.
// =============================================

import { config } from '@/config.js'

export async function http(endpoint, options = {}) {
  const url = `${config.apiBaseUrl}${endpoint}`

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${url}`)
  }

  return res.json()
}
