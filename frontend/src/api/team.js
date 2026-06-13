// src/api/team.js
// Remplace les données statiques de src/data/team.js une fois le backend prêt.

import { api } from './client.js'

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBRES DE L'ÉQUIPE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère tous les membres de l'équipe.
 *
 * GET /api/team
 *
 * Query params optionnels :
 *   ?department=Traduction   filtre par département
 *                            Valeurs : 'Direction' | 'Traduction' | 'Édition' | 'Communauté'
 *
 * Réponse attendue :
 * {
 *   data: Member[],
 * }
 *
 * Structure d'un Member :
 * {
 *   id:             string,    // slug unique, ex: 'kitsune-sub'
 *   name:           string,    // pseudo affiché
 *   role:           string,    // ex: 'Traductrice JP → FR'
 *   department:     string,    // 'Direction' | 'Traduction' | 'Édition' | 'Communauté'
 *   initials:       string,    // 2 lettres pour l'avatar, ex: 'KS'
 *   avatarGradient: string,    // CSS gradient de l'avatar
 *   joined:         string,    // année d'arrivée, ex: '2021'
 *   bio:            string,    // courte biographie
 *   tags:           string[],  // compétences affichées comme badges
 *   avatar:         string | undefined, // URL photo de profil (optionnel)
 * }
 */
export async function getTeam(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return api.get(`/team${qs ? `?${qs}` : ''}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère un membre par son slug.
 *
 * GET /api/team/:id
 *
 * Réponse : Member (voir structure dans getTeam)
 */
export async function getMemberById(id) {
  return api.get(`/team/${id}`)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crée un membre (admin uniquement).
 *
 * POST /api/team
 * Authorization: Bearer <token>
 *
 * Corps : { ...champs Member sans id }
 *   L'id peut être généré côté serveur depuis le name.
 *
 * Réponse : Member créé avec son id
 */
export async function createMember(data) {
  return api.post('/team', data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour un membre (admin uniquement).
 *
 * PATCH /api/team/:id
 * Authorization: Bearer <token>
 *
 * Corps : champs à modifier (partiel)
 *
 * Réponse : Member mis à jour
 */
export async function updateMember(id, data) {
  return api.patch(`/team/${id}`, data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supprime un membre (admin uniquement).
 *
 * DELETE /api/team/:id
 * Authorization: Bearer <token>
 *
 * Réponse : 204 No Content
 */
export async function deleteMember(id) {
  return api.delete(`/team/${id}`)
}
