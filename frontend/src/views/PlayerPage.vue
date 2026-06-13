<template>
  <div v-if="serie && episode">

    <!-- BARRE DE NAVIGATION -->
    <div class="sticky top-14 z-30 bg-bg-0/95 backdrop-blur border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2 text-[12px]">
      <RouterLink
        :to="`/serie/${serie.id}`"
        class="flex items-center gap-1.5 text-ink-2 hover:text-orange transition-colors shrink-0"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {{ serie.titleFull }}
      </RouterLink>
      <span class="text-ink-3">›</span>
      <span class="text-ink-1 font-semibold truncate">EP {{ episode.num }} — {{ episode.title }}</span>
    </div>

    <!-- LAYOUT PRINCIPAL -->
    <div class="max-w-[1440px] mx-auto px-4 pt-5 pb-10 grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

      <!-- COLONNE GAUCHE : lecteur + contrôles + infos -->
      <div>

        <!-- VIDEO PLAYER -->
        <div
          ref="playerContainer"
          class="bg-bg-0 rounded-2xl overflow-hidden aspect-video relative shadow-2xl ring-1 ring-white/[0.07] group/player"
          @mousemove="resetHideTimer"
          @mouseleave="isPlaying && (showControls = false)"
        >
          <!-- Vidéo -->
          <video
            v-if="currentSrc"
            ref="videoEl"
            :key="currentSrc"
            :src="currentSrc"
            crossorigin="anonymous"
            class="w-full h-full object-contain cursor-pointer"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @play="isPlaying = true"
            @pause="onVideoPause"
            @ended="onVideoEnded"
            @click="togglePlay"
          >
            <track v-if="episode?.subUrl" kind="subtitles" :src="episode.subUrl" srclang="fr" label="Français" default />
          </video>

          <!-- Bouton play central (pause) -->
          <Transition name="dropdown">
            <div
              v-if="currentSrc && !isPlaying"
              class="absolute inset-0 flex items-center justify-center cursor-pointer group/playbtn"
              @click="togglePlay"
            >
              <div class="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/20 transition-all duration-200 group-hover/playbtn:bg-orange/20 group-hover/playbtn:ring-orange/50">
                <svg class="w-9 h-9 text-white/80 translate-x-0.5 transition-colors duration-200 group-hover/playbtn:text-orange" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              </div>
            </div>
          </Transition>

          <!-- Placeholder : aucune source disponible -->
          <div v-if="!currentSrc" class="absolute inset-0 flex flex-col items-center justify-center gap-4 select-none"
               :style="{ background: episode.gradient ?? 'rgb(var(--color-bg-1))' }">
            <div class="w-20 h-20 rounded-full bg-white/[0.06] flex items-center justify-center">
              <svg class="w-9 h-9 text-white/30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </div>
            <div class="text-center">
              <p class="text-[14px] font-semibold text-white/60 mb-1">Source indisponible</p>
              <p class="text-[12px] text-white/30">Connectez-vous ou revenez plus tard</p>
            </div>
          </div>

          <!-- Contrôles custom (auto-hide) -->
          <div
            v-if="currentSrc"
            class="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-12 select-none transition-opacity duration-300"
            style="background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)"
            :class="showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            @click.stop
          >
            <!-- Barre de progression -->
            <div
              ref="progressBarEl"
              class="relative py-2 mb-0.5 cursor-pointer group/prog"
              @mousedown="onProgressMousedown"
            >
              <div class="relative h-[2px] bg-bg-3 rounded overflow-visible">
                <div class="absolute inset-y-0 left-0 bg-white/20 rounded" :style="{ width: buffered + '%' }"></div>
                <div class="absolute inset-y-0 left-0 bg-orange rounded" :style="{ width: progress + '%' }"></div>
                <div
                  class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md pointer-events-none opacity-0 group-hover/prog:opacity-100 transition-opacity"
                  :style="{ left: progress + '%' }"
                ></div>
              </div>
            </div>

            <!-- Boutons -->
            <div class="flex items-center gap-1">

              <!-- Play / Pause -->
              <button @click="togglePlay" class="w-8 h-8 flex items-center justify-center text-white hover:text-orange transition-colors">
                <svg v-if="isPlaying" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              </button>

              <!-- Skip -10s -->
              <button @click="skip(-10)" title="-10s" class="w-7 h-7 flex items-center justify-center text-white/60 hover:text-orange transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/><text x="9.5" y="15.5" font-size="5.5" fill="currentColor" stroke="none" font-weight="700">10</text>
                </svg>
              </button>

              <!-- Skip +10s -->
              <button @click="skip(10)" title="+10s" class="w-7 h-7 flex items-center justify-center text-white/60 hover:text-orange transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/><text x="8" y="15.5" font-size="5.5" fill="currentColor" stroke="none" font-weight="700">10</text>
                </svg>
              </button>

              <!-- Temps -->
              <span class="text-[11px] text-white/70 font-mono tabular-nums ml-1">
                {{ formatTime(currentTime) }}<span class="text-white/30 mx-1">/</span>{{ formatTime(totalDuration) }}
              </span>

              <div class="flex-1"></div>

              <!-- Volume -->
              <div class="flex items-center gap-1.5">
                <button @click="toggleMute" class="w-7 h-7 flex items-center justify-center text-white/60 hover:text-orange transition-colors">
                  <svg v-if="isMuted || volume === 0" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                  <svg v-else-if="volume < 0.5" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                </button>
                <input
                  type="range" min="0" max="1" step="0.02"
                  :value="isMuted ? 0 : volume"
                  @input="e => { volume = parseFloat(e.target.value); isMuted = false }"
                  class="w-16 h-1 cursor-pointer rounded-full"
                  :style="{ accentColor: 'rgb(var(--color-orange))' }"
                >
              </div>

              <!-- Plein écran -->
              <button @click="toggleFullscreen" class="w-7 h-7 flex items-center justify-center text-white/60 hover:text-orange transition-colors ml-1">
                <svg v-if="!isFullscreen" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              </button>

            </div>
          </div>
        </div>

        <!-- QUALITÉ -->
        <div class="flex justify-end mt-3 gap-1.5">
          <button
            v-for="q in availableQualities"
            :key="q.label"
            @click="selectedQuality = q.label"
            class="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            :class="selectedQuality === q.label
              ? 'bg-orange text-white'
              : 'bg-bg-2 text-ink-2 hover:bg-bg-3 hover:text-ink-1'"
          >
            {{ q.label }}
          </button>
        </div>

        <!-- INFOS ÉPISODE -->
        <div class="mt-4 pb-5 border-b border-white/[0.06]">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 class="text-[20px] font-extrabold text-white leading-snug mb-1">
                EP {{ episode.num }} — {{ episode.title }}
              </h1>
              <div class="flex items-center gap-2 text-[12px] text-ink-2 flex-wrap">
                <span>{{ episode.duration }}</span>
                <span class="text-ink-3">·</span>
                <span>{{ episode.date }}</span>
                <span v-if="episode.isNew" class="badge badge-new">NEW</span>
              </div>
            </div>
            <RouterLink :to="`/serie/${serie.id}`" class="btn-ghost text-[12px] shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              Fiche série
            </RouterLink>
          </div>

          <!-- Progress bar si en cours -->
          <div v-if="episode.progress" class="mt-3 flex items-center gap-2">
            <div class="flex-1 h-[3px] bg-bg-3 rounded-full overflow-hidden">
              <div class="h-full bg-orange rounded-full" :style="{ width: episode.progress + '%' }"></div>
            </div>
            <span class="text-[10px] text-ink-3 shrink-0">{{ episode.progress }}%</span>
          </div>
        </div>

        <!-- NAVIGATION PREV / NEXT -->
        <div class="flex items-center justify-between gap-3 mt-4">
          <RouterLink
            v-if="prevEpisode"
            :to="`/watch/${serie.id}/saison-${playerSeasonIdx + 1}/episode-${prevEpisode.num}`"
            class="btn-ghost text-[12px] flex-1 justify-start max-w-[48%]"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span class="truncate">EP {{ prevEpisode.num }} — {{ prevEpisode.title }}</span>
          </RouterLink>
          <div v-else class="flex-1"></div>

          <RouterLink
            v-if="nextEpisode"
            :to="`/watch/${serie.id}/saison-${playerSeasonIdx + 1}/episode-${nextEpisode.num}`"
            class="btn-ghost text-[12px] flex-1 justify-end max-w-[48%]"
          >
            <span class="truncate">EP {{ nextEpisode.num }} — {{ nextEpisode.title }}</span>
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </RouterLink>
          <div v-else class="flex-1"></div>
        </div>
      </div>

      <!-- COLONNE DROITE : liste des épisodes -->
      <aside class="xl:sticky xl:top-[calc(3.5rem+4rem)]">
        <div class="section-title mb-3">
          Épisodes
          <span class="text-ink-3 font-normal text-[12px]">{{ serie.titleFull }}</span>
        </div>

        <div class="bg-bg-1 border border-white/[0.06] rounded-xl overflow-hidden">

          <!-- En-tête saison : visible uniquement si plusieurs saisons -->
          <div v-if="seasonOptions.length > 1" class="relative border-b border-white/[0.06]">
            <!-- Trigger -->
            <button
              @click.stop="showSeasonDropdown = !showSeasonDropdown"
              class="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
            >
              <div>
                <div class="text-[12px] font-semibold text-white leading-tight">{{ sidebarSeason?.label }}</div>
                <div class="text-[10px] text-ink-3 mt-0.5">
                  {{ sidebarEpisodes.length }} épisode{{ sidebarEpisodes.length > 1 ? 's' : '' }}
                  · {{ sidebarSeason?.sub?.split('·')[1]?.trim() ?? 'VOSTFR' }}
                </div>
              </div>
              <svg
                class="w-3.5 h-3.5 text-ink-3 shrink-0 transition-transform"
                :class="showSeasonDropdown ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"
              ><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            <!-- Dropdown panel -->
            <Transition name="dropdown">
              <div
                v-if="showSeasonDropdown"
                class="absolute left-0 right-0 top-full bg-bg-1 border border-white/[0.1] rounded-b-xl shadow-2xl z-50 p-1.5"
              >
                <button
                  v-for="s in seasonOptions"
                  :key="s.label"
                  @click.stop="sidebarSeason = s; showSeasonDropdown = false"
                  class="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left rounded-lg border transition-colors"
                  :class="[
                    sidebarSeason?.label === s.label
                      ? 'border-orange/50 bg-orange/[0.07] text-white'
                      : 'border-transparent hover:bg-white/[0.04] text-ink-1',
                    s.visible === false ? 'opacity-50 grayscale' : ''
                  ]"
                >
                  <span class="text-[12px] font-semibold">{{ s.label }}</span>
                  <span class="text-[10px]" :class="sidebarSeason?.label === s.label ? 'text-orange/70' : 'text-ink-3'">{{ s.sub }}</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- Liste des épisodes -->
          <div class="p-2 max-h-[calc(100vh-14rem)] overflow-y-auto">
            <EpisodeList
              :episodes="sidebarEpisodes"
              :active-ep="sidebarSeason?.label === playerSeason?.label ? episode.num : null"
              :serie-id="serie.id"
              :season-slug="sidebarSeasonIdx >= 0 ? `saison-${sidebarSeasonIdx + 1}` : 'saison-1'"
              :get-ep-path="(ep) => `/watch/${serie.id}/${sidebarSeasonIdx >= 0 ? `saison-${sidebarSeasonIdx + 1}` : route.params.season}/episode-${ep.num}`"
              :progress-map="sidebarProgressMap"
              compact
              navigable
            />
          </div>

        </div>
      </aside>
    </div>
  </div>

  <!-- Chargement -->
  <div v-else-if="loading" class="flex items-center justify-center min-h-[60vh]">
    <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
  </div>

  <!-- 404 -->
  <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div class="text-5xl mb-4">📺</div>
    <h2 class="text-xl font-bold text-white mb-2">Épisode introuvable</h2>
    <p class="text-ink-2 mb-6">Cet épisode n'existe pas ou n'est pas encore disponible.</p>
    <RouterLink :to="`/serie/${route.params.id}`" class="btn-primary">Retour à la série</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { http } from '@/services/http.js'
