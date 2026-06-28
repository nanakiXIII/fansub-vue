import { useToast } from '@/composables/useToast.js'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const TOAST_SKIP = new Set([400, 401, 403, 404, 409, 422])

function getToken()        { return localStorage.getItem('fansub_jwt') }
function getRefreshToken() { return localStorage.getItem('fansub_refresh') }

let refreshInFlight = null

async function tryRefresh() {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const rt = getRefreshToken()
    if (!rt) return false
    try {
      const res = await fetch(BASE + '/auth/refresh', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken: rt }),
      })
      if (!res.ok) throw new Error('refresh failed')
      const { token } = await res.json()
      localStorage.setItem('fansub_jwt', token)
      return true
    } catch {
      localStorage.removeItem('fansub_jwt')
      localStorage.removeItem('fansub_refresh')
      window.dispatchEvent(new Event('auth:logout'))
      return false
    }
  })()
  refreshInFlight.finally(() => { refreshInFlight = null })
  return refreshInFlight
}

async function request(method, path, body, _retry = false) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data.error
      || (Array.isArray(data.errors) && data.errors[0]?.msg)
      || `Erreur ${res.status}`

    // 401 → essaie le refresh une seule fois
    if (res.status === 401 && !_retry) {
      const ok = await tryRefresh()
      if (ok) return request(method, path, body, true)
    }

    const err = new Error(message)
    err.status = res.status
    err.data   = data

    // Toast uniquement pour les erreurs serveur non anticipées
    if (!TOAST_SKIP.has(res.status)) {
      useToast().error(message)
    }

    throw err
  }

  return data
}

export const http = {
  get:    (path)       => request('GET',    path),
  post:   (path, body) => request('POST',   path, body),
  patch:  (path, body) => request('PATCH',  path, body),
  put:    (path, body) => request('PUT',    path, body),
  delete: (path)       => request('DELETE', path),
}
