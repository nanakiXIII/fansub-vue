// src/api/inProgress.js
// Épisodes en cours de traduction — alimente le carrousel de la page d'accueil.
// Remplace src/data/inProgress.js une fois le backend prêt.

import { api } from './client.js'

// ═══════════════════════════════════════════════════════════════════════════════
// ÉPISODES EN COURS DE TRADUCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère tous les épisodes actuellement en cours de traduction.
 * Utilisé pour alimenter le carrousel de la page d'accueil.
 *
 * GET /api/in-progress
 *
 * Pas de query params — la liste est courte (les épisodes en cours uniquement)
 * et triée par pct décroissant côté serveur (les plus avancés en premier).
 *
 * Réponse attendue :
 * {
 *   data: InProgressEntry[],
 * }
 *
 * Structure d'une InProgressEntry :
 * {
 *   serieId: string,           // slug de la série — joindre avec GET /api/series/:id
 *                              // pour récupérer banner, gradient, title, etc.
 *   visible: boolean,          // false = masqué du carrousel public, visible en mode admin uniquement
 *                              // suit généralement la visibilité de la série liée
 *
 *   episode: {
 *     num:      number,        // numéro de l'épisode
 *     title:    string,        // titre de l'épisode
 *     duration: string,        // ex: '24 min'
 *     lang:     'vf' | 'vostfr',  // langue en cours de traduction
 *   },
 *
 *   translation: {
 *     pct:  number,            // avancement global en % (0-100)
 *                              // calculé côté serveur depuis les étapes,
 *                              // ou saisi manuellement par un admin
 *     eta:  string,            // estimation de mise en ligne (texte libre)
 *                              // ex: 'Ce soir', 'Dans 2h', 'Demain'
 *                              // peut être null si inconnue
 *     steps: [
 *       {
 *         label:   string,     // 'Brut' | 'Traduction' | 'Correction' |
 *                              // 'Timing' | 'Encodage' | 'Mise en ligne'
 *         done:    boolean,    // true = étape terminée
 *         current: boolean,    // true = étape en cours (une seule à la fois)
 *       }
 *     ],
 *   },
 *
 *   staff: {
 *     translator:  string | null,   // pseudo du traducteur assigné
 *     proofreader: string | null,   // pseudo du correcteur
 *     timer:       string | null,   // pseudo du timer
 *     encoder:     string | null,   // pseudo de l'encodeur
 *   },
 * }
 */
export async function getInProgress() {
  return api.get('/in-progress')
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère l'entrée en cours pour une série précise.
 *
 * GET /api/in-progress/:serieId
 *
 * Retourne null (404) si la série n'a pas d'épisode en cours de traduction.
 *
 * Réponse : InProgressEntry | null
 */
export async function getInProgressBySerie(serieId) {
  return api.get(`/in-progress/${serieId}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée une entrée "en cours" pour un épisode (admin uniquement).
 * Appelé quand un épisode est assigné à l'équipe de traduction.
 *
 * POST /api/in-progress
 * Authorization: Bearer <token>
 *
 * Corps :
 * {
 *   serieId:     string,
 *   episode:     { num, title, duration, lang },
 *   translation: { pct, eta, steps },
 *   staff:       { translator, proofreader, timer, encoder },
 * }
 *
 * Réponse : InProgressEntry créée
 */
export async function createInProgress(data) {
  return api.post('/in-progress', data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour la progression d'un épisode en cours (admin uniquement).
 * Appelé à chaque changement d'étape ou mise à jour du pourcentage.
 *
 * PATCH /api/in-progress/:serieId
 * Authorization: Bearer <token>
 *
 * Corps (partiel) :
 * {
 *   translation?: { pct?, eta?, steps? },
 *   staff?:       { translator?, proofreader?, timer?, encoder? },
 * }
 *
 * Cas d'usage — passer à l'étape "Correction" :
 *   updateInProgress('jujutsu-kaisen-s3', {
 *     translation: {
 *       pct: 65,
 *       steps: [
 *         { label: 'Brut',       done: true,  current: false },
 *         { label: 'Traduction', done: true,  current: false },
 *         { label: 'Correction', done: false, current: true  },
 *         ...
 *       ]
 *     }
 *   })
 *
 * Réponse : InProgressEntry mise à jour
 */
export async function updateInProgress(serieId, data) {
  return api.patch(`/in-progress/${serieId}`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supprime une entrée une fois l'épisode mis en ligne (admin uniquement).
 * Appelé automatiquement lors de la publication de l'épisode,
 * ou manuellement si la traduction est abandonnée.
 *
 * DELETE /api/in-progress/:serieId
 * Authorization: Bearer <token>
 *
 * Réponse : 204 No Content
 */
export async function deleteInProgress(serieId) {
  return api.delete(`/in-progress/${serieId}`)
}
