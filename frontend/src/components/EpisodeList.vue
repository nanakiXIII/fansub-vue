<template>
  <div v-if="episodes.length" class="flex flex-col gap-1.5 pb-1">
    <div
      v-for="ep in episodes"
      :key="ep.num"
      :id="`episode-${ep.num}`"
      class="ep-row"
      :class="[
        ep.num === activeEp ? 'active' : (isSeen(ep) ? 'seen' : ''),
        serieId ? 'cursor-pointer' : '',
        ep.visible === false ? 'opacity-50 grayscale' : ''
      ]"
      @click="navigable && getEpPath && router.push(getEpPath(ep))"
    >
      <!-- Number -->
      <span
        class="text-[12px] font-bold w-6 text-center shrink-0"
        :class="ep.num === activeEp ? 'text-orange' : 'text-ink-3'"
      >{{ ep.num }}</span>

      <!-- Thumbnail -->
      <div v-if="!compact" class="w-20 h-11 rounded shrink-0 overflow-hidden relative group/thumb bg-bg-2">
        <img v-if="ep.thumbnail" :src="ep.thumbnail" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div v-else class="absolute inset-0" :style="{ background: ep.gradient || 'rgba(255,255,255,0.04)' }"></div>
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
          <svg class="w-5 h-5 fill-white" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 mb-0.5">
          <span
            class="text-[12px] font-semibold truncate"
            :class="ep.num === activeEp ? 'text-white' : 'text-ink-1'"
          >{{ ep.title }}</span>
          <!-- Badge vu -->
          <span
            v-if="(progressMap[ep.num] ?? 0) >= 90"
            class="shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-orange bg-orange/10 rounded px-1 py-px"
          >
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            Vu
          </span>
          <!-- Badge téléchargé -->
          <span
            v-if="isDownloaded(ep)"
            class="shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-orange bg-orange/10 rounded px-1 py-px"
          >
            <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            DL
          </span>
        </div>
        <div class="text-[10px] text-ink-3">{{ ep.duration }} · {{ ep.date }}</div>
        <div v-if="(progressMap[ep.num] ?? ep.progress ?? 0) > 0" class="w-full h-[2px] bg-bg-3 rounded mt-1.5">
          <div class="h-[2px] bg-orange rounded" :style="{ width: (progressMap[ep.num] ?? ep.progress) + '%' }"></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1.5 shrink-0">
        <span v-if="ep.isNew" class="badge badge-new hidden sm:inline-flex">NEW</span>

        <!-- Regarder / Reprendre -->
        <RouterLink
          v-if="getEpPath && !compact && hasFile(ep)"
          :to="getEpPath(ep)"
          class="btn-outline text-[11px] py-1.5 px-2.5 gap-1"
          @click.stop
        >
          <!-- Icône replay si revoir, sinon play -->
          <svg v-if="(progressMap[ep.num] ?? 0) >= 90" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/>
          </svg>
          <svg v-else class="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 16 16"><path d="M3 2l10 6-10 6V2z"/></svg>
          <span class="hidden sm:inline">{{
            (progressMap[ep.num] ?? 0) >= 90 ? 'Revoir' :
            (progressMap[ep.num] ?? 0) > 0   ? 'Reprendre' :
                                               'Regarder'
          }}</span>
        </RouterLink>

        <!-- Télécharger + qualité -->
        <div v-if="getDownloads(ep).length" class="relative">
          <button
            @click.stop="openDropdown = openDropdown === ep.num ? null : ep.num"
            class="btn-outline text-[11px] py-1.5 px-2.5 gap-1"
            :class="isDownloaded(ep) ? 'text-orange border-orange/40' : ''"
          >
            <!-- Icône checkmark si déjà téléchargé, sinon icône download -->
            <svg v-if="isDownloaded(ep)" class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="21" x2="19" y2="21"/>
            </svg>
            <span class="hidden sm:inline">{{ isDownloaded(ep) ? 'Téléchargé' : 'Télécharger' }}</span>
            <svg
              class="w-2.5 h-2.5 shrink-0 transition-transform"
              :class="openDropdown === ep.num ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <Transition name="dropdown">
            <div
              v-if="openDropdown === ep.num"
              class="absolute right-0 top-full mt-1.5 bg-bg-1 border border-white/[0.1] rounded-xl shadow-2xl z-50 overflow-hidden w-48"
            >
              <div class="px-3 pt-2.5 pb-1.5 border-b border-white/[0.06] text-[10px] font-bold text-ink-3 uppercase tracking-widest">Télécharger</div>
              <a
                v-for="d in getDownloads(ep)"
                :key="`${d.lang}-${d.quality}`"
                :href="d.url"
                download
                @click.stop="onDownloadClick(ep, d.quality, d.lang)"
                class="quality-row group"
              >
                <span class="badge" :class="d.badgeClass" :style="d.badgeStyle">{{ d.quality }}</span>
                <span class="flex-1 text-[12px] text-ink-1">{{ d.res }}</span>
                <span class="text-[10px] text-ink-3 uppercase">{{ d.lang }}</span>
                <svg class="w-3.5 h-3.5 text-ink-3 group-hover:text-orange transition-colors shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="21" x2="19" y2="21"/></svg>
              </a>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-[13px] text-ink-3 py-8 text-center">
    Aucun épisode disponible.
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useDownloads } from '@/composables/useDownloads.js'
import { useSettings } from '@/composables/useSettings.js'
import { http } from '@/services/http.js'

