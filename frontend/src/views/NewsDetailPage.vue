<template>
  <div v-if="article">
    <!-- HERO -->
    <div class="relative min-h-[240px] flex items-end overflow-hidden">
      <template v-if="article.heroSource === 'serie' && linkedSerie?.banner">
        <img loading="lazy" :src="linkedSerie.banner" :alt="linkedSerie.titleFull" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0" :style="{ background: linkedSerie.gradient, opacity: overlayAlpha }"></div>
      </template>
      <template v-else>
        <img loading="lazy" v-if="article.thumb" :src="article.thumb" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0" :style="article.thumb
          ? { background: article.gradient, opacity: overlayAlpha }
          : { background: article.gradient }"></div>
      </template>
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgb(var(--color-bg-0)) 0%, rgb(var(--color-bg-0) / 0.55) 50%, transparent 100%)"></div>
      <!-- Screentone overlay -->
      <div class="absolute inset-0 opacity-[0.04]"
           style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 18px 18px;"></div>
      <div v-if="!linkedSerie" class="absolute right-10 top-1/2 -translate-y-1/2 text-[120px] leading-none opacity-[0.12] select-none hidden md:block">{{ article.icon }}</div>

      <div class="relative z-10 w-full max-w-3xl mx-auto px-6 pb-7">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-1.5 text-[11px] text-ink-3 mb-3">
          <RouterLink to="/" class="text-ink-2 hover:text-orange transition-colors">Accueil</RouterLink>
          <span>›</span>
          <span>Actualités</span>
        </div>

        <div class="flex items-center gap-2 mb-3">
          <span class="badge" :class="getCategoryBadge(article.category)">{{ article.category }}</span>
          <span class="text-[11px] text-ink-3">{{ article.date }}</span>
        </div>

        <h1 class="text-[20px] sm:text-[28px] font-extrabold text-white leading-tight mb-2">{{ article.title }}</h1>
        <p class="text-[12px] text-ink-2">Par {{ article.author }}</p>
      </div>
    </div>

    <!-- CONTENU -->
    <div class="max-w-3xl mx-auto px-6 pt-7 pb-10">
      <!-- Corps de l'article -->
      <div class="news-body mb-7">
        <div v-if="article.contentHtml" v-html="article.contentHtml"></div>
        <template v-else>
          <p v-for="(paragraph, i) in article.content" :key="i">{{ paragraph }}</p>
        </template>
      </div>

      <!-- Série mentionnée -->
      <RouterLink
        v-if="linkedSerie"
        :to="`/serie/${linkedSerie.id}`"
        class="group flex items-center gap-4 bg-bg-1 border border-white/[0.06] rounded-xl p-3 mb-7 transition-all hover:border-white/20 hover:-translate-y-0.5"
      >
        <div class="w-16 shrink-0 aspect-[2/3] rounded-lg overflow-hidden relative">
          <img loading="lazy" :src="linkedSerie.poster" :alt="linkedSerie.titleFull" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0" :style="{ background: linkedSerie.gradient, opacity: overlayAlpha }"></div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[10px] font-semibold text-orange uppercase tracking-wide mb-0.5">Série mentionnée dans cet article</div>
          <div class="text-[14px] font-bold text-white leading-tight mb-1.5 truncate">{{ linkedSerie.titleFull }}</div>
          <div class="flex items-center gap-2 text-[11px] text-ink-2 flex-wrap">
            <span class="font-extrabold text-orange">⭐ {{ linkedSerie.score }}</span>
            <span class="text-ink-3">·</span>
            <span>{{ linkedSerie.year }} · {{ linkedSerie.studio }}</span>
            <span class="text-ink-3">·</span>
            <span>{{ linkedSerie.episodes.length }}/{{ linkedSerie.episodesAired }} ép.</span>
          </div>
          <div class="flex gap-1 mt-1.5">
            <span v-for="g in linkedSerie.genres.slice(0, 3)" :key="g" class="tag text-[10px] py-0.5 px-2">{{ g }}</span>
          </div>
        </div>
        <svg class="w-4 h-4 text-ink-3 shrink-0 group-hover:text-orange group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </RouterLink>

      <!-- Épisodes mentionnés par l'actualité, téléchargeables -->
      <div v-if="linkedEpisodes.length" class="mb-7">
        <div class="section-title mb-4">
          {{ linkedEpisodes.length > 1 ? 'Épisodes mentionnés' : 'Épisode mentionné' }}
          <span class="text-ink-3 font-normal">— {{ linkedSerie.title }}</span>
        </div>
        <EpisodeList
          :episodes="linkedEpisodes"
          :serie-id="linkedSerie.id"
          :season-slug="linkedSeasonSlug"
          :get-ep-path="getEpPath"
          :progress-map="linkedProgressMap"
        />
      </div>

      <!-- Commentaires -->
      <div class="mt-8">
        <CommentSection
          :article-id="articleId"
          placeholder="Partage ton avis sur cet article…"
        />
      </div>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
    <div class="text-5xl mb-4">🔍</div>
    <h2 class="text-xl font-bold text-white mb-2">Actualité introuvable</h2>
    <p class="text-ink-2 mb-6">Cette actualité n'existe pas ou a été retirée.</p>
    <RouterLink to="/" class="btn-primary">Retour à l'accueil</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoryBadge } from '@/data/news.js'
