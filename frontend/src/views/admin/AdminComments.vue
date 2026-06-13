<template>
  <div>
    <div class="mb-5">
      <h1 class="text-[18px] font-extrabold text-white">Commentaires</h1>
      <p class="text-[11px] text-ink-3 mt-0.5">Modération des commentaires</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        class="px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
        :class="activeTab === tab.value
          ? 'bg-orange/10 text-orange border-orange/30'
          : 'bg-bg-1 text-ink-2 border-white/[0.06] hover:border-white/20'"
      >
        {{ tab.label }}
        <span v-if="tab.count !== null" class="ml-1 text-[9px] font-bold">{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="c in filtered"
        :key="c._id"
        class="bg-bg-1 border rounded-xl px-4 py-3"
        :class="{
          'border-orange/20':        c.status === 'pending',
          'border-white/[0.06]':     c.status === 'approved',
          'border-red-500/20':       c.status === 'rejected',
        }"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[12px] font-bold text-white">{{ c.username }}</span>
              <span
                class="text-[9px] font-bold uppercase rounded-full px-2 py-px border"
                :class="{
                  'bg-orange/10 text-orange border-orange/20':     c.status === 'pending',
                  'bg-green-500/10 text-green-400 border-green-500/20': c.status === 'approved',
                  'bg-red-500/10 text-red-400 border-red-500/20': c.status === 'rejected',
                }"
              >{{ statusLabel(c.status) }}</span>
              <span class="text-[10px] text-ink-3 ml-auto shrink-0">{{ formatDate(c.createdAt) }}</span>
            </div>
            <p class="text-[12px] text-ink-2 leading-relaxed break-words">{{ c.text }}</p>
            <div class="text-[10px] text-ink-3 mt-1">
              <span v-if="c.serieId">Série : {{ c.serieId }}</span>
              <span v-if="c.articleId">Article : {{ c.articleId }}</span>
              <span v-if="c.epNum"> · Ép. {{ c.epNum }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-1 shrink-0">
            <button v-if="c.status !== 'approved'" @click="approve(c)" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-green-400 hover:bg-green-400/10 transition-colors" title="Approuver">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button v-if="c.status !== 'rejected'" @click="reject(c)" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-orange hover:bg-orange/10 transition-colors" title="Rejeter">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button @click="deleteComment(c)" class="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Supprimer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div v-if="!filtered.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun commentaire dans cette catégorie.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { useDialog } from '@/composables/useDialog.js'

const { showAlert, showConfirm } = useDialog()

const comments  = ref([])
const loading   = ref(true)
const activeTab = ref('pending')

const tabs = computed(() => [
  { label: 'En attente', value: 'pending',  count: comments.value.filter(c => c.status === 'pending').length  },
  { label: 'Approuvés',  value: 'approved', count: null },
  { label: 'Rejetés',    value: 'rejected', count: null },
  { label: 'Tous',       value: 'all',      count: null },
])

const filtered = computed(() => {
  if (activeTab.value === 'all') return comments.value
  return comments.value.filter(c => c.status === activeTab.value)
})

onMounted(async () => {
  try {
    const res = await http.get('/comments?admin=1&limit=200')
    comments.value = res.comments ?? []
  } catch {}
  loading.value = false
})

function statusLabel(s) {
  return { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté' }[s] ?? s
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function approve(c) {
  try {
    await http.patch(`/comments/${c._id}/approve`)
    const idx = comments.value.findIndex(x => x._id === c._id)
    if (idx !== -1) comments.value[idx] = { ...comments.value[idx], status: 'approved' }
  } catch (e) { showAlert(e.message) }
}

async function reject(c) {
  try {
    await http.patch(`/comments/${c._id}/reject`)
    const idx = comments.value.findIndex(x => x._id === c._id)
    if (idx !== -1) comments.value[idx] = { ...comments.value[idx], status: 'rejected' }
  } catch (e) { showAlert(e.message) }
}

async function deleteComment(c) {
  if (!await showConfirm('Supprimer ce commentaire ?')) return
  try {
    await http.delete(`/comments/${c._id}`)
    comments.value = comments.value.filter(x => x._id !== c._id)
  } catch (e) { showAlert(e.message) }
}
</script>
