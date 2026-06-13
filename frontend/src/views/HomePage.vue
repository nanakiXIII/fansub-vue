<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="min-h-[380px] flex items-center justify-center">
      <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- HERO SECTION : carrousel des simulcasts en cours -->
    <div v-else-if="carouselItems.length" class="relative min-h-[380px] flex items-end overflow-hidden">
      <!-- Image de fond (fondu entre les séries) -->
      <Transition name="hero-fade">
        <img loading="lazy"
          :key="featuredSerie.id"
          :src="featuredSerie.banner"
          :alt="featuredSerie.titleFull"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </Transition>
      <!-- Teinte aux couleurs du thème (intensité réglable depuis le profil) -->
      <Transition name="hero-fade">
        <div :key="featuredSerie.id" class="absolute inset-0" :style="{ background: featuredSerie.gradient, opacity: overlayAlpha }"></div>
      </Transition>
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, transparent 55%)"></div>

      <!-- Screentone overlay -->
      <div class="absolute inset-0 opacity-[0.04]"
           style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>

      <div class="relative z-10 w-full max-w-6xl mx-auto px-6 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <Transition name="hero-fade" mode="out-in">
          <div :key="featuredSerie.id" class="flex flex-col md:flex-row flex-1 md:items-end md:justify-between gap-6 w-full">
            <!-- Hero info -->
            <div class="flex-1 max-w-lg">
              <div class="flex items-center gap-2 mb-3">
                <span class="badge badge-simulcast">En traduction</span>
                <span class="text-[11px] text-ink-2 font-medium">{{ currentStep }}</span>
                <span
                  v-if="settings.isAdmin && featuredItem.visible === false"
                  class="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/30 rounded px-1.5 py-px"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  Non visible
                </span>
              </div>
              <h1 class="text-[24px] sm:text-[34px] font-extrabold text-white leading-tight mb-1">{{ featuredSerie.titleFull }}</h1>
              <p class="text-[13px] text-ink-2 mb-3">{{ featuredSerie.titleJp }} — {{ featuredSerie.season }}</p>

              <div class="flex items-center gap-3 text-[12px] text-ink-2 mb-3 flex-wrap">
                <span class="text-[16px] font-extrabold text-orange">⭐ {{ featuredSerie.score }}</span>
                <span class="text-ink-3">·</span>
                <span>{{ featuredSerie.year }} · {{ featuredSerie.studio }}</span>
                <span class="text-ink-3">·</span>
                <div class="flex gap-1">
                  <span v-for="g in featuredSerie.genres.slice(0, 3)" :key="g" class="tag text-[10px] py-0.5 px-2">{{ g }}</span>
                </div>
              </div>

              <!-- Barre de progression traduction -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[11px] font-semibold text-ink-2">
                    EP {{ featuredItem.episode.num }} · {{ featuredItem.episode.lang.toUpperCase() }}
                  </span>
                  <span class="text-[11px] font-extrabold text-orange">{{ featuredItem.translation.pct }}%</span>
                </div>
                <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange rounded-full transition-all duration-700"
                    :style="{ width: featuredItem.translation.pct + '%' }"
                  ></div>
                </div>
                <div v-if="featuredItem.translation.eta" class="text-[10px] text-ink-3 mt-1">
                  Sortie estimée · <span class="text-ink-2 font-medium">{{ featuredItem.translation.eta }}</span>
                </div>
              </div>

              <div class="flex gap-2 flex-wrap">
                <button
                  @click="toggleFavorite(featuredSerie.id)"
                  class="gap-2 text-[13px] transition-all"
                  :class="isFavorite(featuredSerie.id) ? 'btn-primary' : 'btn-ghost'"
                >
                  <svg
                    class="w-4 h-4 transition-all"
                    :class="isFavorite(featuredSerie.id) ? 'fill-white stroke-white' : 'fill-none stroke-current'"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {{ isFavorite(featuredSerie.id) ? 'Dans ma liste' : 'Ajouter à ma liste' }}
                </button>
                <RouterLink :to="`/serie/${featuredSerie.id}`" class="btn-ghost text-[13px]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Détails
                </RouterLink>
              </div>
            </div>

            <!-- Carte étapes de traduction -->
            <div class="hidden md:block bg-bg-1/80 backdrop-blur border border-white/10 rounded-xl p-4 min-w-[230px]">
              <div class="text-[10px] font-bold text-orange uppercase tracking-wide mb-0.5">
                Épisode {{ featuredItem.episode.num }}
              </div>
              <div class="text-[12px] font-semibold text-white mb-3 leading-snug">
                {{ featuredItem.episode.title }}
              </div>

              <!-- Étapes -->
              <div class="flex flex-col gap-2">
                <div
                  v-for="step in featuredItem.translation.steps"
                  :key="step.label"
                  class="flex items-center gap-2.5"
                >
                  <!-- Indicateur -->
                  <div class="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    :class="step.done
                      ? 'bg-orange'
                      : step.current
                        ? 'bg-orange/30 ring-2 ring-orange/60 ring-offset-1 ring-offset-bg-1'
                        : 'bg-white/10'"
                  >
                    <svg v-if="step.done" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span v-else-if="step.current" class="w-1.5 h-1.5 rounded-full bg-orange animate-pulse block"></span>
                  </div>

                  <!-- Label -->
                  <span
                    class="text-[11px] font-medium"
                    :class="step.done ? 'text-ink-2 line-through' : step.current ? 'text-white font-bold' : 'text-ink-3'"
                  >{{ step.label }}</span>

                  <!-- Staff assigné à l'étape courante -->
                  <span v-if="step.current && featuredItem.staff.translator" class="ml-auto text-[9px] text-ink-3 truncate max-w-[70px]">
                    {{ featuredItem.staff.translator }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Puces de navigation du carrousel : la puce active se remplit jusqu'à passer à la suivante -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        <button
          v-for="(item, i) in carouselItems"
          :key="item.serieId"
          class="relative h-1.5 rounded-full overflow-hidden bg-white/25 transition-[width] duration-300"
          :class="i === currentSlide ? 'w-10' : 'w-1.5 hover:bg-white/45'"
          :aria-label="`Voir ${item.serie.titleFull}`"
          :aria-current="i === currentSlide"
          @click="goToSlide(i)"
        >
          <span
            v-if="i === currentSlide"
            :key="currentSlide"
            class="absolute inset-y-0 left-0 bg-orange rounded-full hero-progress-fill"
            :style="{ animationDuration: SLIDE_DURATION + 'ms' }"
            @animationend="nextSlide"
          ></span>
        </button>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div v-if="!loading" class="max-w-6xl mx-auto px-6">

      <!-- Actualités + Stats -->
      <div class="pt-8 pb-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">

        <!-- Actualités -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="section-title">Actualités</div>
            <RouterLink to="/actualites" class="text-[12px] font-medium text-orange flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 12 12"><polyline points="4.5,1.5 9,6 4.5,10.5"/></svg>
            </RouterLink>
          </div>
          <div class="flex flex-col gap-1.5">
            <RouterLink
              v-for="item in news"
              :key="item._id"
              :to="`/actualite/${item._id}`"
              class="flex items-start gap-3 bg-bg-1 border rounded-lg px-3 py-2.5 transition-all hover:bg-bg-2"
              :class="liveNews.some(n => String(n._id) === String(item._id))
                ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/40'
                : 'border-white/[0.06] hover:border-white/14'"
            >
              <!-- Icône -->
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 self-center" :style="{ background: item.gradient || '#1a1a2a' }">
                {{ item.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="badge" :class="getCategoryBadge(item.category)">{{ item.category }}</span>
                  <span class="text-[10px] text-ink-3">{{ formatNewsDate(item.createdAt) }}</span>
                </div>
                <div class="text-[12px] font-semibold text-ink-1 mb-0.5 truncate">{{ item.title }}</div>
                <div class="text-[11px] text-ink-3 leading-relaxed line-clamp-2">{{ item.excerpt }}</div>
              </div>

              <!-- Illustration -->
              <div class="hidden sm:block w-28 h-16 rounded-lg shrink-0 overflow-hidden relative">
                <img loading="lazy" v-if="item.thumb" :src="item.thumb" class="absolute inset-0 w-full h-full object-cover" />
                <div class="absolute inset-0" :style="{ background: item.gradient || '#1a1a2a', opacity: item.thumb ? 0.45 : 1 }"></div>
                <div v-if="!item.thumb" class="absolute inset-0 flex items-center justify-center text-2xl opacity-50">{{ item.icon }}</div>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Stats + Annonce -->
        <div class="flex flex-col gap-4">
          <!-- Stats card -->
          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[12px] font-bold text-white mb-3 flex items-center gap-2">
              <span class="w-2 h-2 bg-orange rounded-full inline-block"></span>
              Statistiques
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="stat in stats" :key="stat.label" class="bg-bg-2 rounded-lg p-3 text-center">
                <div class="text-[20px] font-extrabold text-orange leading-none mb-1">{{ stat.value }}</div>
                <div class="text-[9px] font-semibold text-ink-3 uppercase tracking-wide">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Équipe -->
          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">

            <!-- Header -->
            <div class="flex items-center justify-between">
              <div class="text-[12px] font-bold text-white flex items-center gap-2">
                <span class="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"></span>
                Notre équipe
              </div>
              <RouterLink to="/equipe" class="text-[10px] text-ink-3 hover:text-orange transition-colors">
                Voir tout →
              </RouterLink>
            </div>

            <!-- Avatars empilés + compteur -->
            <div v-if="teamMembers.length" class="flex items-center gap-3">
              <div class="flex -space-x-2">
                <div
                  v-for="m in teamMembers.slice(0, 6)" :key="m._id"
                  class="w-8 h-8 rounded-full border-2 border-bg-1 flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  :style="{ background: m.avatarGradient || '#334155' }"
                  :title="m.name"
                >
                  {{ m.initials || m.name?.[0]?.toUpperCase() }}
                </div>
                <div
                  v-if="teamMembers.length > 6"
                  class="w-8 h-8 rounded-full border-2 border-bg-1 bg-bg-3 flex items-center justify-center text-[9px] font-bold text-ink-2 shrink-0"
                >
                  +{{ teamMembers.length - 6 }}
                </div>
              </div>
              <div class="text-[11px] text-ink-3 leading-tight">
                <span class="font-semibold text-white">{{ teamMembers.length }}</span> membres actifs
              </div>
            </div>

            <!-- Postes ouverts -->
            <template v-if="openPositions.length">
              <div class="h-px bg-white/[0.06]"></div>
              <div>
                <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-2">
                  {{ openPositions.length }} poste{{ openPositions.length > 1 ? 's' : '' }} ouvert{{ openPositions.length > 1 ? 's' : '' }}
                </div>
                <div class="flex flex-col gap-1.5">
                  <div
                    v-for="pos in openPositions.slice(0, 3)" :key="pos._id"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-2 border border-white/[0.05]"
                  >
                    <span class="text-base leading-none shrink-0">{{ pos.icon || '🎯' }}</span>
                    <span class="text-[11px] font-semibold text-ink-1 truncate">{{ pos.title }}</span>
                    <span class="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                  </div>
                </div>
              </div>
              <RouterLink to="/recrutement" class="btn-outline text-[11px] py-1.5 px-3 w-full justify-center">
                Rejoindre l'équipe
              </RouterLink>
            </template>

            <!-- Aucun poste ouvert -->
            <template v-else>
              <div class="text-[11px] text-ink-3 text-center py-1">Aucun recrutement en cours</div>
              <RouterLink to="/equipe" class="btn-outline text-[11px] py-1.5 px-3 w-full justify-center">
                Découvrir l'équipe
              </RouterLink>
            </template>

          </div>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

      <!-- Dernières sorties -->
      <div class="pt-6 pb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="section-title">Dernières sorties</div>
          <RouterLink to="/sorties" class="text-[12px] font-medium text-orange flex items-center gap-1 hover:gap-2 transition-all">
            Voir tout
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 12 12"><polyline points="4.5,1.5 9,6 4.5,10.5"/></svg>
          </RouterLink>
        </div>

        <div class="sidebar-card overflow-hidden">
          <RouterLink
            v-for="item in latestReleases"
            :key="`${item.serieId}-${item.seasonSlug}-${item.epNum}`"
            :to="`/serie/${item.serieId}?season=${item.seasonSlug}#episode-${item.epNum}`"
            class="flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03] transition-colors group"
            :class="liveReleases.some(r => r.serieId === item.serieId && r.epNum === item.epNum) ? 'bg-emerald-500/5' : ''"
          >
            <!-- Miniature -->
            <div class="w-16 h-10 rounded shrink-0 overflow-hidden relative">
              <img loading="lazy" :src="item.serie.poster" :alt="item.serie.title" class="absolute inset-0 w-full h-full object-cover" />
              <div class="absolute inset-0" :style="{ background: item.serie.gradient, opacity: 0.45 }"></div>
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
              </div>
            </div>

            <!-- Infos -->
            <div class="flex-1 min-w-0">
              <div class="text-[12px] font-bold text-white truncate">{{ item.serie.title }}</div>
              <div class="text-[10px] text-ink-2 truncate">
                EP {{ item.epNum }}
                <span v-if="item.episode?.title && item.episode.title !== `Épisode ${item.epNum}`">
                  — {{ item.episode.title }}
                </span>
              </div>
            </div>

            <!-- Badge + Date -->
            <div class="flex flex-col items-end gap-1 shrink-0">
              <span v-if="item.isNew" class="badge badge-new">NEW</span>
              <span class="text-[10px] text-ink-3">{{ formatRelDate(item.releasedAt) }}</span>
            </div>
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { homeService } from '@/services/homeService.js'
import { getCategoryBadge } from '@/data/news.js'
import { overlayAlpha } from '@/composables/useImageOverlay.js'
import { useFavorites } from '@/composables/useFavorites.js'
import { useSettings } from '@/composables/useSettings.js'
import { useSocket } from '@/composables/useSocket.js'
import { http } from '@/services/http.js'

const { isFavorite, toggleFavorite } = useFavorites()
const { socket } = useSocket()

function calDiff(d) {
  if (!d) return 0
  const tz  = 'Europe/Paris'
  const fmt = { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }
  const todayStr = new Intl.DateTimeFormat('en-CA', fmt).format(new Date())
  const dateStr  = new Intl.DateTimeFormat('en-CA', fmt).format(new Date(d))
  return Math.round((new Date(todayStr) - new Date(dateStr)) / 86400000)
}

function formatNewsDate(d) {
  if (!d) return ''
  const diff = calDiff(d)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7)  return `Il y a ${diff} jours`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'Europe/Paris' })
}