const router = useRouter()
const { store: downloadStore, markDownloaded } = useDownloads()
const settings = useSettings()

const props = defineProps({
  episodes:    { type: Array,    required: true },
  activeEp:    { type: Number,   default: null  },
  serieId:     { type: String,   default: null  },
  serieTitle:  { type: String,   default: ''    },
  seasonSlug:  { type: String,   default: null  },
  compact:     { type: Boolean,  default: false },
  navigable:   { type: Boolean,  default: false },
  getEpPath:   { type: Function, default: null  },
  progressMap: { type: Object,   default: () => ({}) },
})

function isDownloaded(ep) {
  if (!props.serieId || !props.seasonSlug) return false
  return !!downloadStore[props.serieId]?.[props.seasonSlug]?.[ep.num]
}

function isSeen(ep) {
  return (props.progressMap[ep.num] ?? 0) >= 95 || isDownloaded(ep)
}

function onDownloadClick(ep, quality, lang) {
  if (props.serieId && props.seasonSlug) {
    markDownloaded(props.serieId, props.seasonSlug, ep.num, quality, lang)
  }
  if (props.serieId) {
    http.post('/stats/download', {
      serieId:      props.serieId,
      serieTitle:   props.serieTitle,
      episodeNum:   ep.num,
      episodeTitle: ep.title ?? '',
      season:       props.seasonSlug ?? '',
    }).catch(() => {})
  }
}

const openDropdown = ref(null)
const closeDropdown = () => { openDropdown.value = null }
onMounted(() => document.addEventListener('click', closeDropdown))
onBeforeUnmount(() => document.removeEventListener('click', closeDropdown))

const QUALITY_META = {
  SD:  { res: '480p',  badgeClass: 'bg-bg-3 text-ink-2',   badgeStyle: '' },
  FHD: { res: '1080p', badgeClass: '',                      badgeStyle: 'background:#1a3355;color:#93c5fd' },
  '4K':{ res: '2160p', badgeClass: 'badge-ongoing',         badgeStyle: '' },
}

function dlUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    u.searchParams.set('dl', '1')
    return u.toString()
  } catch {
    return url + (url.includes('?') ? '&' : '?') + 'dl=1'
  }
}

function getDownloads(ep) {
  if (ep.sources) {
    const result = []
    for (const [lang, quals] of Object.entries(ep.sources)) {
      for (const [quality, url] of Object.entries(quals)) {
        if (url != null) {
          const meta = QUALITY_META[quality] ?? { res: quality, badgeClass: 'bg-bg-3 text-ink-2', badgeStyle: '' }
          result.push({ lang, quality, url: dlUrl(url), ...meta })
        }
      }
    }
    if (result.length) return result
  }
  if (ep.subUrl) {
    return [{ lang: 'VOSTFR', quality: 'FHD', url: dlUrl(ep.subUrl), ...QUALITY_META.FHD }]
  }
  return []
}

function hasFile(ep) {
  return getDownloads(ep).length > 0
}
</script>