import { config } from '@/config.js'
import EpisodeList from '@/components/EpisodeList.vue'
import { useProgress } from '@/composables/useProgress.js'
import { useSettings } from '@/composables/useSettings.js'

const route = useRoute()
const router = useRouter()
const { store: progressStore, saveProgress } = useProgress()

const settings = useSettings()
const serie   = ref(null)
const loading = ref(true)

async function fetchSerie(id) {
  loading.value = true
  serie.value   = null
  try {
    serie.value = await http.get(`/series/${id}`)
  } catch {}
  loading.value = false
}

watch(() => route.params.id, id => { if (id) fetchSerie(id) })

const viewTracked = ref(false)
watch(() => [route.params.ep, route.params.season], () => { viewTracked.value = false })

async function trackView() {
  if (viewTracked.value || !serie.value || !episode.value) return
  viewTracked.value = true
  try {
    await http.post('/stats/view', {
      serieId:      serie.value.id,
      serieTitle:   serie.value.title,
      episodeNum:   episode.value.num,
      episodeTitle: episode.value.title ?? '',
      season:       route.params.season ?? '',
    })
  } catch {}
}

// Saisons disponibles (avec épisodes, et visibles selon le mode admin)
const seasonOptions = computed(() => {
  const all = serie.value?.seasons?.filter(s => s.episodes?.length) ?? []
  const canPreview = settings.isAdmin || settings.permissions?.includes('content.preview')
  return canPreview ? all : all.filter(s => s.visible !== false)
})