function formatRelDate(d) {
  if (!d) return ''
  const diff = calDiff(d)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7)  return `Il y a ${diff} jours`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Paris' })
}
const settings = useSettings()

const loading          = ref(true)
const homeData         = ref(null)
const liveReleases     = ref([])
const liveNews         = ref([])
const liveSeriesCount  = ref(0)
const teamMembers      = ref([])
const openPositions    = ref([])

function onNewNews(article) {
  liveNews.value = liveNews.value.filter(n => String(n._id) !== String(article._id))
  liveNews.value.unshift(article)
}

function onNewSeries() {
  liveSeriesCount.value += 1
}

async function onNewRelease(release) {
  try {
    const serie = await http.get(`/series/${release.serieId}`)
    const season  = serie.seasons?.find(s => s.slug === release.seasonSlug)
    const eps     = season?.episodes ?? serie.episodes ?? []
    const episode = eps.find(e => e.num === release.epNum) ?? null
    const item = {
      ...release,
      serie:     { id: serie.id, title: serie.title, poster: serie.poster, gradient: serie.gradient },
      episode,
      isNew: true,
    }
    // Déduplique si déjà présent
    const key = `${release.serieId}-${release.seasonSlug}-${release.epNum}`
    liveReleases.value = liveReleases.value.filter(
      r => `${r.serieId}-${r.seasonSlug}-${r.epNum}` !== key
    )
    liveReleases.value.unshift(item)
  } catch {}
}

