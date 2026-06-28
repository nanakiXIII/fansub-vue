<template>
  <div>
    <!-- Hero bar -->
    <div :class="layout === 'gundam'
      ? 'cat-hero-g'
      : 'bg-bg-1 border-b border-white/[0.07] py-5 px-6'">
      <template v-if="layout === 'gundam'">
        <div class="cat-hero-eyebrow">// MODULE · CATALOGUE COMPLET</div>
        <h1 class="cat-hero-title">Catalogue</h1>
        <p class="cat-hero-sub">{{ filteredSeries.length }} séries sous-titrées disponibles</p>
      </template>
      <template v-else>
        <h1 class="text-2xl font-extrabold text-white mb-1">Catalogue complet</h1>
        <p class="text-[13px] text-ink-2">Toutes nos séries sous-titrées, à portée de clic</p>
      </template>
    </div>

    <!-- Sticky filters -->
    <div :class="layout === 'gundam'
      ? 'sticky top-[59px] z-40 cat-filters-g'
      : 'sticky top-14 z-40 bg-bg-1 border-b border-white/[0.07]'">
      <!-- Ligne 1 : recherche + statut + tri + vue -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04]">
        <!-- Search -->
        <div class="relative flex-1 max-w-xs">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Rechercher une série…"
            class="w-full bg-bg-2 border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/40 transition-colors"
          />
        </div>

        <div class="h-5 w-px bg-white/[0.07] shrink-0"></div>

        <!-- Statut -->
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[10px] font-semibold text-ink-3 uppercase tracking-wide">Statut</span>
          <select
            v-model="activeFilters.status"
            class="text-[11px] font-medium font-sans bg-bg-2 text-ink-1 border border-white/[0.07] rounded-md py-1 pl-2 pr-6 outline-none cursor-pointer appearance-none"
            style="background-image:url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%275%27%3E%3Cpath%20d=%27M0%200l4%205%204-5z%27%20fill=%27%235a5a72%27/%3E%3C/svg%3E);background-repeat:no-repeat;background-position:right 6px center;"
          >
            <option value="all">Tous</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminé</option>
            <option value="licensed">Licencié</option>
          </select>
        </div>

        <!-- Trier -->
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[10px] font-semibold text-ink-3 uppercase tracking-wide">Trier</span>
          <select
            v-model="activeFilters.sort"
            class="text-[11px] font-medium font-sans bg-bg-2 text-ink-1 border border-white/[0.07] rounded-md py-1 pl-2 pr-6 outline-none cursor-pointer appearance-none"
            style="background-image:url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%275%27%3E%3Cpath%20d=%27M0%200l4%205%204-5z%27%20fill=%27%235a5a72%27/%3E%3C/svg%3E);background-repeat:no-repeat;background-position:right 6px center;"
          >
            <option value="popularity">Popularité</option>
            <option value="score">Note</option>
            <option value="alpha">A → Z</option>
          </select>
        </div>

        <div class="h-5 w-px bg-white/[0.07] shrink-0"></div>

        <!-- Vue grille / liste -->
        <div class="flex gap-1 shrink-0">
          <button
            v-for="mode in ['grid','list']"
            :key="mode"
            class="w-7 h-7 flex items-center justify-center rounded-md border transition-colors"
            :class="viewMode === mode ? 'bg-orange/15 border-orange' : 'bg-bg-2 border-white/[0.07]'"
            @click="viewMode = mode"
          >
            <svg v-if="mode === 'grid'" class="w-3.5 h-3.5" :class="viewMode === 'grid' ? 'text-orange' : 'text-ink-3'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <rect x="1" y="1" width="5" height="5" rx="1"/><rect x="9" y="1" width="5" height="5" rx="1"/>
              <rect x="1" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
            </svg>
            <svg v-else class="w-3.5 h-3.5" :class="viewMode === 'list' ? 'text-orange' : 'text-ink-3'" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <line x1="5" y1="4" x2="15" y2="4"/><line x1="5" y1="8" x2="15" y2="8"/><line x1="5" y1="12" x2="15" y2="12"/>
              <circle cx="2" cy="4" r="1" fill="currentColor"/><circle cx="2" cy="8" r="1" fill="currentColor"/><circle cx="2" cy="12" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Ligne 2 : genre pills -->
      <div class="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none">
        <span
          v-for="genre in genres"
          :key="genre"
          class="tag shrink-0"
          :class="{ active: activeGenre === genre }"
          @click="activeGenre = genre"
        >{{ genre }}</span>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="max-w-6xl mx-auto px-6">
      <!-- Results count -->
      <div class="py-2 mb-1">
        <span class="text-[12px] text-ink-2">
          <strong class="text-white">{{ filteredSeries.length }}</strong> séries trouvées
        </span>
      </div>

      <!-- GRID VIEW -->
      <div v-if="viewMode === 'grid'"
           class="grid gap-3"
           style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))">
        <div v-for="s in pagedSeries" :key="s.id" :class="s.visible === false ? 'opacity-50 grayscale' : ''">
          <AnimeCard :serie="s" />
        </div>
      </div>

      <!-- LIST VIEW -->
      <div v-else class="flex flex-col pb-4" :class="layout === 'gundam' ? 'gap-1.5' : 'gap-2'">
        <div
          v-for="s in pagedSeries"
          :key="s.id"
          class="flex items-center gap-3 overflow-hidden cursor-pointer transition-all"
          :class="[
            s.visible === false ? 'opacity-50 grayscale' : '',
            layout === 'gundam'
              ? 'bg-orange/[0.02] border border-orange/10 border-l-[3px] border-l-orange/25 hover:bg-orange/[0.05] hover:border-orange/25 hover:border-l-orange'
              : 'bg-bg-1 border border-white/[0.06] rounded-xl hover:border-white/20 hover:translate-x-0.5'
          ]"
          @click="router.push(`/serie/${s.id}`)"
        >
          <!-- Thumb -->
          <div class="w-12 sm:w-16 shrink-0 self-stretch relative overflow-hidden">
            <img loading="lazy" :src="s.poster" :alt="s.titleFull" class="absolute inset-0 w-full h-full object-cover" />
            <div class="absolute inset-0 mix-blend-multiply" :style="{ background: s.gradient, opacity: overlayAlpha }"></div>
          </div>
          <!-- Body -->
          <div class="flex-1 py-3 pr-4 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-bold text-white mb-1 truncate">{{ s.titleFull }}</div>
              <div class="text-[11px] text-ink-2 flex gap-2 flex-wrap items-center mb-2" :class="layout === 'gundam' && 'font-mono'">
                <span>{{ s.year }}</span>
                <span class="text-ink-3">·</span>
                <span>{{ s.episodes.length || s.seasons?.reduce((t, x) => t + (x.episodes?.length ?? 0), 0) }} EP</span>
                <template v-if="s.duration">
                  <span class="text-ink-3">·</span>
                  <span>{{ s.duration }}/EP</span>
                </template>
              </div>
              <div class="flex gap-1.5 flex-wrap mb-1.5">
                <span v-if="isSerieNew(s.id)" class="badge badge-new">NEW</span>
                <span v-if="s.isSimulcast || s.status === 'ongoing'" class="badge badge-simulcast">En cours</span>
                <span v-if="s.status === 'licensed'" class="badge badge-licensed">Licencié</span>
              </div>
              <div class="flex gap-1.5 flex-wrap">
                <span v-for="g in s.genres" :key="g" class="tag text-[9px] py-0.5 px-1.5">{{ g }}</span>
              </div>
            </div>
            <!-- Score + Actions -->
            <div class="flex items-center gap-3 sm:shrink-0">
              <!-- Score -->
              <div class="text-center shrink-0">
                <div class="text-[20px] font-extrabold text-orange leading-none" :class="layout === 'gundam' && 'font-mono'">{{ s.score }}</div>
                <div class="text-[9px] font-semibold text-ink-3 uppercase tracking-wide mt-0.5" :class="layout === 'gundam' && 'font-mono'">Note</div>
              </div>
              <!-- Actions -->
              <div class="flex flex-col gap-1.5 shrink-0">
                <template v-if="getNextAction(s)">
                  <RouterLink
                    v-if="settings.streaming"
                    :to="getNextAction(s).url"
                    class="btn-primary text-[11px] py-1.5 px-3 gap-1.5"
                    @click.stop
                  >
                    <svg v-if="getNextAction(s).type === 'rewatch'" class="w-3 h-3 shrink-0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/></svg>
                    <svg v-else class="w-3 h-3 fill-white shrink-0" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
                    {{ getNextAction(s).label }}
                  </RouterLink>
                  <RouterLink
                    v-else
                    :to="`/serie/${s.id}#episode-${getNextAction(s).ep.num}`"
                    class="btn-primary text-[11px] py-1.5 px-3 gap-1.5"
                    @click.stop
                  >
                    <svg class="w-3 h-3 shrink-0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="21" x2="19" y2="21"/></svg>
                    Télécharger EP {{ getNextAction(s).ep.num }}
                  </RouterLink>
                </template>
                <button
                  class="btn-outline text-[11px] py-1.5 px-3 gap-1.5"
                  :class="isFavorite(s.id) ? 'border-orange/40 text-orange' : ''"
                  @click.stop="toggleFavorite(s.id)"
                >
                  <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                    <path v-if="isFavorite(s.id)" d="M20 6L9 17l-5-5" stroke-width="2.5"/>
                    <template v-else><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></template>
                  </svg>
                  {{ isFavorite(s.id) ? 'Dans ma liste' : 'Ma liste' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charger plus -->
      <div v-if="visibleCount < filteredSeries.length" class="flex justify-center py-6">
        <button class="btn-outline text-[12px] py-2 px-5" @click="visibleCount += PAGE_SIZE">
          Charger plus ({{ filteredSeries.length - visibleCount }} restantes)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AnimeCard from '@/components/AnimeCard.vue'
import { http } from '@/services/http.js'
import { overlayAlpha } from '@/composables/useImageOverlay.js'
import { useProgress } from '@/composables/useProgress.js'
import { useDownloads } from '@/composables/useDownloads.js'
import { useFavorites } from '@/composables/useFavorites.js'
import { useSettings } from '@/composables/useSettings.js'
import { useSocket } from '@/composables/useSocket.js'
import { useReleases } from '@/composables/useReleases.js'
import { layout } from '@/composables/useTheme.js'

const { isSerieNew } = useReleases()
const { socket } = useSocket()
const router      = useRouter()
const settings    = useSettings()
const viewMode    = ref(settings.catalogueView)
const activeGenre = ref('Tous les genres')

const allSeriesData = ref([])
const loading       = ref(true)

function onNewSeries(serie) {
  if (!settings.isAdmin && !settings.permissions?.includes('content.preview') && serie.visible === false) return
  allSeriesData.value = allSeriesData.value.filter(s => s.id !== serie.id)
  allSeriesData.value.unshift(serie)
}

onMounted(async () => {
  try {
    allSeriesData.value = await http.get('/series')
  } finally {
    loading.value = false
  }
  socket.on('new:series', onNewSeries)
})

onUnmounted(() => {
  socket.off('new:series', onNewSeries)
})

const { store: progressStore } = useProgress()
const { store: downloadStore } = useDownloads()
const { isFavorite, toggleFavorite } = useFavorites()

function isEpDone(serieId, seasonSlug, epNum) {
  const pct = progressStore[serieId]?.[seasonSlug]?.[epNum] ?? 0
  if (pct >= 90) return true
  return !!downloadStore[serieId]?.[seasonSlug]?.[epNum]
}

function getDownloadUrl(ep) {
  if (!ep?.sources) return null
  const lang = Object.keys(ep.sources)[0]
  if (!lang) return null
  const qual = Object.keys(ep.sources[lang]).find(q => ep.sources[lang][q] != null)
  return qual ? ep.sources[lang][qual] : null
}

function getNextAction(serie) {
  // Collecte tous les épisodes avec leur saison slug, dans l'ordre
  const allEps = []
  if (serie.episodes?.length) {
    serie.episodes.forEach(ep => allEps.push({ ep, seasonSlug: 'saison-1' }))
  } else {
    serie.seasons?.forEach((season, idx) => {
      season.episodes?.forEach(ep => allEps.push({ ep, seasonSlug: `saison-${idx + 1}` }))
    })
  }
  if (!allEps.length) return null
  // Épisode en cours — seulement si le streaming est activé
  if (settings.streaming) {
    const inProgress = allEps.find(({ ep, seasonSlug }) => {
      const pct = progressStore[serie.id]?.[seasonSlug]?.[ep.num] ?? 0
      return pct > 0 && pct < 90
    })
    if (inProgress) return {
      ep: inProgress.ep,
      url: `/watch/${serie.id}/${inProgress.seasonSlug}/episode-${inProgress.ep.num}`,
      type: 'resume', label: `Reprendre EP ${inProgress.ep.num}`,
    }
  }
  // Premier épisode non vu (ni streamé ≥90%, ni téléchargé)
  const unwatched = allEps.find(({ ep, seasonSlug }) =>
    !isEpDone(serie.id, seasonSlug, ep.num)
  )
  if (unwatched) return {
    ep: unwatched.ep,
    url: `/watch/${serie.id}/${unwatched.seasonSlug}/episode-${unwatched.ep.num}`,
    type: 'watch', label: `Regarder EP ${unwatched.ep.num}`,
  }
  // Tout vu
  const first = allEps[0]
  return {
    ep: first.ep,
    url: `/watch/${serie.id}/${first.seasonSlug}/episode-${first.ep.num}`,
    type: 'rewatch', label: `Revoir EP ${first.ep.num}`,
  }
}

const genres = computed(() => {
  const set = new Set()
  allSeriesData.value.forEach(s => (s.genres ?? []).forEach(g => set.add(g)))
  return ['Tous les genres', ...[...set].sort((a, b) => a.localeCompare(b, 'fr'))]
})

const search       = ref('')
const activeFilters = ref({
  status: 'all',
  sort:   'popularity',
})

// Affichage progressif : évite de monter des centaines de cartes d'un coup
// quand le catalogue grandit. Recommence à zéro à chaque changement de filtre.
const PAGE_SIZE = 60
const visibleCount = ref(PAGE_SIZE)
watch([search, activeGenre, activeFilters, viewMode], () => { visibleCount.value = PAGE_SIZE }, { deep: true })

const filteredSeries = computed(() => {
  const canPreview = settings.isAdmin || settings.permissions?.includes('content.preview')
  let list = canPreview
    ? [...allSeriesData.value]
    : allSeriesData.value.filter(s => s.visible !== false)

  // Search filter
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.titleFull?.toLowerCase().includes(q) ||
      s.titleJP?.toLowerCase().includes(q)
    )
  }
  // Genre filter
  if (activeGenre.value !== 'Tous les genres') {
    const g = activeGenre.value.toLowerCase()
    list = list.filter(s => (s.genres ?? []).some(x => x.toLowerCase() === g))
  }
  // Status filter
  if (activeFilters.value.status !== 'all') {
    list = list.filter(s => s.status === activeFilters.value.status)
  }
  // Sort
  if (activeFilters.value.sort === 'score') {
    list.sort((a, b) => b.score - a.score)
  } else if (activeFilters.value.sort === 'alpha') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  }

  return list
})

const pagedSeries = computed(() => filteredSeries.value.slice(0, visibleCount.value))
</script>
