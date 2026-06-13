<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Actualités</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ articles.length }} article(s)</p>
      </div>
      <RouterLink to="/admin/news/nouveau" class="btn-primary text-[12px] py-2 px-4 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nouvel article
      </RouterLink>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div v-for="a in articles" :key="a._id" class="bg-bg-1 border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3">
        <div class="w-14 h-9 rounded shrink-0 overflow-hidden bg-bg-2">
          <img loading="lazy" v-if="a.thumb" :src="a.thumb" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-[20px]" :style="{ background: a.gradient || '#1a1a2a' }">
            <span class="opacity-60 text-[18px]">{{ a.icon }}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-bold text-white truncate">{{ a.title }}</div>
          <div class="text-[10px] text-ink-3 mt-0.5 flex items-center gap-1.5">
            <span v-if="!a.published" class="flex items-center gap-1 font-bold text-amber-400/80">
              <span class="w-1 h-1 rounded-full bg-amber-400/80"></span>Brouillon
            </span>
            <span v-if="!a.published" class="text-ink-3/50">·</span>
            <span>{{ a.category }}</span>
            <span class="text-ink-3/50">·</span>
            <span>{{ formatDate(a.createdAt) }}</span>
            <span v-if="a.author" class="text-ink-3/50">·</span>
            <span v-if="a.author">{{ a.author }}</span>
          </div>
        </div>
        <button @click="togglePublished(a)" :title="a.published ? 'Dépublier' : 'Publier'" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors" :class="a.published ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' : 'text-ink-3 hover:text-amber-400 hover:bg-amber-400/10'">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line v-if="!a.published" x1="12" y1="8" x2="12" y2="16"/><line v-if="!a.published" x1="8" y1="12" x2="16" y2="12"/>
            <polyline v-else points="20 6 9 17 4 12"/>
          </svg>
        </button>
        <RouterLink :to="`/admin/news/modifier/${a._id}`" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors" title="Modifier">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </RouterLink>
        <RouterLink :to="`/actualite/${a._id}`" target="_blank" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors" title="Voir">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </RouterLink>
        <button @click="deleteArticle(a)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Supprimer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!articles.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun article.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { http } from '@/services/http.js'

const articles = ref([])
const loading  = ref(true)

onMounted(async () => {
  try { articles.value = await http.get('/news') } catch {}
  loading.value = false
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function togglePublished(a) {
  try {
    const updated = await http.put(`/news/${a._id}`, { published: !a.published })
    a.published = updated.published
  } catch (e) { alert(e.message) }
}

async function deleteArticle(a) {
  if (!confirm(`Supprimer « ${a.title} » ?`)) return
  try {
    await http.delete(`/news/${a._id}`)
    articles.value = articles.value.filter(x => x._id !== a._id)
  } catch (e) { alert(e.message) }
}
</script>
