import { ref } from 'vue'
import { authService } from '@/services/auth.js'
import { useSettings } from './useSettings.js'
import { userSync } from '@/services/userSync.js'
import { hydrateFromServer as hydrateFavorites, resetFavorites, useFavorites } from './useFavorites.js'
import { hydrateFromServer as hydrateProgress,  resetProgress,  useProgress  } from './useProgress.js'
import { hydrateFromServer as hydrateDownloads, resetDownloads, useDownloads } from './useDownloads.js'
import { useAchievementToast } from './useAchievementToast.js'
import { useSocket } from './useSocket.js'
import { http } from '@/services/http.js'

const JWT_KEY     = 'fansub_jwt'
const REFRESH_KEY = 'fansub_refresh'
const authUser = ref(null)
let initialized = false

function syncSettings(user, settings) {
  settings.uid         = user.id
  settings.username    = user.username
  settings.isAdmin     = user.isAdmin
  settings.avatar      = user.avatar ?? null
  settings.role        = user.role ?? null
  settings.roleLabel   = user.roleLabel ?? null
  settings.roleColor   = user.roleColor ?? null
  settings.activeTitle = user.activeTitle ?? null
  settings.permissions = user.permissions ?? []
  settings.emailVerified = user.emailVerified ?? true
}

// Envoie la progression/favoris/téléchargements anonymes (accumulés avant inscription) vers le
// compte qui vient d'être créé. Sans ça, le fetchAndHydrate() qui suit écraserait ces données
// locales avec l'état (vide) du nouveau compte côté serveur.
async function pushLocalDataToServer() {
  const { favorites }              = useFavorites()
  const { store: progressStore }   = useProgress()
  const { dlHistory }              = useDownloads()

  const tasks = []

  for (const serieId of favorites.value) {
    tasks.push(userSync.addFavorite(serieId).catch(() => {}))
  }

  for (const serieId in progressStore) {
    for (const seasonSlug in progressStore[serieId]) {
      for (const epNum in progressStore[serieId][seasonSlug]) {
        const pct = progressStore[serieId][seasonSlug][epNum]
        tasks.push(userSync.updateProgress(serieId, seasonSlug, Number(epNum), pct).catch(() => {}))
      }
    }
  }

  for (const dl of dlHistory.value) {
    tasks.push(userSync.addDownload(dl.serieId, dl.seasonSlug, dl.epNum, dl.quality, dl.lang).catch(() => {}))
  }

  await Promise.all(tasks)
}

async function fetchAndHydrate() {
  try {
    const data = await userSync.fetchAll()
    hydrateFavorites(data.favorites)
    hydrateProgress(data.progress)
    hydrateDownloads(data.downloads)
  } catch (err) {
    console.error('[fetchAndHydrate]', err)
  }
}

async function checkAchievements() {
  try {
    const { newlyUnlocked } = await http.post('/achievements/check', {})
    if (newlyUnlocked?.length) {
      const { showAll } = useAchievementToast()
      showAll(newlyUnlocked)
    }
  } catch {}
}

export function useAuth() {
  const settings = useSettings()

  async function init() {
    if (initialized) return
    initialized = true
    const token = localStorage.getItem(JWT_KEY)
    if (!token) return
    try {
      const user = await authService.me()
      authUser.value = user
      syncSettings(user, settings)
      fetchAndHydrate()
      checkAchievements()
      useSocket().connect(localStorage.getItem(JWT_KEY))
    } catch {
      localStorage.removeItem(JWT_KEY)
      settings.uid     = null
      settings.isAdmin = false
      settings.avatar  = null
    }
  }

  async function login(email, password) {
    const { token, refreshToken, user } = await authService.login(email, password)
    localStorage.setItem(JWT_KEY, token)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    authUser.value = user
    syncSettings(user, settings)
    fetchAndHydrate()
    checkAchievements()
    useSocket().connect(token)
    return user
  }

  async function register(username, email, password) {
    const { token, refreshToken, user } = await authService.register(username, email, password)
    localStorage.setItem(JWT_KEY, token)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    authUser.value = user
    syncSettings(user, settings)
    await pushLocalDataToServer()
    fetchAndHydrate()
    checkAchievements()
    useSocket().connect(token)
    return user
  }

  async function loginWithToken(token, refreshToken) {
    localStorage.setItem(JWT_KEY, token)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    try {
      const user = await authService.me()
      authUser.value = user
      syncSettings(user, settings)
      fetchAndHydrate()
      checkAchievements()
      useSocket().connect(token)
    } catch {
      localStorage.removeItem(JWT_KEY)
      localStorage.removeItem(REFRESH_KEY)
    }
  }

  function logout() {
    localStorage.removeItem(JWT_KEY)
    localStorage.removeItem(REFRESH_KEY)
    authUser.value       = null
    settings.uid         = null
    settings.username    = null
    settings.isAdmin     = false
    settings.avatar      = null
    settings.role        = null
    settings.roleLabel   = null
    settings.roleColor   = null
    settings.activeTitle = null
    settings.permissions = []
    settings.emailVerified = true
    resetFavorites()
    resetProgress()
    resetDownloads()
    useSocket().disconnect()
  }

  return { user: authUser, init, login, register, logout, loginWithToken }
}
