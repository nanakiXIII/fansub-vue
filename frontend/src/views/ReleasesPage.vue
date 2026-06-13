<template>
  <div class="max-w-4xl mx-auto px-6 py-8">

    <!-- Bandeau nouvelle sortie temps réel -->
    <Transition name="release-banner">
      <RouterLink
        v-if="newReleaseBanner"
        :to="`/serie/${newReleaseBanner.serieId}?season=${newReleaseBanner.seasonSlug}#episode-${newReleaseBanner.epNum}`"
        class="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors"
        @click="newReleaseBanner = null"
      >
        <span class="flex items-center gap-1.5 text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-[11px] font-bold uppercase tracking-wide">Nouveau</span>
        </span>
        <span class="text-[12px] text-white font-semibold truncate flex-1">
          {{ newReleaseBanner.serie?.title }} — EP {{ newReleaseBanner.epNum }}
        </span>
        <button @click.prevent="newReleaseBanner = null" class="text-ink-3 hover:text-white ml-2 text-[14px]">×</button>
      </RouterLink>
    </Transition>

    <!-- En-tête -->
    <div class="mb-6">
      <h1 class="text-[22px] font-extrabold text-white leading-tight">Dernières sorties</h1>
      <p class="text-[12px] text-ink-3 mt-0.5">{{ resolvedReleases.length }} épisodes mis en ligne</p>
    </div>

    <!-- Groupes par date -->
    <template v-if="!loading">
    <div v-for="group in groupedReleases" :key="group.label" class="mb-6">
      <div class="text-[11px] font-bold text-ink-3 uppercase tracking-widest mb-2 px-1">
        {{ group.label }}
      </div>

      <div class="sidebar-card overflow-hidden">
        <RouterLink
          v-for="item in group.items"
          :key="`${item.serieId}-${item.seasonSlug}-${item.epNum}`"
          :to="`/serie/${item.serieId}?season=${item.seasonSlug}#episode-${item.epNum}`"
          class="flex items-center gap-3 px-3 py-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors group"
        >
          <!-- Miniature -->
          <div class="w-20 h-12 rounded-lg shrink-0 overflow-hidden relative">
            <img loading="lazy" :src="item.serie.poster" :alt="item.serie.title" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0" :style="{ background: item.serie.gradient, opacity: 0.45 }"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <svg class="w-4 h-4 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
            </div>
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="text-[12px] font-bold text-white truncate mb-0.5">{{ item.serie.title }}</div>
            <div class="text-[11px] text-ink-2 truncate">
              EP {{ item.epNum }}
              <span v-if="item.episode?.title && item.episode.title !== `Épisode ${item.epNum}`">
                — {{ item.episode.title }}
              </span>
            </div>
            <div class="text-[10px] text-ink-3 mt-0.5">{{ item.episode?.duration }}</div>
          </div>

          <!-- Qualité + date -->
          <div class="flex flex-col items-end gap-1.5 shrink-0">
            <div class="flex items-center gap-1">
              <span v-if="item.isNew" class="badge badge-new">NEW</span>
              <span class="text-[9px] font-bold bg-bg-3 text-ink-2 rounded px-1.5 py-px">{{ item.quality }}</span>
            </div>
            <span class="text-[10px] text-ink-3">{{ item.dateLabel }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
    </template>

    <!-- Chargement -->
    <div v-if="loading" class="text-center py-16 text-ink-3 text-[13px]">Chargement…</div>

    <!-- Vide -->
    <div v-else-if="!groupedReleases.length" class="text-center py-16 text-ink-3 text-[13px]">
      Aucune sortie disponible.
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { http } from '@/services/http.js'
import { useSocket } from '@/composables/useSocket.js'
import { useReleases } from '@/composables/useReleases.js'
import { config } from '@/config.js'

document.title = `Dernières sorties — ${config.siteName}`

const { socket } = useSocket()
const { prependRelease } = useReleases()
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// Données locales à la page — toujours fraîches au montage
const apiReleases = ref([])
const seriesMap   = ref({})
const loading     = ref(true)
const newReleaseBanner = ref(null)
let bannerTimer = null

function resolveRelease(r) {
  const serie = seriesMap.value[r.serieId]
  if (!serie) return null
  // Cherche la saison par slug, puis par index fallback
  const season = serie.seasons?.find(s => s.slug === r.seasonSlug)
    ?? serie.seasons?.[parseInt(r.seasonSlug.replace('saison-', '')) - 1]
  const eps     = season?.episodes ?? serie.episodes ?? []
  const episode = eps.find(e => e.num === r.epNum) ?? null
  const _ts     = new Date(r.releasedAt).getTime()
  return { ...r, serie, episode, _ts, isNew: Date.now() - _ts < SEVEN_DAYS_MS }
}

const resolvedReleases = computed(() =>
  apiReleases.value
    .map(resolveRelease)
    .filter(Boolean)
    .sort((a, b) => b._ts - a._ts)
)

async function loadData() {
  try {
    // Toujours fetcher les données fraîches depuis l'API
    const [seriesData, releasesData] = await Promise.all([
      http.get('/series'),
      http.get('/releases?limit=200'),
    ])
    seriesMap.value  = Object.fromEntries(seriesData.map(s => [s.id, s]))
    apiReleases.value = releasesData
  } catch (err) {
    console.error('[ReleasesPage]', err)
  } finally {
    loading.value = false
  }
}

function onNewRelease(release) {
  // Met à jour le cache partagé (pour isSerieNew dans AnimeCard etc.)
  prependRelease(release)
  // Met à jour la liste locale de la page
  const key = `${release.serieId}-${release.seasonSlug}-${release.epNum}`
  apiReleases.value = apiReleases.value.filter(
    r => `${r.serieId}-${r.seasonSlug}-${r.epNum}` !== key
  )
  apiReleases.value.unshift(release)
  const resolved = resolveRelease(release)
  newReleaseBanner.value = resolved
  clearTimeout(bannerTimer)
  bannerTimer = setTimeout(() => { newReleaseBanner.value = null }, 8000)
}

onMounted(() => {
  loadData()
  socket.on('new:release', onNewRelease)
})
onUnmounted(() => {
  socket.off('new:release', onNewRelease)
  clearTimeout(bannerTimer)
})

function groupLabel(ts) {
  const now      = new Date()
  const itemDate = new Date(ts)
  const diffDays = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    - Date.UTC(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())) / 86400000)
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays <= 6)  return `Il y a ${diffDays} jours`
  if (diffDays <= 13) return 'Il y a 1 semaine'
  if (diffDays <= 20) return 'Il y a 2 semaines'
  return 'Plus ancien'
}

function dateLabel(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Paris' })
}

function timeLabel(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
}

const groupedReleases = computed(() => {
  const map = new Map()
  for (const item of resolvedReleases.value) {
    const label = groupLabel(item._ts)
    if (!map.has(label)) map.set(label, [])
    map.get(label).push({ ...item, timeLabel: timeLabel(item._ts), dateLabel: dateLabel(item._ts) })
  }
  return [...map.entries()].map(([label, items]) => ({ label, items }))
})
</script>

<style scoped>
.release-banner-enter-active { animation: bannerIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.release-banner-leave-active { animation: bannerOut 0.2s ease-in forwards; }
@keyframes bannerIn  { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes bannerOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-6px); } }
</style>
