import { ref, computed } from 'vue'
import { useProgress } from './useProgress.js'
import { http } from '@/services/http.js'

// Cache partagé entre toutes les pages — on ne recharge le catalogue qu'une fois.
const allSeries = ref([])
let fetched = false

async function ensureSeriesLoaded() {
  if (fetched) return
  fetched = true
  try { allSeries.value = await http.get('/series') } catch { fetched = false }
}

function resolveEpisode(serie, seasonSlug, epNum) {
  const sIdx   = parseInt(seasonSlug?.replace('saison-', '')) - 1
  const season = serie.seasons?.[sIdx] ?? null
  const eps    = season?.episodes ?? serie.episodes ?? []
  return eps.find(e => e.num === epNum) ?? null
}

// Épisodes en cours de visionnage (ni jamais commencés, ni terminés), un seul par série.
export function useContinueWatching(limit = 6) {
  const { store: progressStore, watchHistory } = useProgress()
  ensureSeriesLoaded()

  const items = computed(() => {
    const seen   = new Set()
    const result = []
    for (const h of watchHistory.value) {
      if (seen.has(h.serieId)) continue
      const serie = allSeries.value.find(s => s.id === h.serieId)
      if (!serie) continue
      const episode = resolveEpisode(serie, h.seasonSlug, h.epNum)
      if (!episode || episode.visible === false) continue
      const pct = progressStore[h.serieId]?.[h.seasonSlug]?.[h.epNum] ?? 0
      if (pct >= 95) continue
      seen.add(h.serieId)
      result.push({
        serieId: h.serieId, seasonSlug: h.seasonSlug, epNum: h.epNum, pct,
        serie, episode,
        url: `/watch/${h.serieId}/${h.seasonSlug}/episode-${h.epNum}`,
      })
      if (result.length >= limit) break
    }
    return result
  })

  return { items }
}
