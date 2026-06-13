// src/api/news.js
// Remplace les données statiques de src/data/news.js une fois le backend prêt.

import { api } from './client.js'

// ═══════════════════════════════════════════════════════════════════════════════
// ACTUALITÉS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère toutes les actualités, les plus récentes en premier.
 *
 * GET /api/news
 *
 * Query params optionnels :
 *   ?category=Sortie   filtre par catégorie
 *                      Valeurs : 'Sortie' | 'Recrutement' | 'Annonce' | 'Site' | 'Communauté'
 *   ?page=1&limit=10   pagination
 *
 * Réponse attendue :
 * {
 *   data:  News[],
 *   total: number,
 *   page:  number,
 *   limit: number,
 * }
 *
 * Structure d'une News :
 * {
 *   id:          number,           // identifiant unique
 *   category:    string,           // 'Sortie' | 'Recrutement' | 'Annonce' | 'Site' | 'Communauté'
 *   icon:        string,           // emoji affiché sur la card (ex: '🎬')
 *   gradient:    string,           // CSS gradient de fond de la card
 *   thumb:       string,           // CSS gradient de la miniature (liste)
 *   title:       string,
 *   excerpt:     string,           // résumé court (2 lignes max) pour la card
 *   date:        string,           // date lisible OU ISO 8601 (le front formate)
 *   author:      string,           // ex: "L'équipe traduction"
 *   content:     string[],         // tableau de paragraphes pour la page détail
 *   serieId:     string | null,    // slug de la série liée (affiche un lien)
 *   episodeNums: number[],         // numéros des épisodes mentionnés
 * }
 */
export async function getNews(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/news${qs ? `?${qs}` : ''}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère une actualité par son id.
 *
 * GET /api/news/:id
 *
 * Réponse : News (voir structure dans getNews)
 */
export async function getNewsById(id) {
  return api.get(`/news/${id}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée une actualité (admin uniquement).
 *
 * POST /api/news
 * Authorization: Bearer <token>
 *
 * Corps : { ...champs News sans id }
 *   date peut être omis → le serveur utilise l'heure courante
 *
 * Réponse : News créée avec son id
 */
export async function createNews(data) {
  return api.post('/news', data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour une actualité (admin uniquement).
 *
 * PATCH /api/news/:id
 * Authorization: Bearer <token>
 *
 * Corps : champs à modifier (partiel)
 *
 * Réponse : News mise à jour
 */
export async function updateNews(id, data) {
  return api.patch(`/news/${id}`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supprime une actualité (admin uniquement).
 *
 * DELETE /api/news/:id
 * Authorization: Bearer <token>
 *
 * Réponse : 204 No Content
 */
export async function deleteNews(id) {
  return api.delete(`/news/${id}`)
}
