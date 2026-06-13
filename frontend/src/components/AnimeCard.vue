<template>
  <RouterLink :to="`/serie/${serie.id}`" class="anime-card group">
    <!-- Thumbnail -->
    <div class="relative aspect-[2/3] overflow-hidden">
      <img loading="lazy"
        :src="serie.poster"
        :alt="serie.title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div class="absolute inset-0 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
           :style="{ background: serie.gradient, opacity: overlayAlpha }"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(15,15,19,0.75) 0%, transparent 55%)"></div>

      <!-- Top badges -->
      <div class="absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="hasNewEpisode"      class="badge badge-new">NEW</span>
        <span v-if="serie.isSimulcast || serie.status === 'ongoing'" class="badge badge-simulcast">En cours</span>
        <span v-if="serie.status === 'licensed'" class="badge badge-licensed">Licencié</span>
        <span v-if="serie.status === 'finished'" class="badge badge-fin">Terminé</span>
      </div>

      <!-- Episode badge -->
      <div class="absolute bottom-2 left-2">
        <span class="badge badge-ep">
          {{ serie.status === 'finished' ? totalEpisodes + ' EP' : 'EP ' + serie.episodesAired }}
        </span>
      </div>

      <!-- Score -->
      <div class="absolute bottom-2 right-2 text-[10px] font-bold bg-black/65 text-orange rounded-sm px-1.5 py-[1px] flex items-center gap-1">
        ⭐ {{ serie.score }}
      </div>
    </div>

    <!-- Body -->
    <div class="p-2.5 flex flex-col gap-1 flex-1">
      <div class="text-[12px] font-semibold text-ink-1 leading-snug">{{ serie.title }}</div>
      <div class="text-[10px] text-ink-3">{{ serie.year }}</div>

      <!-- Progress bar (si en cours et progression définie) -->
      <div v-if="serie.progress" class="w-full h-[2px] bg-bg-3 rounded mt-1.5">
        <div class="h-[2px] bg-orange rounded" :style="{ width: serie.progress + '%' }"></div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import { overlayAlpha } from '@/composables/useImageOverlay.js'
import { useReleases } from '@/composables/useReleases.js'

const props = defineProps({
  serie: { type: Object, required: true },
})

const { isSerieNew } = useReleases()
const hasNewEpisode = computed(() => isSerieNew(props.serie.id))

const totalEpisodes = computed(() => {
  if (props.serie.episodes.length) return props.serie.episodes.length
  return props.serie.seasons?.reduce((sum, s) => sum + (s.episodes?.length ?? 0), 0) ?? 0
})
</script>