// Saison active : lit /saison-N/ dans l'URL ; fallback sur la première saison.
const playerSeason = computed(() => {
  const s = serie.value
  if (!s) return null
  if (s.episodes?.length) return null
  const seasons = seasonOptions.value
  const n = parseInt(route.params.season?.replace('saison-', ''))
  if (!isNaN(n) && seasons[n - 1]) return seasons[n - 1]
  return seasons[0] ?? null
})

const playerSeasonIdx = computed(() =>
  seasonOptions.value.findIndex(s => s.label === playerSeason.value?.label)
)

// Épisodes à utiliser dans le lecteur : saison courante ou serie.episodes
const playerEpisodes = computed(() =>
  playerSeason.value?.episodes ?? serie.value?.episodes ?? []
)

const episode = computed(() => {
  const num = parseInt(route.params.ep?.replace('episode-', ''))
  return playerEpisodes.value.find(e => e.num === num) ?? null
})

// Saison affichée dans la sidebar — suit playerSeason quand on change d'épisode
const sidebarSeason = ref(playerSeason.value)
watch(playerSeason, s => {
  if (s && s.label !== sidebarSeason.value?.label) sidebarSeason.value = s
})
// Quand l'utilisateur change de saison dans la sidebar, met à jour l'URL.
// Si l'épisode courant n'existe pas dans la nouvelle saison, va au premier épisode disponible.
watch(sidebarSeason, (s) => {
  const idx = seasonOptions.value.findIndex(o => o.label === s?.label)
  if (idx === -1) return
  const newSeasonSlug = `saison-${idx + 1}`
  if (newSeasonSlug === route.params.season) return
  const currentEpNum = parseInt(route.params.ep?.replace('episode-', ''))
  const epExists = s?.episodes?.some(e => e.num === currentEpNum)
  const epSlug = epExists ? route.params.ep : `episode-${s?.episodes?.[0]?.num ?? 1}`
  router.push({ params: { ...route.params, season: newSeasonSlug, ep: epSlug } })
})

