// src/api/client.js
// Client HTTP de base — toutes les fonctions API passent par ici.
//
// VITE_API_BASE_URL est défini dans .env (ex: http://localhost:8000/api)
// En production, pointe vers l'URL du vrai backend.
//
// Authentification :
//   Le backend peut utiliser un token JWT ou une session cookie.
//   - JWT     : stocker le token dans localStorage sous la clé 'fansub_token'
//               et l'envoyer dans le header Authorization: Bearer <token>
//   - Session : le navigateur gère le cookie automatiquement (credentials: 'include')

const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

function defaultHeaders() {
  const headers = { 'Content-Type': 'application/json' }

  // Décommente si le backend utilise des JWT :
  // const token = localStorage.getItem('fansub_token')
  // if (token) headers['Authorization'] = `Bearer ${token}`

  return headers
}

/**
 * Effectue un appel HTTP vers l'API.
 *
 * @param {string} path         - Chemin relatif, ex : '/series' ou '/series/danmachi'
 * @param {RequestInit} options - Options fetch (method, body, etc.)
 * @returns {Promise<any>}      - JSON parsé, ou null si réponse 204
 * @throws  {Error}             - Si le serveur renvoie un statut >= 400
 *                                L'erreur a les propriétés .status et .data
 */
export async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...defaultHeaders(), ...options.headers },
    // credentials: 'include', // Décommente pour les sessions cookie
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const err    = new Error(data?.message ?? `HTTP ${res.status}`)
    err.status   = res.status
    err.data     = data
    throw err
  }

  return data
}

// Raccourcis par méthode HTTP
export const api = {
  get:    (path)       => request(path, { method: 'GET' }),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
}
