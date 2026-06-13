// src/api/auth.js
// Authentification et gestion du compte utilisateur.
//
// Actuellement, l'app utilise un profil 100% local (pseudo + UUID dans localStorage).
// Ce fichier documente les appels nécessaires pour migrer vers un vrai compte serveur.
//
// Flux de migration :
//   1. L'utilisateur a un profil local (settings.uid + settings.username)
//   2. Il crée un compte → POST /api/auth/register avec son uid local comme clé de migration
//   3. Le serveur associe ses données (progression, téléchargements) à son nouveau compte
//   4. Le token JWT retourné est stocké dans localStorage sous 'fansub_token'
//   5. Les appels suivants incluent ce token → les données sont désormais côté serveur

import { api } from './client.js'

// ═══════════════════════════════════════════════════════════════════════════════
// INSCRIPTION / CONNEXION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crée un compte utilisateur.
 *
 * POST /api/auth/register
 *
 * Corps de la requête :
 * {
 *   username:  string,         // pseudo choisi par l'utilisateur (3-24 chars, [a-zA-Z0-9_])
 *   email:     string,         // adresse email (unique côté serveur)
 *   password:  string,         // mot de passe (min 8 chars recommandé)
 *   localUid:  string | null,  // UUID local (settings.uid) pour migrer les données locales
 *                              // Le serveur peut importer la progression/téléchargements
 *                              // associés à cet uid depuis la BDD ou les accepter en payload
 * }
 *
 * Réponse attendue :
 * {
 *   user: {
 *     id:       string,   // UUID serveur (différent du uid local)
 *     username: string,
 *     email:    string,
 *     role:     'user' | 'admin',
 *     createdAt: string,  // ISO 8601
 *   },
 *   token: string,        // JWT à stocker dans localStorage 'fansub_token'
 * }
 *
 * Erreurs possibles :
 *   409 Conflict  → email ou username déjà pris
 *   422           → validation échouée (format email, longueur pseudo…)
 */
export async function register({ username, email, password, localUid }) {
  return api.post('/auth/register', { username, email, password, localUid })
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Connecte un utilisateur existant.
 *
 * POST /api/auth/login
 *
 * Corps :
 * {
 *   email:    string,
 *   password: string,
 * }
 *
 * Réponse :
 * {
 *   user:  User,    // voir structure dans register()
 *   token: string,  // JWT
 * }
 *
 * Erreurs possibles :
 *   401 → identifiants invalides
 */
export async function login({ email, password }) {
  return api.post('/auth/login', { email, password })
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Déconnecte l'utilisateur (invalide le token côté serveur si blacklist JWT ou session).
 *
 * POST /api/auth/logout
 * Authorization: Bearer <token>
 *
 * Réponse : 204 No Content
 *
 * Côté front, supprimer aussi localStorage.removeItem('fansub_token')
 */
export async function logout() {
  return api.post('/auth/logout')
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFIL UTILISATEUR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère le profil de l'utilisateur connecté.
 *
 * GET /api/me
 * Authorization: Bearer <token>
 *
 * Réponse :
 * {
 *   id:        string,
 *   username:  string,
 *   email:     string,
 *   role:      'user' | 'admin',
 *   createdAt: string,
 *   settings: {
 *     streaming:     boolean,
 *     catalogueView: 'grid' | 'list',
 *     // les préférences sont maintenant stockées côté serveur, plus dans localStorage
 *   },
 * }
 */
export async function getMe() {
  return api.get('/me')
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Met à jour le profil de l'utilisateur connecté.
 *
 * PATCH /api/me
 * Authorization: Bearer <token>
 *
 * Corps (partiel) :
 * {
 *   username?: string,   // nouveau pseudo (validation identique à register)
 *   email?:    string,   // nouvel email (peut nécessiter une confirmation par mail)
 *   settings?: object,   // préférences à synchroniser
 * }
 *
 * Réponse : User mis à jour
 *
 * Erreurs possibles :
 *   409 → username ou email déjà pris
 */
export async function updateMe(data) {
  return api.patch('/me', data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Change le mot de passe de l'utilisateur connecté.
 *
 * POST /api/me/change-password
 * Authorization: Bearer <token>
 *
 * Corps :
 * {
 *   currentPassword: string,
 *   newPassword:     string,  // min 8 chars recommandé
 * }
 *
 * Réponse : 204 No Content
 *
 * Erreurs possibles :
 *   401 → currentPassword incorrect
 */
export async function changePassword({ currentPassword, newPassword }) {
  return api.post('/me/change-password', { currentPassword, newPassword })
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supprime définitivement le compte et toutes ses données.
 *
 * DELETE /api/me
 * Authorization: Bearer <token>
 *
 * Corps (optionnel) :
 * {
 *   password: string,  // confirmation du mot de passe avant suppression
 * }
 *
 * Réponse : 204 No Content
 *
 * Côté front, après cet appel :
 *   - Supprimer le token : localStorage.removeItem('fansub_token')
 *   - Supprimer les données locales (comme deleteAllData() dans ProfilePage)
 *   - Rediriger vers l'accueil
 */
export async function deleteAccount(password) {
  return api.delete('/me', { body: JSON.stringify({ password }) })
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESSION (synchronisation avec le serveur)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Synchronise la progression de lecture d'un épisode vers le serveur.
 * Remplace / complète le stockage local dans le cookie 'fansub_progress'.
 *
 * POST /api/me/progress
 * Authorization: Bearer <token>
 *
 * Corps :
 * {
 *   serieId:    string,  // ex: 'danmachi'
 *   seasonSlug: string,  // ex: 'saison-1' (ou 'saison-1' si pas de saisons)
 *   epNum:      number,
 *   pct:        number,  // pourcentage de progression (0-100)
 *   at:         number,  // timestamp Unix (ms) de la dernière lecture
 * }
 *
 * Réponse : 204 No Content
 */
export async function syncProgress(data) {
  return api.post('/me/progress', data)
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Récupère toute la progression de l'utilisateur depuis le serveur.
 * Permet de restaurer l'historique sur un nouvel appareil.
 *
 * GET /api/me/progress
 * Authorization: Bearer <token>
 *
 * Réponse :
 * {
 *   [serieId]: {
 *     [seasonSlug]: {
 *       [epNum]: number  // pourcentage 0-100
 *     }
 *   }
 * }
 *
 * Ce format est identique à ce que useProgress() stocke dans le cookie,
 * ce qui facilite la fusion local/serveur.
 */
export async function getProgress() {
  return api.get('/me/progress')
}
