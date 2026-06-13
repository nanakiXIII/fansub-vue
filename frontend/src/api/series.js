// src/api/series.js
// Remplace les données statiques de src/data/series.js une fois le backend prêt.
//
// Pour migrer :
//   - Remplacer les imports depuis 'src/data/series.js' par ceux d'ici
//   - Appeler les fonctions avec await dans les composables / vues
//   - Gérer les états loading / error avec des ref() dans les composants

import { api } from './client.js'

// ═══════════════════════════════════════════════════════════════════════════════
// SÉRIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère toutes les séries visibles publiquement.
 *
 * GET /api/series
 *
 * Query params optionnels :
 *   ?genre=Action         filtre par genre (ex: 'Action', 'Romance')
 *   ?lang=vostfr          filtre par langue disponible ('vf' | 'vostfr')
 *   ?status=ongoing       filtre par statut ('ongoing' | 'finished')
 *   ?sort=score           tri ('score' | 'year' | 'title' | 'updated_at')
 *   ?page=1&limit=20      pagination
 *
 * Réponse attendue :
 * {
 *   data:  Serie[],   // tableau de séries
 *   total: number,    // total sans pagination (pour afficher "X séries")
 *   page:  number,
 *   limit: number,
 * }
 *
 * Structure d'une Serie :
 * {
 *   id:            string,                   // slug unique, ex: 'danmachi'
 *   title:         string,                   // titre court pour les cards
 *   titleFull:     string,                   // titre complet
 *   titleJp:       string | null,            // titre japonais (kanji)
 *   season:        string | null,            // ex: 'Saison 3 · Arc Culling Game'
 *   seasonLabel:   string | null,            // ex: 'Printemps 2024'
 *   studio:        string | null,
 *   broadcast:     string | null,            // chaîne de diffusion JP
 *   year:          number,
 *   episodesAired: number,
 *   duration:      string,                   // ex: '~24 min'
 *   status:        'ongoing' | 'finished',
 *   source:        string | null,            // ex: 'Weekly Shonen Jump'
 *   score:         number | null,            // note sur 10
 *   genres:        string[],
 *   langs:         ('vf' | 'vostfr')[],
 *   isNew:         boolean,                  // badge "Nouveau" dans le catalogue
 *   isSimulcast:   boolean,
 *   visible:       boolean,                  // false = masqué sauf mode admin
 *   gradient:      string,                   // CSS gradient (couleur de la card)
 *   poster:        string,                   // URL affiche (ratio 2:3)
 *   banner:        string | null,            // URL bannière (ratio ~16:7)
 *   synopsis:      string,
 *   staff: {
 *     translator:  string,
 *     proofreader: string,
 *   },
 * }
 */
