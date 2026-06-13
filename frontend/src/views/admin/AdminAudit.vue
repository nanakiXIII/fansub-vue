<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Logs d'audit</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ total.toLocaleString('fr-FR') }} entrée(s)</p>
      </div>
      <button @click="reload" :disabled="loading" class="btn-outline text-[12px] py-1.5 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/>
        </svg>
        Actualiser
      </button>
    </div>

    <!-- Filtres -->
    <div class="flex flex-wrap gap-2">
      <input
        v-model="search"
        type="text"
        placeholder="Rechercher un utilisateur…"
        class="bg-bg-1 border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-ink-1 placeholder:text-ink-3 outline-none focus:border-orange/50 w-48"
        @input="debouncedReload"
      />
      <select
        v-model="filterAction"
        class="bg-bg-1 border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-ink-1 outline-none focus:border-orange/50"
        @change="reload"
      >
        <option value="">Toutes les actions</option>
        <option v-for="a in availableActions" :key="a" :value="a">{{ actionLabel(a) }}</option>
      </select>
      <button v-if="filterAction || search" @click="clearFilters" class="text-[11px] text-ink-3 hover:text-orange transition-colors px-2">
        Effacer les filtres ×
      </button>
    </div>

    <!-- Tableau -->
    <section class="bg-bg-1 border border-white/[0.07] rounded-2xl overflow-hidden">
      <div v-if="loading && !logs.length" class="p-8 text-center text-[12px] text-ink-3">Chargement…</div>
      <div v-else-if="!logs.length" class="p-8 text-center text-[12px] text-ink-3">Aucun log trouvé</div>
      <table v-else class="w-full text-[12px]">
        <thead>
          <tr class="border-b border-white/[0.07] text-[10px] text-ink-3 uppercase tracking-widest">
            <th class="pl-5 py-2.5 text-left font-bold w-40">Date</th>
            <th class="py-2.5 px-3 text-left font-bold w-32">Auteur</th>
            <th class="py-2.5 px-3 text-left font-bold w-44">Action</th>
            <th class="py-2.5 px-3 text-left font-bold">Détails</th>
            <th class="pr-5 py-2.5 text-right font-bold w-28">IP</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in logs" :key="log._id"
            class="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <td class="pl-5 py-2.5 text-ink-3 whitespace-nowrap">{{ fmtDate(log.createdAt) }}</td>
            <td class="py-2.5 px-3 font-semibold text-ink-1 whitespace-nowrap">{{ log.username }}</td>
            <td class="py-2.5 px-3">
              <span
                class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="actionStyle(log.action)"
              >
                {{ actionLabel(log.action) }}
              </span>
            </td>
            <td class="py-2.5 px-3 text-ink-2 max-w-xs">
              <span v-if="log.details" class="truncate block">
                <template v-if="log.details.title">{{ log.details.title }}</template>
                <template v-if="log.details.username"> · {{ log.details.username }}</template>
                <template v-if="log.details.role"> → grade : {{ log.details.role || 'aucun' }}</template>
                <template v-if="log.details.isAdmin !== undefined"> → admin : {{ log.details.isAdmin }}</template>
                <template v-if="log.details.visible !== undefined"> · visibilité : {{ log.details.visible ? 'visible' : 'masquée' }}</template>
                <template v-if="log.details.text"> · "{{ log.details.text }}"</template>
                <template v-if="log.details.type"> · {{ log.details.type }}</template>
              </span>
              <span v-else-if="log.target" class="text-ink-3 font-mono text-[10px]">{{ log.target.slice(-8) }}</span>
            </td>
            <td class="pr-5 py-2.5 text-right text-ink-3 font-mono text-[10px] whitespace-nowrap">
              {{ log.ip ?? '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Pagination -->
    <div v-if="pages > 1" class="flex items-center justify-center gap-2">
      <button
        class="btn-outline text-[11px] py-1 px-3"
        :disabled="page <= 1"
        @click="goTo(page - 1)"
      >← Préc.</button>
      <span class="text-[11px] text-ink-3">Page {{ page }} / {{ pages }}</span>
      <button
        class="btn-outline text-[11px] py-1 px-3"
        :disabled="page >= pages"
        @click="goTo(page + 1)"
      >Suiv. →</button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '@/services/http.js'

const logs             = ref([])
const total            = ref(0)
const page             = ref(1)
const pages            = ref(1)
const loading          = ref(false)
const filterAction     = ref('')
const search           = ref('')
const availableActions = ref([])

let debounceTimer = null
function debouncedReload() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; reload() }, 350)
}

async function reload() {
  loading.value = true
  try {
    const qs = new URLSearchParams({ page: page.value, limit: 50 })
    if (filterAction.value) qs.set('action', filterAction.value)
    if (search.value.trim()) qs.set('search', search.value.trim())
    const data = await http.get('/audit?' + qs.toString())
    logs.value  = data.logs
    total.value = data.total
    pages.value = data.pages
  } catch {}
  loading.value = false
}

async function loadActions() {
  try { availableActions.value = await http.get('/audit/actions') } catch {}
}

function goTo(p) {
  page.value = p
  reload()
}

function clearFilters() {
  filterAction.value = ''
  search.value       = ''
  page.value         = 1
  reload()
}

onMounted(() => { reload(); loadActions() })

const ACTION_LABELS = {
  'comment.approve':    'Commentaire approuvé',
  'comment.reject':     'Commentaire rejeté',
  'comment.disapprove': 'Commentaire désapprouvé',
  'comment.delete':     'Commentaire supprimé',
  'user.admin_toggle':  'Admin basculé',
  'user.role_assign':   'Grade assigné',
  'user.delete':        'Utilisateur supprimé',
  'achievement.create': 'Succès créé',
  'achievement.update': 'Succès modifié',
  'achievement.delete': 'Succès supprimé',
  'alert.send':         'Alerte envoyée',
  'series.create':      'Série créée',
  'series.update':      'Série modifiée',
  'series.delete':      'Série supprimée',
}
function actionLabel(a) { return ACTION_LABELS[a] ?? a }

const ACTION_STYLES = {
  'comment.approve':    'bg-green-500/15 text-green-400',
  'comment.reject':     'bg-red-500/15 text-red-400',
  'comment.disapprove': 'bg-amber-500/15 text-amber-400',
  'comment.delete':     'bg-red-500/20 text-red-300',
  'user.admin_toggle':  'bg-yellow-500/15 text-yellow-400',
  'user.role_assign':   'bg-blue-500/15 text-blue-400',
  'user.delete':        'bg-red-500/20 text-red-300',
  'achievement.create': 'bg-emerald-500/15 text-emerald-400',
  'achievement.update': 'bg-blue-500/15 text-blue-400',
  'achievement.delete': 'bg-red-500/15 text-red-400',
  'alert.send':         'bg-orange/15 text-orange',
  'series.create':      'bg-emerald-500/15 text-emerald-400',
  'series.update':      'bg-blue-500/15 text-blue-400',
  'series.delete':      'bg-red-500/15 text-red-400',
}
function actionStyle(a) { return ACTION_STYLES[a] ?? 'bg-white/[0.08] text-ink-2' }

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>