const sidebarSeasonIdx = computed(() =>
  seasonOptions.value.findIndex(s => s.label === sidebarSeason.value?.label)
)

const sidebarEpisodes = computed(() => {
  const eps = sidebarSeason.value?.episodes ?? playerEpisodes.value
  if (settings.isAdmin) return eps
  return eps.filter(e => e.visible !== false && (e.sources?.fr && Object.keys(e.sources.fr).length > 0))
})

const sidebarProgressMap = computed(() => {
  if (!serie.value) return {}
  const slug = sidebarSeasonIdx.value >= 0 ? `saison-${sidebarSeasonIdx.value + 1}` : route.params.season ?? 'saison-1'
  return progressStore[serie.value.id]?.[slug] ?? {}
})

const showSeasonDropdown = ref(false)
const closeSeasonDropdown = () => { showSeasonDropdown.value = false }

// ── Contrôles du lecteur ──────────────────────────────────────
const videoEl         = ref(null)
const playerContainer = ref(null)
const progressBarEl   = ref(null)
const isPlaying       = ref(false)
const currentTime     = ref(0)
const totalDuration   = ref(0)
const buffered        = ref(0)
const volume          = ref(1)
const isMuted         = ref(false)
const isFullscreen    = ref(false)
const showControls    = ref(true)
let   hideTimer       = null

const progress = computed(() =>
  totalDuration.value > 0 ? (currentTime.value / totalDuration.value) * 100 : 0
)

function formatTime(s) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function togglePlay() {
  if (!videoEl.value) return
  isPlaying.value ? videoEl.value.pause() : videoEl.value.play()
}

function skip(sec) {
  if (!videoEl.value) return
  videoEl.value.currentTime = Math.max(0, Math.min(totalDuration.value, videoEl.value.currentTime + sec))
}

function onTimeUpdate() {
  if (!videoEl.value) return
  currentTime.value = videoEl.value.currentTime
  if (videoEl.value.buffered.length) {
    buffered.value = (videoEl.value.buffered.end(videoEl.value.buffered.length - 1) / totalDuration.value) * 100
  }
  const now = Date.now()
  if (now - lastProgressSave >= 5000) {
    lastProgressSave = now
    saveCurrentProgress()
  }
}

