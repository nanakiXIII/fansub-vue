import { http } from './http.js'

export const homeService = {
  fetch: (isAdmin = false) => http.get(`/home${isAdmin ? '?admin=1' : ''}`),
}
