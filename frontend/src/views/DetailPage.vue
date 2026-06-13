<template>
  <div v-if="loading" class="flex items-center justify-center min-h-[380px]">
    <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else-if="serie && (serie.visible !== false || settings.isAdmin || settings.permissions?.includes('content.preview'))">
    <!-- Bandeau série non visible (admin uniquement) -->
    <div v-if="serie.visible === false" class="flex items-center gap-3 bg-red-950/60 border-b border-red-500/30 px-6 py-3">
      <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
      <span class="text-[12px] font-semibold text-red-400">Série non visible</span>
      <span class="text-[11px] text-red-400/70">— Cette série n'est pas publiée et n'est visible que par les administrateurs.</span>
    </div>

    <!-- HERO BANNER -->
    <div class="relative min-h-[380px] flex items-end overflow-hidden">
      <img loading="lazy" :src="serie.banner" :alt="serie.titleFull" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0" :style="{ background: serie.gradient, opacity: overlayAlpha }"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, rgb(var(--color-bg-0) / 0.88) 38%, transparent 85%)"></div>

      <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-7 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
        <!-- Poster -->
        <div class="w-24 sm:w-36 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border-2 border-white/10 relative">
          <img loading="lazy" :src="serie.poster" :alt="serie.titleFull" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 mix-blend-multiply" :style="{ background: serie.gradient, opacity: overlayAlpha }"></div>
        </div>

        <!-- Info -->
        <div class="flex-1 pb-1 min-w-0">
          <!-- Breadcrumb -->
          <div class="flex items-center gap-1.5 text-[11px] text-ink-3 mb-2 flex-wrap">
            <RouterLink to="/catalogue" class="text-ink-2 hover:text-orange transition-colors">Catalogue</RouterLink>
            <span>›</span>
            <span v-for="g in serie.genres.slice(0,1)" :key="g" class="text-ink-2">{{ g }}</span>
            <span>›</span>
            <span>{{ serie.titleFull }}</span>
          </div>

          <h1 class="text-[20px] sm:text-[28px] font-extrabold text-white leading-tight mb-1">{{ serie.titleFull }}</h1>
          <p class="text-[12px] text-ink-2 mb-3">{{ serie.titleJp }} — {{ serie.season }}</p>

          <!-- Meta -->
          <div class="flex items-center gap-3 flex-wrap text-[12px] text-ink-2 mb-3">
            <span class="flex items-center gap-1 text-[17px] font-extrabold text-orange">
              ⭐ {{ serie.score }}
              <span class="text-[11px] font-normal text-ink-2">/ 10</span>
            </span>
            <span class="text-ink-3">·</span>
            <span>{{ serie.year }}</span>
            <span class="text-ink-3">·</span>
            <span>{{ displayedEpisodes.length }} épisodes</span>
            <span class="text-ink-3">·</span>
            <span>{{ serie.duration || '~24 min' }}/EP</span>
            <span class="text-ink-3">·</span>
            <span>{{ serie.studio }}</span>
          </div>

          <!-- Badges -->
          <div class="flex gap-1.5 flex-wrap mb-4">
            <span v-if="isSerieNew(serie.id)" class="badge badge-new">NEW</span>
            <span v-if="serie.isSimulcast" class="badge badge-simulcast">En cours</span>
            <span v-if="serie.status === 'licensed'" class="badge badge-licensed">Licencié</span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 flex-wrap">
            <!-- Streaming activé -->
            <RouterLink
              v-if="nextAction && settings.streaming && serie.status !== 'licensed'"
              :to="getEpPath(nextAction.ep)"
              class="btn-primary gap-2 text-[13px]"
            >
              <svg v-if="nextAction.type === 'rewatch'" class="w-4 h-4 shrink-0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/>
              </svg>
              <svg v-else class="w-4 h-4 fill-white shrink-0" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
              {{ nextAction.label }}
            </RouterLink>
            <!-- Streaming désactivé → ancre vers l'épisode -->
            <button
              v-else-if="nextAction && !settings.streaming && serie.status !== 'licensed'"
              @click="scrollToEpisode(nextAction.ep.num)"
              class="btn-primary gap-2 text-[13px]"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="21" x2="19" y2="21"/>
              </svg>
              Télécharger EP {{ nextAction.ep.num }}
            </button>
            <button
              @click="handleToggleFavorite(serie.id)"
              class="gap-2 text-[13px] transition-all"
              :class="isFavorite(serie.id) ? 'btn-primary' : 'btn-ghost'"
              :title="isFavorite(serie.id) && settings.uid ? 'Dans votre liste — vous recevez des notifications' : 'Ajouter à ma liste'"
            >
              <svg
                class="w-4 h-4 transition-all"
                :class="isFavorite(serie.id) ? 'fill-white stroke-white' : 'fill-none stroke-current'"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {{ isFavorite(serie.id) ? 'Dans ma liste' : 'Ma liste' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN LAYOUT -->
    <div class="max-w-6xl mx-auto px-6 pt-5 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">

      <!-- LEFT COLUMN -->
      <div>
        <!-- Synopsis -->
        <div class="mb-5">
          <div class="section-title mb-3">Synopsis</div>
          <p class="text-[13px] leading-relaxed text-ink-2">{{ serie.synopsis }}</p>
        </div>

        <!-- Tabs -->
        <div id="episodes" class="flex border-b border-white/[0.07] mb-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="text-[12px] font-semibold px-4 py-2.5 border-b-2 transition-colors"
            :class="activeTab === tab.key
              ? 'text-white border-orange'
              : 'text-ink-3 border-transparent hover:text-ink-1'"
            @click="activeTab = tab.key"
          >{{ tab.label }}</button>
        </div>

        <!-- TAB: EPISODES -->
        <div v-if="activeTab === 'episodes'">

          <!-- Série licenciée -->
          <div v-if="serie.status === 'licensed'" class="flex flex-col items-center gap-4 py-12 px-4 text-center">
            <div class="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <svg class="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div>
              <p class="text-[15px] font-bold text-white mb-1">Série licenciée officiellement</p>
              <p v-if="serie.licensedBy" class="text-[13px] text-ink-2 mb-1">
                Licenciée par <span class="text-purple-400 font-semibold">{{ serie.licensedBy }}</span>
              </p>
              <p class="text-[12px] text-ink-3 max-w-sm mx-auto leading-relaxed">
                Les épisodes fansub ne sont plus disponibles. Tu peux regarder cette série légalement sur la plateforme officielle.
              </p>
            </div>
          </div>

          <!-- Liste des épisodes normale -->
          <template v-else>
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <select
                v-if="serie.seasons.length"
                v-model="selectedSeason"
                class="text-[11px] font-medium font-sans bg-bg-2 text-ink-1 border border-white/[0.07] rounded-md py-1.5 pl-2 pr-6 outline-none cursor-pointer appearance-none"
                style="background-image:url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%275%27%3E%3Cpath%20d=%27M0%200l4%205%204-5z%27%20fill=%27%235a5a72%27/%3E%3C/svg%3E);background-repeat:no-repeat;background-position:right 6px center;"
              >
                <option v-for="s in visibleSeasons" :key="s.label" :value="s">{{ s.label }}{{ s.visible === false ? ' 🔒' : '' }}</option>
              </select>
            </div>

            <EpisodeList
              :episodes="displayedEpisodes"
              :serie-id="serie.id"
              :season-slug="selectedSeasonIdx >= 0 ? `saison-${selectedSeasonIdx + 1}` : 'saison-1'"
              :get-ep-path="getEpPath"
              :progress-map="progressMap"
            />
          </template>
        </div>

        <!-- TAB: CHARACTERS -->
        <div v-if="activeTab === 'characters'">
          <div v-if="serie.characters.length" class="grid gap-2" style="grid-template-columns: repeat(auto-fill, minmax(110px, 1fr))">
            <div v-for="c in serie.characters" :key="c.name"
                 class="bg-bg-1 border border-white/[0.06] rounded-lg overflow-hidden text-center">
              <div class="aspect-square flex items-center justify-center text-3xl"
                   :style="{ background: `linear-gradient(135deg, ${c.bg}, rgb(var(--color-bg-0)))` }">
                {{ c.emoji }}
              </div>
              <div class="text-[11px] font-semibold text-ink-1 px-1 pt-1.5 pb-0.5">{{ c.name }}</div>
              <div class="text-[10px] text-ink-3 pb-2">{{ c.role }}</div>
            </div>
          </div>
          <div v-else class="text-[13px] text-ink-3 py-8 text-center">
            Aucun personnage renseigné.
          </div>
        </div>

        <!-- TAB: COMMENTS -->
        <div v-show="activeTab === 'comments'">
          <CommentSection
            :serie-id="serie.id"
            placeholder="Partage ton avis sur cette série…"
            @update:count="commentCount = $event"
          />
        </div>
      </div>

      <!-- SIDEBAR -->
      <aside>
        <!-- Informations -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">Informations</div>
          <div class="px-3 py-1.5">
            <div class="info-row"><span class="info-label">Studio</span><span class="info-value">{{ serie.studio }}</span></div>
            <div class="info-row"><span class="info-label">Diffusion</span><span class="info-value">{{ serie.broadcast ?? '—' }}</span></div>
            <div class="info-row"><span class="info-label">Saison</span><span class="info-value">{{ serie.seasonLabel ?? serie.year }}</span></div>
            <div class="info-row"><span class="info-label">Épisodes</span><span class="info-value">{{ displayedEpisodes.length }} / {{ activeEp }}</span></div>
            <div class="info-row"><span class="info-label">Durée</span><span class="info-value">{{ serie.duration || '~24 min' }}</span></div>
            <div class="info-row">
              <span class="info-label">Statut</span>
              <span class="info-value" :class="serie.status === 'ongoing' ? 'text-orange' : 'text-ink-2'">
                {{ serie.status === 'ongoing' ? '● En cours' : serie.status === 'completed' ? '✓ Terminé' : serie.status === 'licensed' ? '⚖ Licencié' : serie.status === 'dropped' ? '✗ Abandonné' : '⏳ À venir' }}
              </span>
            </div>
            <div class="info-row"><span class="info-label">Source</span><span class="info-value">{{ serie.source ?? '—' }}</span></div>
            <div class="info-row">
              <span class="info-label">Genres</span>
              <div class="flex gap-1 flex-wrap justify-end">
                <span v-for="g in serie.genres" :key="g" class="text-[9px] bg-bg-3 text-ink-2 rounded px-1.5 py-[1px]">{{ g }}</span>
              </div>
            </div>
            <div v-if="serie.staff" class="info-row"><span class="info-label">Traducteur(s)</span><span class="info-value text-orange text-[10px]">{{ serie.staff.translator }}</span></div>
            <div v-if="serie.staff" class="info-row"><span class="info-label">Correcteur</span><span class="info-value text-orange text-[10px]">{{ serie.staff.proofreader }}</span></div>
          </div>
        </div>

        <!-- Autres saisons -->
        <div v-if="serie.seasons.length" class="sidebar-card">
          <div class="sidebar-card-header">Saisons</div>
          <div class="p-2">
            <div
              v-for="s in visibleSeasons"
              :key="s.label"
              class="flex items-center gap-2 rounded-md px-2.5 py-2 mb-1 cursor-pointer last:mb-0 transition-colors"
              :class="[
                selectedSeason === s ? 'bg-orange/10 border border-orange/30' : 'bg-bg-2 hover:bg-bg-3',
                s.visible === false ? 'opacity-50 grayscale' : ''
              ]"
              @click="selectedSeason = s; activeTab = 'episodes'"
            >
              <div class="flex-1">
                <div class="text-[11px] font-semibold" :class="selectedSeason === s ? 'text-white' : 'text-ink-1'">{{ s.label }}</div>
                <div class="text-[10px] text-ink-3">{{ s.sub }}</div>
              </div>
              <span :class="s.status === 'ongoing' ? 'badge badge-ongoing' : s.status === 'licensed' ? 'badge badge-licensed' : 'badge badge-fin'">
                {{ s.status === 'ongoing' ? 'En cours' : s.status === 'licensed' ? 'Licencié' : 'Terminé' }}
              </span>
            </div>
          </div>
        </div>

      </aside>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <AppMascot :size="130" class="mb-4 opacity-90"/>
    <h2 class="text-xl font-bold text-white mb-2">Série introuvable</h2>
    <p class="text-ink-2 mb-6">Cette série n'existe pas dans notre catalogue.</p>
    <RouterLink to="/catalogue" class="btn-primary">Retour au catalogue</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/services/http.js'
import AppMascot from '@/components/AppMascot.vue'
import CommentSection from '@/components/CommentSection.vue'
import { useReleases } from '@/composables/useReleases.js'

const { isSerieNew, newEpsForSerie } = useReleases()
import { overlayAlpha } from '@/composables/useImageOverlay.js'
import { config } from '@/config.js'
import { useFavorites } from '@/composables/useFavorites.js'
import EpisodeList from '@/components/EpisodeList.vue'
import { useProgress } from '@/composables/useProgress.js'
import { useDownloads } from '@/composables/useDownloads.js'
import { useSettings } from '@/composables/useSettings.js'
import { useFollows } from '@/composables/useFollows.js'

const route   = useRoute()
const serie   = ref(null)
const loading = ref(true)
const { isFavorite, toggleFavorite } = useFavorites()
const { toggleFollow } = useFollows()

function handleToggleFavorite(serieId) {
  toggleFavorite(serieId)
  // Sync le suivi (notifications) avec les favoris, uniquement si connecté
  if (settings.uid) toggleFollow(serieId)
}

const activeTab      = ref('episodes')
const settings       = useSettings()
const selectedSeason = ref(null)

onMounted(async () => {
  try {
    const data = await http.get(`/series/${route.params.id}`)
    // normalise titleJP → titleJp pour compat template
    serie.value = data ? { ...data, titleJp: data.titleJP } : null
  } finally {
    loading.value = false

    // Sélectionne la saison depuis ?season=slug avant de scroller
    if (route.query.season && serie.value?.seasons?.length) {
      const target = serie.value.seasons.find(s => s.slug === route.query.season)
      if (target) selectedSeason.value = target
    }

    if (route.hash === '#episodes') {
      activeTab.value = 'episodes'
      nextTick(() => document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' }))
    } else if (route.hash.startsWith('#episode-')) {
      const num = parseInt(route.hash.replace('#episode-', ''))
      if (!isNaN(num)) scrollToEpisode(num)
    }
  }
})

watch(serie, (s) => {
  if (s) selectedSeason.value = s.seasons?.find(s => s.current) ?? s.seasons?.[0] ?? null
})

function scrollToEpisode(num) {
  activeTab.value = 'episodes'
  // nextTick + délai pour laisser Vue re-render la saison sélectionnée
  nextTick(() => setTimeout(() => document.getElementById(`episode-${num}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150))
}

watchEffect(() => {
  document.title = serie.value
    ? `${serie.value.titleFull} — ${config.siteName}`
    : config.siteName
})

const newEpisodeNums = computed(() => {
  if (!serie.value) return new Set()
  const slug = selectedSeasonIdx.value >= 0 ? `saison-${selectedSeasonIdx.value + 1}` : 'saison-1'
  return newEpsForSerie(serie.value.id, slug)
})

// Épisodes de la saison sélectionnée, ou fallback sur serie.episodes pour les séries
// qui n'utilisent pas de saisons dans leurs données.
const displayedEpisodes = computed(() => {
  const eps = selectedSeason.value?.episodes?.length
    ? selectedSeason.value.episodes
    : (serie.value?.episodes ?? [])
  const canPreview = settings.isAdmin || settings.permissions?.includes('content.preview')
  const visible = canPreview ? eps : eps.filter(e => e.visible !== false)
  return visible.map(ep => ({ ...ep, isNew: newEpisodeNums.value.has(ep.num) }))
})

const visibleSeasons = computed(() =>
  settings.isAdmin
    ? (serie.value?.seasons ?? [])
    : (serie.value?.seasons ?? []).filter(s => s.visible !== false)
)

const activeEp = computed(() =>
  selectedSeason.value?.episodesAired ?? serie.value?.episodesAired
)

const selectedSeasonIdx = computed(() =>
  serie.value?.seasons?.findIndex(s => s.label === selectedSeason.value?.label) ?? -1
)

function getDownloadUrl(ep) {
  if (!ep?.sources) return null
  const lang = Object.keys(ep.sources)[0]
  if (!lang) return null
  const qual = Object.keys(ep.sources[lang]).find(q => ep.sources[lang][q] != null)
  return qual ? ep.sources[lang][qual] : null
}

const nextAction = computed(() => {
  const eps = displayedEpisodes.value
  if (!eps.length || !serie.value) return null
  const serieId = serie.value.id
  const slug = selectedSeasonIdx.value >= 0 ? `saison-${selectedSeasonIdx.value + 1}` : 'saison-1'
  const isDone = ep => {
    const pct = progressMap.value[ep.num] ?? 0
    if (pct >= 90) return true
    return !!downloadStore[serieId]?.[slug]?.[ep.num]
  }
  // Épisode en cours — seulement si le streaming est activé
  if (settings.streaming) {
    const inProgress = eps.find(ep => {
      const pct = progressMap.value[ep.num] ?? 0
      return pct > 0 && pct < 90
    })
    if (inProgress) return { ep: inProgress, type: 'resume', label: `Reprendre EP ${inProgress.num}` }
  }
  // Premier épisode non vu et non téléchargé
  const unwatched = eps.find(ep => !isDone(ep))
  if (unwatched) return { ep: unwatched, type: 'watch', label: `Regarder EP ${unwatched.num}` }
  // Tout vu/téléchargé → revoir depuis le début
  return { ep: eps[0], type: 'rewatch', label: `Revoir EP ${eps[0].num}` }
})

const { store: progressStore } = useProgress()
const { store: downloadStore } = useDownloads()
const progressMap = computed(() => {
  if (!serie.value) return {}
  const slug = selectedSeasonIdx.value >= 0 ? `saison-${selectedSeasonIdx.value + 1}` : 'saison-1'
  return progressStore[serie.value.id]?.[slug] ?? {}
})

function getEpPath(ep) {
  const slug = selectedSeasonIdx.value >= 0 ? `saison-${selectedSeasonIdx.value + 1}` : 'saison-1'
  return `/watch/${serie.value.id}/${slug}/episode-${ep.num}`
}

const commentCount = ref(null)

const tabs = computed(() => [
  { key: 'episodes',   label: 'Épisodes'      },
  { key: 'characters', label: 'Personnages'   },
  { key: 'comments',   label: commentCount.value !== null ? `Commentaires (${commentCount.value})` : 'Commentaires' },
])
</script>