import { http } from '@/services/http.js'
import { overlayAlpha } from '@/composables/useImageOverlay.js'
import { useProgress } from '@/composables/useProgress.js'
import { config } from '@/config.js'
import EpisodeList from '@/components/EpisodeList.vue'
import CommentSection from '@/components/CommentSection.vue'

const route   = useRoute()
const { store: progressStore } = useProgress()
const article     = ref(null)
const linkedSerie = ref(null)

onMounted(async () => {
  try {
    article.value = await http.get(`/news/${route.params.id}`)
    if (article.value?.serieId) {
      try { linkedSerie.value = await http.get(`/series/${article.value.serieId}`) } catch {}
    }
  } catch {
    article.value = null
  }
})

const articleId = computed(() => route.params.id)

watchEffect(() => {
  document.title = article.value
    ? `${article.value.title} — ${config.siteName}`
    : config.siteName
})

const linkedSeasonSlug = computed(() => {
  if (!linkedSerie.value) return 'saison-1'
  return linkedSerie.value.seasons?.length ? 'saison-1' : 'saison-1'
})

function getEpPath(ep) {
  return `/watch/${linkedSerie.value.id}/${linkedSeasonSlug.value}/episode-${ep.num}`
}

const allSerieEpisodes = computed(() => {
  const s = linkedSerie.value; if (!s) return []
  const fromSeasons = s.seasons?.flatMap(ss => ss.episodes ?? []) ?? []
  return fromSeasons.length ? fromSeasons : (s.episodes ?? [])
})

const linkedEpisodes = computed(() => {
  const nums = article.value?.episodeNums
  if (!linkedSerie.value || !nums?.length) return []
  return allSerieEpisodes.value.filter(ep => nums.includes(ep.num))
})

const linkedProgressMap = computed(() => {
  if (!linkedSerie.value) return {}
  return progressStore[linkedSerie.value.id]?.[linkedSeasonSlug.value] ?? {}
})
</script>

<style>
/* Styles non-scopés car v-html ne reçoit pas l'attribut scoped */
.news-body p          { font-size: 13px; line-height: 1.75; color: rgb(var(--color-ink-2)); margin-bottom: 0.75rem; }
.news-body h2         { font-size: 20px; font-weight: 800; color: #fff; margin: 1.5rem 0 0.5rem; }
.news-body h3         { font-size: 16px; font-weight: 700; color: #fff; margin: 1.25rem 0 0.4rem; }
.news-body h4         { font-size: 14px; font-weight: 600; color: #fff; margin: 1rem 0 0.3rem; }
.news-body ul         { list-style: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.news-body ol         { list-style: decimal; padding-left: 1.25rem; margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.news-body li         { font-size: 13px; color: rgb(var(--color-ink-2)); line-height: 1.6; }
.news-body blockquote { border-left: 2px solid rgba(var(--color-orange), 0.6); padding-left: 0.75rem; font-style: italic; color: rgb(var(--color-ink-3)); margin: 0.75rem 0; }
.news-body hr         { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.5rem 0; }
.news-body a          { color: rgb(var(--color-orange)); text-decoration: underline; }
.news-body strong     { font-weight: 700; color: #fff; }
.news-body em         { font-style: italic; }
</style>

