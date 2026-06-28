import { uuid } from '@/utils/uuid.js'

const LS_KEY     = 'fansub_uid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 an

function init() {
  let id = localStorage.getItem(LS_KEY)
  if (!id) {
    id = uuid()
    localStorage.setItem(LS_KEY, id)
  }
  // Cookie lisible par le backend sur chaque requête HTTP
  document.cookie = `${LS_KEY}=${id}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  return id
}

export const userId = init()
