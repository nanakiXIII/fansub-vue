<template>
  <div class="max-w-4xl mx-auto px-6 pt-10 pb-16">

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[300px]">
      <div class="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Introuvable -->
    <div v-else-if="!user" class="text-center py-20">
      <div class="text-[15px] font-bold text-white mb-2">Utilisateur introuvable</div>
      <RouterLink to="/classement" class="text-[12px] text-orange hover:underline">← Retour au classement</RouterLink>
    </div>

    <template v-else>
      <!-- En-tête -->
      <div class="flex items-center gap-4 mb-8">
        <div class="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[20px] font-bold text-white"
             :style="isImageUrl(user.avatar) ? {} : { background: user.avatar || defaultAvatar }">
          <img loading="lazy" v-if="isImageUrl(user.avatar)" :src="user.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ initials(user.username) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <h1 class="text-[20px] font-extrabold text-white truncate">{{ user.username }}</h1>
            <span v-if="user.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none shrink-0">ADMIN</span>
            <span v-else-if="user.roleLabel" class="text-[9px] font-bold rounded px-1.5 py-px leading-none shrink-0" :style="user.roleColor ? { background: user.roleColor + '33', color: user.roleColor } : {}">{{ user.roleLabel }}</span>
            <span v-if="user.activeTitle?.label" class="text-[9px] font-bold rounded px-1.5 py-px leading-none shrink-0" :style="user.activeTitle.color ? { background: user.activeTitle.color + '33', color: user.activeTitle.color } : {}">{{ user.activeTitle.label }}</span>
          </div>
          <div class="text-[11px] text-ink-3">Membre depuis {{ formattedDate(user.memberSince) }}</div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 text-center">
          <div class="text-[22px] font-extrabold text-orange leading-none mb-1">{{ user.stats.watched }}</div>
          <div class="text-[10px] font-semibold text-ink-3 uppercase tracking-wide">Épisodes vus</div>
        </div>
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 text-center">
          <div class="text-[22px] font-extrabold text-orange leading-none mb-1">{{ user.stats.downloads }}</div>
          <div class="text-[10px] font-semibold text-ink-3 uppercase tracking-wide">Téléchargements</div>
        </div>
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 text-center">
          <div class="text-[22px] font-extrabold text-orange leading-none mb-1">{{ user.stats.comments }}</div>
          <div class="text-[10px] font-semibold text-ink-3 uppercase tracking-wide">Commentaires</div>
        </div>
      </div>

      <!-- Réseaux & jeux -->
      <div v-if="filledSocials.length" class="flex flex-wrap gap-2 mb-8">
        <div v-for="s in filledSocials" :key="s.key" class="flex items-center gap-2 bg-bg-1 border border-white/[0.08] rounded-full pl-1 pr-3 py-1">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white shrink-0" :style="{ background: s.color }">{{ s.short }}</span>
          <span class="text-[11px] font-semibold text-ink-1">{{ s.label }}</span>
          <span class="text-[11px] text-ink-3">{{ s.value }}</span>
        </div>
      </div>

      <!-- Films & séries préférés -->
      <div v-if="user.favoriteMedia?.length" class="bg-bg-1 border border-white/[0.06] rounded-xl overflow-hidden mb-6">
        <div class="px-4 py-3.5 border-b border-white/[0.06]">
          <span class="text-[13px] font-bold text-white">Films & séries préférés</span>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4">
          <div v-for="m in user.favoriteMedia" :key="`${m.mediaType}-${m.tmdbId}`">
            <div class="aspect-[2/3] rounded-lg overflow-hidden bg-bg-2 relative">
              <img loading="lazy" v-if="m.posterPath" :src="m.posterPath" :alt="m.title" class="absolute inset-0 w-full h-full object-cover" />
              <span class="absolute top-1 left-1 text-[8px] font-bold px-1 py-px rounded bg-black/70 text-white uppercase">{{ m.mediaType === 'movie' ? 'Film' : 'Série' }}</span>
            </div>
            <div class="text-[10px] font-semibold text-ink-1 mt-1 truncate">{{ m.title }}</div>
            <div class="text-[9px] text-ink-3">{{ m.year }}</div>
          </div>
        </div>
      </div>

      <!-- Succès -->
      <div class="bg-bg-1 border border-white/[0.06] rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
          <span class="text-[13px] font-bold text-white">Succès débloqués</span>
          <span class="text-[10px] font-bold px-2 py-px rounded-full" :class="user.achievements.length ? 'bg-orange/20 text-orange' : 'bg-bg-3 text-ink-3'">{{ user.achievements.length }}</span>
        </div>
        <div v-if="!user.achievements.length" class="px-4 py-8 text-center text-[12px] text-ink-3">Aucun succès débloqué pour le moment.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
          <div v-for="ach in user.achievements" :key="ach.id" class="rounded-xl border border-white/[0.08] p-4 flex items-start gap-3">
            <div class="text-[26px] shrink-0 leading-none mt-0.5">{{ ach.icon }}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[13px] font-bold" :style="{ color: ach.color }">{{ ach.name }}</span>
                <span v-if="ach.rewardTitle" class="text-[9px] font-bold px-1.5 py-px rounded-full border" :style="{ background: ach.color + '22', color: ach.color, borderColor: ach.color + '44' }">« {{ ach.rewardTitle }} »</span>
              </div>
              <div class="text-[11px] text-ink-3 mt-0.5 leading-relaxed">{{ ach.description }}</div>
              <div class="text-[10px] text-green-400 font-semibold mt-1.5">✓ Obtenu le {{ formattedDate(ach.unlockedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/services/http.js'
import { useSeo } from '@/composables/useSeo.js'

const route = useRoute()
const loading = ref(true)
const user    = ref(null)

const defaultAvatar = 'linear-gradient(135deg,#f97316,#fb923c)'

function isImageUrl(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'))
}
function initials(name) {
  return (name ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '?'
}
function formattedDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const SOCIAL_DEFS = [
  { key: 'discord',     label: 'Discord',      short: 'DC',  color: '#5865F2' },
  { key: 'psn',         label: 'PSN',          short: 'PSN', color: '#0070D1' },
  { key: 'xbox',        label: 'Xbox Live',    short: 'XBL', color: '#107C10' },
  { key: 'switch',      label: 'Switch',       short: 'SW',  color: '#E60012' },
  { key: 'steam',       label: 'Steam',        short: 'ST',  color: '#66c0f4' },
  { key: 'myanimelist', label: 'MyAnimeList',  short: 'MAL', color: '#2e51a2' },
]

const filledSocials = computed(() =>
  SOCIAL_DEFS
    .map(def => ({ ...def, value: user.value?.socials?.[def.key] ?? '' }))
    .filter(s => s.value)
)

async function load() {
  loading.value = true
  user.value = null
  try {
    user.value = await http.get(`/users/${route.params.id}`)
  } catch {
    user.value = null
  } finally {
    loading.value = false
  }
}

useSeo({
  title: 'Profil',
})

watch(() => route.params.id, load)
onMounted(load)
</script>