export async function getSeries(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/series${qs ? `?${qs}` : ''}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère une série complète par son slug.
 * Inclut les personnages, les saisons et les épisodes.
 *
 * GET /api/series/:id
 *
 * Réponse attendue :
 * {
 *   ...Serie,            // tous les champs de getSeries()
 *   characters: [
 *     {
 *       name:  string,   // ex: 'Bell Cranel'
 *       role:  string,   // ex: 'Protagoniste'
 *       emoji: string,   // emoji représentatif du personnage
 *       bg:    string,   // couleur CSS de fond de la card personnage
 *     }
 *   ],
 *   seasons: [
 *     {
 *       label:         string,                 // ex: 'Saison 1 — 2014'
 *       sub:           string,                 // ex: '25 EP · VOSTFR'
 *       status:        'ongoing' | 'finished',
 *       current:       boolean,                // saison affichée par défaut
 *       episodesAired: number,
 *       episodes:      Episode[],              // épisodes de cette saison
 *     }
 *   ],
 *   // Si la série n'a pas de saisons (seasons: []) :
 *   episodes: Episode[],
 * }
 */
export async function getSerieById(id) {
  return api.get(`/series/${id}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée une nouvelle série (admin uniquement).
 *
 * POST /api/series
 * Authorization: Bearer <token>   (rôle admin requis)
 *
 * Corps : { ...champs Serie sans id }
 *   L'id (slug) peut être généré côté serveur à partir du titre,
 *   ou envoyé explicitement dans le corps.
 *
 * Réponse : Serie créée avec son id
 */
export async function createSerie(data) {
  return api.post('/series', data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour une série (admin uniquement).
 *
 * PATCH /api/series/:id
 * Authorization: Bearer <token>
 *
 * Corps : champs à modifier (envoi partiel accepté)
 *
 * Cas d'usage courant : masquer/afficher une série
 *   updateSerie('berserk-of-gluttony', { visible: true })
 *
 * Réponse : Serie mise à jour complète
 */
export async function updateSerie(id, data) {
  return api.patch(`/series/${id}`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supprime une série et tous ses épisodes (admin uniquement).
 *
 * DELETE /api/series/:id
 * Authorization: Bearer <token>
 *
 * Réponse : 204 No Content
 */
export async function deleteSerie(id) {
  return api.delete(`/series/${id}`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// ÉPISODES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère tous les épisodes d'une série (ou d'une saison précise).
 *
 * GET /api/series/:serieId/episodes
 * GET /api/series/:serieId/episodes?season=1
 *
 * Query params :
 *   ?season=1   index de saison 1-based (saison-1, saison-2, …)
 *               Si omis, retourne tous les épisodes de la série
 *
 * Réponse :
 * {
 *   data: Episode[],
 * }
 */
export async function getEpisodes(serieId, params = {}) {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/series/${serieId}/episodes${qs ? `?${qs}` : ''}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère un épisode précis.
 *
 * GET /api/series/:serieId/episodes/:epNum
 * GET /api/series/:serieId/episodes/:epNum?season=1
 *
 * Paramètres :
 *   serieId  slug de la série, ex: 'danmachi'
 *   epNum    numéro de l'épisode (entier)
 *   season   index de saison 1-based (optionnel — utile si les numéros d'épisode
 *            se répètent entre saisons, ex: Haikyu!! S1E01 vs S2E01)
 *
 * Réponse : Episode
 * {
 *   num:      number,
 *   title:    string,
 *   duration: string,             // ex: '~24 min'
 *   date:     string,             // ISO 8601 recommandé côté API
 *   langs:    ('vf' | 'vostfr')[],
 *   isNew:    boolean,
 *   visible:  boolean,            // true par défaut — false = masqué (mode admin)
 *   gradient: string,             // CSS gradient de la miniature
 *   sources: {
 *     vostfr?: {
 *       SD?:  string | null,      // URL ou chemin du fichier 480p/720p
 *       FHD?: string | null,      // URL ou chemin du fichier 1080p
 *       '4K'?: string | null,     // URL ou chemin du fichier 2160p
 *     },
 *     vf?: {
 *       SD?:  string | null,
 *       FHD?: string | null,
 *       '4K'?: string | null,
 *     },
 *   } | null,                     // null = sources pas encore disponibles
 * }
 *
 * Note sur les sources vidéo en production :
 *   Les URLs doivent être des HTTPS complets (CDN, S3, serveur dédié…).
 *   Si les fichiers sont privés, le backend doit générer des URLs signées
 *   (ex: AWS S3 presigned URL, valables 1h) à chaque appel.
 *   Le plugin Vite (vite.config.js) n'est utilisé QU'en développement local.
 */
export async function getEpisode(serieId, epNum, season = null) {
  const qs = season ? `?season=${season}` : ''
  return api.get(`/series/${serieId}/episodes/${epNum}${qs}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ajoute un épisode à une série (admin uniquement).
 *
 * POST /api/series/:serieId/episodes
 * Authorization: Bearer <token>
 *
 * Corps de la requête :
 * {
 *   num:      number,                   // numéro de l'épisode
 *   title:    string,
 *   duration: string,                   // ex: '~24 min'
 *   date:     string,                   // ISO 8601, ex: '2024-04-07'
 *   langs:    ('vf' | 'vostfr')[],
 *   isNew:    boolean,
 *   visible:  boolean,                  // true par défaut
 *   season:   number | null,            // index de saison 1-based, null si pas de saisons
 *   gradient: string,
 *   sources:  object | null,            // voir structure dans getEpisode()
 * }
 *
 * Réponse : Episode créé
 */
export async function createEpisode(serieId, data) {
  return api.post(`/series/${serieId}/episodes`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour un épisode (admin uniquement).
 *
 * PATCH /api/series/:serieId/episodes/:epNum
 * Authorization: Bearer <token>
 *
 * Corps : champs à modifier (partiel accepté)
 *
 * Cas d'usage — rendre un épisode visible :
 *   updateEpisode('danmachi', 13, { visible: true })
 *
 * Cas d'usage — ajouter une source vidéo :
 *   updateEpisode('danmachi', 1, {
 *     sources: { vostfr: { FHD: 'https://cdn.../danmachi-s01e01.mkv' } }
 *   })
 *
 * Réponse : Episode mis à jour
 */
export async function updateEpisode(serieId, epNum, data) {
  return api.patch(`/series/${serieId}/episodes/${epNum}`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supprime un épisode (admin uniquement).
 *
 * DELETE /api/series/:serieId/episodes/:epNum
 * Authorization: Bearer <token>
 *
 * Réponse : 204 No Content
 */
export async function deleteEpisode(serieId, epNum) {
  return api.delete(`/series/${serieId}/episodes/${epNum}`)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAISONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ajoute une saison à une série (admin uniquement).
 *
 * POST /api/series/:serieId/seasons
 * Authorization: Bearer <token>
 *
 * Corps :
 * {
 *   label:         string,                 // ex: 'Saison 2 — 2015'
 *   sub:           string,                 // ex: '25 EP · VOSTFR'
 *   status:        'ongoing' | 'finished',
 *   current:       boolean,               // true = saison affichée par défaut
 *   episodesAired: number,
 * }
 *
 * Réponse : { ...Season, index: number }
 *   index est le rang 1-based de la saison → correspond au slug 'saison-N' dans les URLs
 */
export async function createSeason(serieId, data) {
  return api.post(`/series/${serieId}/seasons`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour une saison (admin uniquement).
 *
 * PATCH /api/series/:serieId/seasons/:seasonIndex
 * Authorization: Bearer <token>
 *
 * seasonIndex : entier 1-based (1 = saison-1, 2 = saison-2, …)
 *
 * Corps : champs à modifier (partiel)
 *
 * Cas d'usage — marquer une saison comme terminée :
 *   updateSeason('haikyu', 1, { status: 'finished', current: false })
 */
export async function updateSeason(serieId, seasonIndex, data) {
  return api.patch(`/series/${serieId}/seasons/${seasonIndex}`, data)
}
