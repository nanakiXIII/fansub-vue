import { reactive, ref } from 'vue'
import { useSettings } from './useSettings.js'
import { userSync } from '@/services/userSync.js'

const LS_KEY        = 'fansub_downloads'
const HISTORY_LIMIT = 50

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') }
  catch { return {} }
}

function persist(store, history) {
  localStorage.setItem(LS_KEY, JSON.stringify({ store, history }))
}

const initial       = load()
// Compat ancien format plat ({ serieId: { seasonSlug: { epNum: true } } })
const store         = reactive(initial.store ?? initial)
const dlHistory     = ref(initial.history ?? [])   // [{ serieId, seasonSlug, epNum, at }]

export function hydrateFromServer({ store: serverStore, history: serverHistory }) {
  Object.keys(store).forEach(k => delete store[k])
  Object.assign(store, serverStore)
  dlHistory.value = serverHistory
  persist(store, dlHistory.value)
}

export function resetDownloads() {
  Object.keys(store).forEach(k => delete store[k])
  dlHistory.value = []
  persist({}, [])
}

function markDownloaded(serieId, seasonSlug, epNum, quality = null, lang = null) {
  if (!store[serieId])             store[serieId]             = {}
  if (!store[serieId][seasonSlug]) store[serieId][seasonSlug] = {}
  const now = Date.now()
  store[serieId][seasonSlug][epNum] = now

  // Historique : déplace en tête, cap à HISTORY_LIMIT
  const entries = dlHistory.value.filter(
    h => !(h.serieId === serieId && h.seasonSlug === seasonSlug && h.epNum === epNum)
  )
  entries.unshift({ serieId, seasonSlug, epNum, at: now, quality, lang })
  dlHistory.value = entries.slice(0, HISTORY_LIMIT)

  persist(store, dlHistory.value)

  const settings = useSettings()
  if (settings.uid) userSync.addDownload(serieId, seasonSlug, epNum, quality, lang).catch(console.error)
}

export function useDownloads() {
  return { store, dlHistory, markDownloaded }
}
