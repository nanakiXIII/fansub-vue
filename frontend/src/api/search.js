// src/api/search.js
// =============================================
// Fonctions API — Recherche
// =============================================

import { http } from '@/api/http.js'

/**
 * Recherche full-text dans le catalogue.
 * @param {string} query  - Terme recherché
 * @param {Object} params
 * @param {string} [params.type]   - 'serie' | 'episode'
 * @param {number} [params.limit]
 * @returns {Promise<{ series: Serie[], episodes: Episode[] }>}
 */
export function search(query, params = {}) {
  const qs = new URLSearchParams({ q: query, ...params }).toString()
  return http(`/search?${qs}`)
}

/**
 * Recherche avec autocomplétion (suggestions rapides).
 * @param {string} query
 * @returns {Promise<{ id: string, title: string, type: string }[]>}
 */
export function searchSuggestions(query) {
  return http(`/search/suggestions?q=${encodeURIComponent(query)}`)
}