onMounted(async () => {
  try {
    const [home, team, recruit] = await Promise.all([
      homeService.fetch(settings.isAdmin),
      http.get('/team'),
      http.get('/recruit'),
    ])
    homeData.value      = home
    teamMembers.value   = team.filter(m => m.department !== 'Ancien Membre')
    openPositions.value = recruit.filter(r => r.open)
  } finally {
    loading.value = false
  }
  socket.on('new:release', onNewRelease)
  socket.on('new:news', onNewNews)
  socket.on('new:series', onNewSeries)
})

onUnmounted(() => {
  socket.off('new:release', onNewRelease)
  socket.off('new:news', onNewNews)
  socket.off('new:series', onNewSeries)
})

const carouselItems  = computed(() => homeData.value?.carousel ?? [])

const latestReleases = computed(() => {
  const seen = new Set()
  return [...liveReleases.value, ...(homeData.value?.releases ?? [])]
    .filter(r => {
      const key = `${r.serieId}-${r.seasonSlug}-${r.epNum}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 6)
})
const news           = computed(() => {
  const seen = new Set()
  return [...liveNews.value, ...(homeData.value?.news ?? [])]
    .filter(n => {
      const key = String(n._id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 5)
})
const stats          = computed(() => homeData.value?.stats
  ? [
      { value: (homeData.value.stats.episodes || 0).toLocaleString('fr-FR'), label: 'Épisodes' },
      { value: (homeData.value.stats.series || 0) + liveSeriesCount.value,   label: 'Séries'   },
      { value: homeData.value.stats.team       || 0,                         label: 'Membres'  },
      { value: homeData.value.stats.inProgress || 0,                         label: 'En cours' },
    ]
  : []
)

const SLIDE_DURATION = 7000
const currentSlide   = ref(0)
const featuredItem   = computed(() => carouselItems.value[currentSlide.value])
const featuredSerie  = computed(() => featuredItem.value?.serie)
const currentStep    = computed(() => featuredItem.value?.translation.steps.find(s => s.current)?.label ?? 'En cours')

// Recale le slide si la liste rétrécit (ex: admin désactive le mode admin)
watch(carouselItems, items => {
  if (currentSlide.value >= items.length) {
    currentSlide.value = Math.max(0, items.length - 1)
  }
})

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length
}
function goToSlide(i) {
  currentSlide.value = i
}
</script>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.5s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

.hero-progress-fill {
  width: 0%;
  animation-name: hero-progress-fill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes hero-progress-fill {
  from { width: 0%; }
  to   { width: 100%; }
}
</style>
