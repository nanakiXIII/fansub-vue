<template>
  <div class="max-w-6xl mx-auto px-6 pt-10 pb-16">

    <!-- En-tête -->
    <div class="mb-8 text-center">
      <h1 class="text-[24px] sm:text-[30px] font-extrabold text-white leading-tight mb-2">Classement de la communauté</h1>
      <p class="text-[13px] text-ink-2">Les membres les plus actifs du fansub — visionnage, téléchargements et commentaires.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[200px]">
      <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <LeaderboardCard
        title="Top visionneurs"
        icon='<circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>'
        unit="ép."
        empty-text="Personne n'a encore terminé d'épisode."
        :rows="topWatchers"
      />
      <LeaderboardCard
        title="Top téléchargements"
        icon='<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><line x1="5" y1="21" x2="19" y2="21"/>'
        unit="dl."
        empty-text="Aucun téléchargement enregistré pour le moment."
        :rows="topDownloaders"
      />
      <LeaderboardCard
        title="Top commentateurs"
        icon='<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
        unit="com."
        empty-text="Aucun commentaire approuvé pour le moment."
        :rows="topCommenters"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { useSeo } from '@/composables/useSeo.js'
import { config } from '@/config.js'
import LeaderboardCard from '@/components/LeaderboardCard.vue'

useSeo({
  title: 'Classement',
  description: 'Le classement des membres les plus actifs de ' + config.siteName,
})

const loading        = ref(true)
const topWatchers    = ref([])
const topDownloaders = ref([])
const topCommenters  = ref([])

onMounted(async () => {
  try {
    const data = await http.get('/leaderboard')
    topWatchers.value    = data.topWatchers    ?? []
    topDownloaders.value = data.topDownloaders ?? []
    topCommenters.value  = data.topCommenters  ?? []
  } finally {
    loading.value = false
  }
})
</script>
