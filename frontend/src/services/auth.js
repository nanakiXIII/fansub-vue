import { http } from './http.js'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const authService = {
  login:         (email, password)           => http.post('/auth/login',    { email, password }),
  register:      (username, email, password) => http.post('/auth/register', { username, email, password }),
  me:            ()                          => http.get('/auth/me'),
  updateProfile: (data)                      => http.patch('/auth/me', data),
  deleteAccount:  ()                          => http.delete('/auth/me'),
  checkUsername:  (username)                 => http.get(`/auth/check-username?username=${encodeURIComponent(username)}`),
  claimAdmin:    (token)                     => http.post('/auth/claim-admin', { token }),

  uploadAvatar: async (file) => {
    const form = new FormData()
    form.append('avatar', file)
    const token = localStorage.getItem('fansub_jwt')
    const res = await fetch(`${BASE}/auth/avatar`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
    return data
  },
}
