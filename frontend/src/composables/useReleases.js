import { ref } from 'vue'
import { http } from '@/services/http.js'

const releases = ref([])
let fetchPromise = null
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

function ensureLoaded() {
  if (!fetchPromise) {
    fetchPromise = http.get('/releases?limit=200')
      .then(data => { releases.value = data })
      .catch(() => {})
  }
  return fetchPromise
}

export function useReleases() {
  const ready = ensureLoaded()

  function isSerieNew(serieId) {
    const now = Date.now()
    return releases.value.some(
      r => r.serieId === serieId && now - new Date(r.releasedAt).getTime() < SEVEN_DAYS_MS
    )
  }

  function newEpsForSerie(serieId, seasonSlug) {
    const now = Date.now()
    return new Set(
      releases.value
        .filter(r => r.serieId === serieId && r.seasonSlug === seasonSlug && now - new Date(r.releasedAt).getTime() < SEVEN_DAYS_MS)
        .map(r => r.epNum)
    )
  }

  // Appelé depuis ReleasesPage quand une nouvelle release arrive via socket
  function prependRelease(release) {
    const key = `${release.serieId}-${release.seasonSlug}-${release.epNum}`
    releases.value = releases.value.filter(
      r => `${r.serieId}-${r.seasonSlug}-${r.epNum}` !== key
    )
    releases.value.unshift(release)
  }

  return { releases, ready, isSerieNew, newEpsForSerie, prependRelease }
}
