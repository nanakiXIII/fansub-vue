<template>
  <div class="max-w-6xl mx-auto px-6 py-8">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2 text-[11px] text-ink-3 mb-2">
          <RouterLink to="/" class="hover:text-orange transition-colors">Accueil</RouterLink>
          <span>›</span>
          <span>Actualités</span>
        </div>
        <h1 class="text-[24px] font-extrabold text-white leading-tight">Actualités</h1>
        <p v-if="!loading" class="text-[12px] text-ink-3 mt-0.5">
          {{ filtered.length }} article{{ filtered.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Recherche -->
      <div class="relative w-full sm:w-64">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="search"
          type="text"
          placeholder="Rechercher…"
          class="w-full bg-bg-1 border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/40 transition-colors"
        />
      </div>
    </div>

    <!-- Filtres catégorie -->
    <div class="flex gap-1.5 flex-wrap mb-6 p-1 bg-bg-1 border border-white/[0.07] rounded-xl w-fit">
      <button
        v-for="cat in CATEGORIES" :key="cat.id"
        @click="activeCategory = cat.id"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
        :class="activeCategory === cat.id ? 'bg-bg-2 text-white shadow-sm' : 'text-ink-3 hover:text-ink-1'"
      >
        <span>{{ cat.icon }}</span>
        {{ cat.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-bg-1 border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
        <div class="h-36 bg-bg-2"></div>
        <div class="p-4 flex flex-col gap-2">
          <div class="h-3 bg-bg-2 rounded w-1/3"></div>
          <div class="h-4 bg-bg-2 rounded w-3/4"></div>
          <div class="h-3 bg-bg-2 rounded w-full"></div>
        </div>
      </div>
    </div>

    <!-- Aucun résultat -->
    <div v-else-if="!filtered.length" class="text-center py-20 text-ink-3 text-[13px]">
      Aucun article trouvé
    </div>

    <!-- Grille -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="item in visible" :key="item._id"
        :to="`/actualite/${item._id}`"
        class="group bg-bg-1 border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/15 hover:-translate-y-0.5 transition-all flex flex-col"
      >
        <!-- Visuel -->
        <div class="relative h-36 shrink-0 overflow-hidden">
          <img loading="lazy" v-if="item.thumb" :src="item.thumb" :alt="item.title" class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0" :style="{ background: item.gradient || 'linear-gradient(135deg,#1a1a2e,#16213e)', opacity: item.thumb ? 0.55 : 1 }"></div>
          <div v-if="!item.thumb" class="absolute inset-0 flex items-center justify-center text-[56px] opacity-20 select-none">
            {{ item.icon }}
          </div>
          <!-- Catégorie badge sur l'image -->
          <div class="absolute top-3 left-3">
            <span class="badge text-[10px]" :class="getCategoryBadge(item.category)">{{ item.category }}</span>
          </div>
          <!-- Vues -->
          <div v-if="item.views" class="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-white/60 bg-black/40 rounded px-1.5 py-0.5 backdrop-blur-sm">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ fmt(item.views) }}
          </div>
        </div>

        <!-- Contenu -->
        <div class="flex flex-col flex-1 p-4">
          <div class="text-[10px] text-ink-3 mb-1.5">{{ formatDate(item.createdAt) }}</div>
          <h2 class="text-[13px] font-bold text-white leading-snug mb-2 group-hover:text-orange transition-colors line-clamp-2">
            {{ item.title }}
          </h2>
          <p class="text-[11px] text-ink-3 leading-relaxed line-clamp-3 flex-1">{{ item.excerpt }}</p>
          <div class="mt-3 flex items-center gap-1 text-[11px] text-orange font-semibold">
            Lire la suite
            <svg class="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Charger plus -->
    <div v-if="!loading && filtered.length > visibleCount" class="flex justify-center mt-8">
      <button
        @click="visibleCount += 12"
        class="btn-outline px-6 py-2 text-[12px]"
      >
        Charger plus
        <span class="text-ink-3 text-[10px]">({{ filtered.length - visibleCount }} restants)</span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/services/http.js'
import { getCategoryBadge } from '@/data/news.js'

const route = useRoute()

const CATEGORIES = [
  { id: '',           label: 'Tous',        icon: '📋' },
  { id: 'Sortie',     label: 'Sorties',     icon: '🎬' },
  { id: 'Annonce',    label: 'Annonces',    icon: '📣' },
  { id: 'Recrutement',label: 'Recrutement', icon: '🤝' },
  { id: 'Site',       label: 'Site',        icon: '⚙️' },
  { id: 'Communauté', label: 'Communauté',  icon: '💬' },
]

const articles       = ref([])
const loading        = ref(true)
const search         = ref('')
const activeCategory = ref(route.query.category ?? '')
const visibleCount   = ref(12)

const filtered = computed(() => {
  let list = articles.value
  if (activeCategory.value) list = list.filter(a => a.category === activeCategory.value)
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase()
    list = list.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q)
    )
  }
  return list
})

const visible = computed(() => filtered.value.slice(0, visibleCount.value))

function formatDate(d) {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7)   return `Il y a ${diff} jours`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmt(n) {
  if (!n) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

onMounted(async () => {
  try {
    articles.value = await http.get('/news')
  } catch {}
  loading.value = false
})
</script>