function onLoadedMetadata() {
  totalDuration.value = videoEl.value?.duration ?? 0
  const pct = progressStore[serie.value?.id]?.[route.params.season]?.[episode.value?.num] ?? 0
  if (pct > 0 && pct < 95 && totalDuration.value) {
    videoEl.value.currentTime = (pct / 100) * totalDuration.value
  }
  // Active la première piste de sous-titres si elle existe
  const tracks = videoEl.value?.textTracks
  if (tracks?.length) tracks[0].mode = 'showing'
  trackView()
}

function toggleMute() {
  if (!videoEl.value) return
  isMuted.value = !isMuted.value
  videoEl.value.muted = isMuted.value
}

watch(volume, v => { if (videoEl.value) videoEl.value.volume = v })

function toggleFullscreen() {
  if (!playerContainer.value) return
  document.fullscreenElement
    ? document.exitFullscreen()
    : playerContainer.value.requestFullscreen()
}

function onProgressMousedown(e) {
  const seekTo = (clientX) => {
    if (!progressBarEl.value || !totalDuration.value) return
    const rect = progressBarEl.value.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    videoEl.value.currentTime = ratio * totalDuration.value
  }
  seekTo(e.clientX)
  const onMove = (e) => seekTo(e.clientX)
  const onUp   = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function resetHideTimer() {
  showControls.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { if (isPlaying.value) showControls.value = false }, 3000)
}

const onFullscreenChange = () => { isFullscreen.value = !!document.fullscreenElement }

let lastProgressSave = 0

function saveCurrentProgress() {
  if (!serie.value || !episode.value || !totalDuration.value) return
  const pct = (currentTime.value / totalDuration.value) * 100
  saveProgress(serie.value.id, route.params.season ?? 'saison-1', episode.value.num, pct)
}

function onVideoPause() {
  isPlaying.value = false
  saveCurrentProgress()
}

function onVideoEnded() {
  isPlaying.value = false
  if (serie.value && episode.value) {
    saveProgress(serie.value.id, route.params.season ?? 'saison-1', episode.value.num, 100)
  }
}

onMounted(async () => {
  await fetchSerie(route.params.id)
  document.addEventListener('click', closeSeasonDropdown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', closeSeasonDropdown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  clearTimeout(hideTimer)
  saveCurrentProgress()
})

// Épisodes triés par numéro croissant pour la navigation prev/next
const sortedEpisodes = computed(() =>
  [...playerEpisodes.value].sort((a, b) => a.num - b.num)
)
const currentIndex = computed(() =>
  sortedEpisodes.value.findIndex(e => e.num === episode.value?.num)
)
const prevEpisode = computed(() =>
  currentIndex.value > 0 ? sortedEpisodes.value[currentIndex.value - 1] : null
)
const nextEpisode = computed(() =>
  currentIndex.value < sortedEpisodes.value.length - 1
    ? sortedEpisodes.value[currentIndex.value + 1]
    : null
)

const ALL_QUALITIES = [
  { label: '1080p', res: '' },
  { label: '720p',  res: '' },
  { label: '480p',  res: '' },
]

// Première langue disponible dans les sources de l'épisode (automatique)
const autoLang = computed(() =>
  episode.value?.sources ? Object.keys(episode.value.sources)[0] : null
)

const availableQualities = computed(() =>
  ALL_QUALITIES.filter(q =>
    episode.value?.sources?.[autoLang.value]?.[q.label] != null
  )
)

const selectedQuality = ref('1080p')

// Bascule sur la première qualité disponible si la sélection courante n'existe plus
watch(episode, () => {
  if (!availableQualities.value.find(q => q.label === selectedQuality.value)) {
    selectedQuality.value = availableQualities.value[0]?.label ?? 'FHD'
  }
})

// Source vidéo : première langue dispo + qualité sélectionnée
const currentSrc = computed(() =>
  episode.value?.sources?.[autoLang.value]?.[selectedQuality.value] ?? null
)

// Réinitialise l'état du player quand on change d'épisode
watch(currentSrc, () => {
  currentTime.value = 0
  totalDuration.value = 0
  buffered.value = 0
  isPlaying.value = false
  showControls.value = true
  lastProgressSave = 0
})

watchEffect(() => {
  if (serie.value && episode.value) {
    document.title = `EP ${episode.value.num} — ${episode.value.title} · ${serie.value.titleFull} — ${config.siteName}`
  }
})
</script>
