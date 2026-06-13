// src/api/user.js
// =============================================
// Fonctions API — Utilisateur & Ma liste
// =============================================

import { http } from '@/api/http.js'

/**
 * Récupère la liste de favoris de l'utilisateur.
 * @returns {Promise<Serie[]>}
 */
export function getWatchlist() {
  return http('/user/watchlist')
}

/**
 * Ajoute une série à la liste de l'utilisateur.
 * @param {string} serieId
 * @returns {Promise<void>}
 */
export function addToWatchlist(serieId) {
  return http('/user/watchlist', {
    method: 'POST',
    body: JSON.stringify({ serieId }),
  })
}

/**
 * Retire une série de la liste de l'utilisateur.
 * @param {string} serieId
 * @returns {Promise<void>}
 */
export function removeFromWatchlist(serieId) {
  return http(`/user/watchlist/${serieId}`, { method: 'DELETE' })
}

/**
 * Récupère l'historique de visionnage.
 * @returns {Promise<{ serie: Serie, episode: Episode, progress: number, watchedAt: string }[]>}
 */
export function getHistory() {
  return http('/user/history')
}

/**
 * Met à jour le profil de l'utilisateur.
 * @param {Object} data
 * @param {string} [data.username]
 * @param {string} [data.email]
 * @param {string} [data.avatar]
 * @returns {Promise<User>}
 */
export function updateProfile(data) {
  return http('/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Met à jour le mot de passe.
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
export function updatePassword(currentPassword, newPassword) {
  return http('/user/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}
