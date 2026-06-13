import { reactive, ref } from 'vue'
import { userId } from './useUserId.js'
import { useSettings } from './useSettings.js'
import { userSync } from '@/services/userSync.js'

const COOKIE_NAME    = 'fansub_progress'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 an
const HISTORY_LIMIT  = 50

function readCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  try {
    const parsed = match ? JSON.parse(decodeURIComponent(match[1])) : {}
    return {
      progress: parsed.progress ?? parsed, // compat ancien format plat
      history:  parsed.history  ?? [],
    }
  } catch {
    return { progress: {}, history: [] }
  }
}

function writeCookie(progress, history) {
  const payload = { uid: userId, progress, history }
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

const initial        = readCookie()
const store          = reactive(initial.progress)
const watchHistory   = ref(initial.history)   // [{ serieId, seasonSlug, epNum, at }]

export function hydrateFromServer({ progress, history }) {
  Object.keys(store).forEach(k => delete store[k])
  Object.assign(store, progress)
  watchHistory.value = history
  writeCookie(store, watchHistory.value)
}

export function resetProgress() {
  Object.keys(store).forEach(k => delete store[k])
  watchHistory.value = []
  writeCookie({}, [])
}

function saveProgress(serieId, seasonSlug, epNum, percentage) {
  if (!store[serieId])             store[serieId]             = {}
  if (!store[serieId][seasonSlug]) store[serieId][seasonSlug] = {}
  store[serieId][seasonSlug][epNum] = Math.round(Math.min(100, percentage))

  // Historique : déplace l'entrée en tête, cap à HISTORY_LIMIT
  const entries = watchHistory.value.filter(
    h => !(h.serieId === serieId && h.seasonSlug === seasonSlug && h.epNum === epNum)
  )
  entries.unshift({ serieId, seasonSlug, epNum, at: Date.now() })
  watchHistory.value = entries.slice(0, HISTORY_LIMIT)

  writeCookie(store, watchHistory.value)

  const settings = useSettings()
  if (settings.uid) userSync.updateProgress(serieId, seasonSlug, epNum, store[serieId][seasonSlug][epNum]).catch(console.error)
}

function clearHistory() {
  watchHistory.value = []
  writeCookie(store, [])

  const settings = useSettings()
  if (settings.uid) userSync.clearHistory().catch(console.error)
}

export function useProgress() {
  return { store, watchHistory, saveProgress, clearHistory }
}
