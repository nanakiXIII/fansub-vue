// src/api/episodes.js
// =============================================
// Fonctions API — Épisodes
// =============================================

import { http } from '@/api/http.js'

/**
 * Récupère les épisodes d'une série.
 * @param {string} serieId  - Slug de la série
 * @param {Object} params
 * @param {string} [params.lang]    - 'vf' | 'vostfr'
 * @param {number} [params.season]  - numéro de saison
 * @param {number} [params.page]
 * @returns {Promise<Episode[]>}
 */
export function getEpisodes(serieId, params = {}) {
  const qs = new URLSearchParams(params).toString()
  return http(`/series/${serieId}/episodes${qs ? '?' + qs : ''}`)
}

/**
 * Récupère un épisode précis.
 * @param {string} serieId   - Slug de la série
 * @param {number} episodeNum
 * @returns {Promise<Episode>}
 */
export function getEpisode(serieId, episodeNum) {
  return http(`/series/${serieId}/episodes/${episodeNum}`)
}

/**
 * Récupère les derniers épisodes mis en ligne (toutes séries).
 * @param {number} [limit=10]
 * @returns {Promise<Episode[]>}
 */
export function getLatestEpisodes(limit = 10) {
  return http(`/episodes/latest?limit=${limit}`)
}

/**
 * Marque un épisode comme vu (requiert authentification).
 * @param {string} serieId
 * @param {number} episodeNum
 * @param {number} progress  - Pourcentage de progression (0-100)
 * @returns {Promise<void>}
 */
export function markAsWatched(serieId, episodeNum, progress = 100) {
  return http(`/series/${serieId}/episodes/${episodeNum}/watch`, {
    method: 'POST',
    body: JSON.stringify({ progress }),
  })
}
