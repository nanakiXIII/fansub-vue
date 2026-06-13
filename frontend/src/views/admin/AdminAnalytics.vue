<template>
  <div class="flex flex-col gap-5">

    <!-- Header + onglets -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Analytics</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">
          <span v-if="tab === 'presence'">Présence en temps réel · mise à jour automatique</span>
          <span v-else>Visites des 90 derniers jours</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="tab === 'history'"
          @click="loadHistory"
          :disabled="histLoading"
          class="btn-outline text-[12px] py-1.5 px-3 gap-1.5"
        >
          <svg class="w-3.5 h-3.5" :class="histLoading ? 'animate-spin' : ''" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.36L3 3v6h6"/></svg>
          Actualiser
        </button>
        <div class="flex gap-1 p-1 bg-bg-1 border border-white/[0.07] rounded-xl">
          <button
            v-for="t in tabs" :key="t.id"
            @click="tab = t.id"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
            :class="tab === t.id ? 'bg-bg-2 text-white shadow-sm' : 'text-ink-3 hover:text-ink-1'"
          >
            <span class="w-3.5 h-3.5 shrink-0" v-html="t.icon"></span>
            {{ t.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════ PRÉSENCE ═══════════ -->
    <template v-if="tab === 'presence'">

      <!-- KPIs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          v-for="kpi in presenceKpis" :key="kpi.label"
          class="bg-bg-1 border border-white/[0.07] rounded-2xl p-4 flex flex-col gap-1"
        >
          <div class="flex items-center gap-2 mb-0.5">
            <span class="w-2 h-2 rounded-full shrink-0" :class="kpi.dot"></span>
            <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest">{{ kpi.label }}</div>
          </div>
          <div class="text-[28px] font-extrabold" :class="kpi.color">{{ kpi.value }}</div>
        </div>
      </div>

      <!-- Liste vide -->
      <div v-if="!liveUsers.length" class="bg-bg-1 border border-white/[0.07] rounded-2xl p-10 text-center text-[12px] text-ink-3">
        Aucun utilisateur connecté
      </div>

      <!-- Groupes par type -->
      <div v-else class="flex flex-col gap-4">
        <section
          v-for="group in userGroups" :key="group.type"
          class="bg-bg-1 border border-white/[0.07] rounded-2xl overflow-hidden"
        >
          <!-- En-tête du groupe -->
          <div class="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
            <span class="w-2 h-2 rounded-full shrink-0" :class="group.dot"></span>
            <span class="text-[12px] font-bold text-white">{{ group.label }}</span>
            <span class="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/[0.08] text-ink-2">{{ group.users.length }}</span>
          </div>

          <!-- Utilisateurs -->
          <div class="divide-y divide-white/[0.04]">
            <div
              v-for="u in group.users" :key="u.socketId"
              class="flex items-center gap-3 px-4 py-2.5"
            >
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-[11px] font-bold text-white"
                :style="isImageAvatar(u.avatar) ? {} : { background: u.avatar || '#334155' }"
              >
                <img loading="lazy" v-if="isImageAvatar(u.avatar)" :src="u.avatar" class="w-full h-full object-cover" />
                <span v-else>{{ (u.username || '?')[0].toUpperCase() }}</span>
              </div>

              <!-- Infos -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[12px] font-semibold text-white truncate">{{ u.username }}</span>
                  <span
                    v-if="u.roleLabel"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    :style="u.roleColor ? { background: u.roleColor + '28', color: u.roleColor } : {}"
                  >{{ u.roleLabel }}</span>
                  <span v-if="u.isAdmin" class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400">Admin</span>
                </div>
                <div class="text-[11px] text-ink-3 truncate mt-0.5">
                  <span :class="group.textColor">{{ typeVerb(u.type) }}</span>
                  <span v-if="u.label" class="text-ink-2"> · {{ u.label }}</span>
                </div>
              </div>

              <!-- Temps -->
              <div class="text-[10px] text-ink-3 shrink-0 text-right">
                <div>{{ timeAgo(u.connectedAt) }}</div>
                <div class="text-[9px] opacity-60">connecté</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- ═══════════ HISTORIQUE ═══════════ -->
    <template v-else>
      <div v-if="histLoading && !histData" class="text-[12px] text-ink-3 py-12 text-center">Chargement…</div>

      <template v-else-if="histData">
        <!-- KPI -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[10px] text-ink-3 uppercase tracking-wide mb-2">Total</div>
            <div class="text-[28px] font-extrabold text-white leading-none">{{ fmt(histData.totalViews) }}</div>
            <div class="flex items-center gap-1 mt-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
              <span class="text-[11px] text-blue-400 font-semibold">{{ fmt(histData.totalUnique) }}</span>
              <span class="text-[10px] text-ink-3">visiteurs uniques</span>
            </div>
          </div>
          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[10px] text-ink-3 uppercase tracking-wide mb-2">Aujourd'hui</div>
            <div class="text-[28px] font-extrabold text-orange leading-none">{{ fmt(histData.todayViews) }}</div>
            <div class="flex items-center gap-1 mt-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
              <span class="text-[11px] text-blue-400 font-semibold">{{ fmt(histData.todayUnique) }}</span>
              <span class="text-[10px] text-ink-3">visiteurs uniques</span>
            </div>
          </div>
          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[10px] text-ink-3 uppercase tracking-wide mb-2">Cette semaine</div>
            <div class="text-[28px] font-extrabold text-white leading-none">{{ fmt(histData.weekViews) }}</div>
            <div class="flex items-center gap-1 mt-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
              <span class="text-[11px] text-blue-400 font-semibold">{{ fmt(histData.weekUnique) }}</span>
              <span class="text-[10px] text-ink-3">visiteurs uniques</span>
            </div>
          </div>
        </div>

        <!-- Graphique 30 jours -->
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 mb-4">
          <div class="flex items-center justify-between mb-3">
            <div class="text-[11px] font-bold text-ink-2">30 derniers jours</div>
            <div class="flex gap-1 p-0.5 bg-bg-2 rounded-lg">
              <button
                @click="chartMode = 'views'"
                class="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors"
                :class="chartMode === 'views' ? 'bg-bg-0 text-white shadow-sm' : 'text-ink-3 hover:text-ink-1'"
              >Vues</button>
              <button
                @click="chartMode = 'unique'"
                class="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors"
                :class="chartMode === 'unique' ? 'bg-bg-0 text-white shadow-sm' : 'text-ink-3 hover:text-ink-1'"
              >Visiteurs</button>
            </div>
          </div>
          <div class="flex items-end gap-[3px] h-28">
            <div
              v-for="day in histData.dailyChart" :key="day.date"
              class="flex-1 flex flex-col items-center justify-end gap-1 group"
            >
              <div class="relative">
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-bg-2 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {{ fmtDate(day.date) }} · {{ fmt(chartMode === 'unique' ? day.unique : day.count) }}
                  {{ chartMode === 'unique' ? 'visiteurs' : 'vues' }}
                </div>
              </div>
              <div
                class="w-full rounded-t-sm transition-all duration-300"
                :class="[
                  day.date === todayKey
                    ? (chartMode === 'unique' ? 'bg-blue-400' : 'bg-orange')
                    : (chartMode === 'unique' ? 'bg-blue-400/30 hover:bg-blue-400/50' : 'bg-white/20 hover:bg-white/30')
                ]"
                :style="{ height: chartHeight(chartMode === 'unique' ? day.unique : day.count) + 'px', minHeight: (chartMode === 'unique' ? day.unique : day.count) ? '2px' : '0' }"
              ></div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-[9px] text-ink-3">
            <span>{{ fmtDate(histData.dailyChart[0]?.date) }}</span>
            <span>Aujourd'hui</span>
          </div>
        </div>

        <!-- 3 colonnes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[11px] font-bold text-ink-2 mb-3">Pages les plus vues</div>
            <div class="flex flex-col gap-2">
              <div v-for="p in histData.topPages" :key="p.path" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[11px]">{{ pageIcon(p.pageType) }}</span>
                    <span class="text-[11px] text-ink-1 truncate">{{ p.path }}</span>
                  </div>
                  <span class="text-[11px] font-bold text-white shrink-0">{{ fmt(p.count) }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-orange/70" :style="{ width: barPct(p.count, histData.topPages) + '%' }"></div>
                </div>
              </div>
              <div v-if="!histData.topPages.length" class="text-[11px] text-ink-3 py-2">Aucune donnée</div>
            </div>
          </div>

          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[11px] font-bold text-ink-2 mb-3">Pays des visiteurs</div>
            <div class="flex flex-col gap-2">
              <div v-for="c in histData.topCountries" :key="c.country" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[14px] leading-none">{{ countryFlag(c.country) }}</span>
                    <span class="text-[11px] text-ink-1 truncate">{{ countryName(c.country) }}</span>
                  </div>
                  <span class="text-[11px] font-bold text-white shrink-0">{{ fmt(c.count) }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-blue-400/70" :style="{ width: barPct(c.count, histData.topCountries) + '%' }"></div>
                </div>
              </div>
              <div v-if="!histData.topCountries.length" class="text-[11px] text-ink-3 py-2">Géolocalisation inactive</div>
            </div>
          </div>

          <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
            <div class="text-[11px] font-bold text-ink-2 mb-3">Sources de trafic</div>
            <div class="flex flex-col gap-2">
              <div v-for="s in histData.topSources" :key="s.source" class="flex flex-col gap-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[11px]">{{ sourceIcon(s.source) }}</span>
                    <span class="text-[11px] text-ink-1 truncate">{{ s.source }}</span>
                  </div>
                  <span class="text-[11px] font-bold text-white shrink-0">{{ fmt(s.count) }}</span>
                </div>
                <div class="h-1 rounded-full bg-white/[0.07]">
                  <div class="h-full rounded-full bg-green-400/70" :style="{ width: barPct(s.count, histData.topSources) + '%' }"></div>
                </div>
              </div>
              <div v-if="!histData.topSources.length" class="text-[11px] text-ink-3 py-2">Aucune donnée</div>
            </div>
          </div>
        </div>
      </template>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { http } from '@/services/http.js'
import { useSocket } from '@/composables/useSocket.js'

const { socket } = useSocket()

// ── Onglets ──────────────────────────────────────────────────────
const tabs = [
  {
    id: 'presence',
    label: 'Présence',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
  },
  {
    id: 'history',
    label: 'Historique',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
  },
]
const tab = ref('presence')

// ═══════════ PRÉSENCE ═══════════════════════════════════════════

const liveUsers = ref([])

// Config visuelle par type de page
const TYPE_CONFIG = {
  episode:   { label: 'Regardent un épisode',      dot: 'bg-red-400',      textColor: 'text-red-400',      priority: 0 },
  serie:     { label: 'Consultent une série',       dot: 'bg-blue-400',     textColor: 'text-blue-400',     priority: 1 },
  catalogue: { label: 'Parcourent le catalogue',    dot: 'bg-teal-400',     textColor: 'text-teal-400',     priority: 2 },
  home:      { label: "Sur la page d'accueil",      dot: 'bg-emerald-400',  textColor: 'text-emerald-400',  priority: 3 },
  news:      { label: 'Lisent une actualité',       dot: 'bg-purple-400',   textColor: 'text-purple-400',   priority: 4 },
  releases:  { label: 'Dernières sorties',          dot: 'bg-orange',       textColor: 'text-orange',       priority: 5 },
  team:      { label: "Page Équipe",                dot: 'bg-yellow-400',   textColor: 'text-yellow-400',   priority: 6 },
  profile:   { label: 'Profil',                     dot: 'bg-white/40',     textColor: 'text-ink-2',        priority: 7 },
  admin:     { label: 'Administration',             dot: 'bg-yellow-500',   textColor: 'text-yellow-400',   priority: 8 },
  other:     { label: 'Navigation',                 dot: 'bg-white/20',     textColor: 'text-ink-3',        priority: 9 },
}

function typeVerb(type) { return TYPE_CONFIG[type]?.label ?? 'Navigation' }

// Déduplique par userId (garde la session la plus récente par user)
const deduped = computed(() => {
  const byUser = new Map()
  for (const u of liveUsers.value) {
    if (!u.userId) {
      byUser.set('anon:' + u.socketId, u)
    } else {
      const existing = byUser.get(u.userId)
      if (!existing || new Date(u.lastSeen) > new Date(existing.lastSeen)) {
        byUser.set(u.userId, u)
      }
    }
  }
  return [...byUser.values()]
})

const userGroups = computed(() => {
  const grouped = {}
  for (const u of deduped.value) {
    const t = TYPE_CONFIG[u.type] ? u.type : 'other'
    if (!grouped[t]) grouped[t] = []
    grouped[t].push(u)
  }
  return Object.entries(grouped)
    .map(([type, users]) => ({
      type,
      users: users.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen)),
      label: TYPE_CONFIG[type]?.label ?? 'Autres',
      dot:   TYPE_CONFIG[type]?.dot   ?? 'bg-white/20',
      textColor: TYPE_CONFIG[type]?.textColor ?? 'text-ink-3',
      priority: TYPE_CONFIG[type]?.priority ?? 99,
    }))
    .sort((a, b) => a.priority - b.priority)
})

const presenceKpis = computed(() => {
  const all  = deduped.value
  return [
    { label: 'En ligne',        value: all.length,                                       dot: 'bg-emerald-400', color: 'text-white' },
    { label: 'Regardent',       value: all.filter(u => u.type === 'episode').length,     dot: 'bg-red-400',     color: 'text-red-400' },
    { label: 'Naviguent',       value: all.filter(u => !['episode','admin'].includes(u.type)).length, dot: 'bg-blue-400', color: 'text-blue-400' },
    { label: 'Anonymes',        value: all.filter(u => !u.userId).length,                dot: 'bg-white/30',    color: 'text-ink-2' },
  ]
})

function isImageAvatar(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('https') || val.startsWith('data:') || val.startsWith('/'))
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60)   return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}min`
  return `${Math.floor(diff / 3600)}h`
}

function onAnalyticsUpdate(data) {
  liveUsers.value = Array.isArray(data) ? data : []
}

// Subscribe quand l'onglet présence est actif
function subscribePresence() {
  socket.emit('analytics:subscribe')
  socket.on('analytics:update', onAnalyticsUpdate)
}

function unsubscribePresence() {
  socket.emit('analytics:unsubscribe')
  socket.off('analytics:update', onAnalyticsUpdate)
}

watch(tab, (val, old) => {
  if (val === 'presence' && old !== 'presence') subscribePresence()
  if (val !== 'presence' && old === 'presence') unsubscribePresence()
})

// ═══════════ HISTORIQUE ═════════════════════════════════════════

const histData    = ref(null)
const histLoading = ref(false)

const todayKey = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})
const chartMode = ref('views')

const chartMax = computed(() => {
  const days = histData.value?.dailyChart ?? []
  return Math.max(1, ...days.map(d => chartMode.value === 'unique' ? d.unique : d.count))
})

function chartHeight(count) { return Math.round((count / chartMax.value) * 96) }
function barPct(count, arr) { return Math.round((count / Math.max(1, arr[0]?.count ?? 1)) * 100) }

function fmt(n) {
  if (n == null) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function fmtDate(str) {
  if (!str) return ''
  const [, m, d] = str.split('-')
  return `${d}/${m}`
}

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌐'
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397))
}

const COUNTRY_NAMES = {
  FR: 'France', BE: 'Belgique', CH: 'Suisse', CA: 'Canada', LU: 'Luxembourg',
  US: 'États-Unis', GB: 'Royaume-Uni', DE: 'Allemagne', ES: 'Espagne',
  IT: 'Italie', JP: 'Japon', MA: 'Maroc', DZ: 'Algérie', TN: 'Tunisie',
  MX: 'Mexique', BR: 'Brésil', AU: 'Australie', NL: 'Pays-Bas', PT: 'Portugal',
}
function countryName(code) { return COUNTRY_NAMES[code] ?? code }

function pageIcon(type) {
  const m = { home: '🏠', serie: '📺', news: '📰', catalogue: '🗂️', equipe: '👥', recrutement: '📋', player: '▶️', other: '📄' }
  return m[type] ?? '📄'
}

const SOURCE_ICONS = { 'Direct': '🔗', 'Google': '🔍', 'Bing': '🔍', 'Twitter / X': '🐦', 'Facebook': '👤', 'YouTube': '▶️', 'Reddit': '🟠', 'Discord': '💬' }
function sourceIcon(source) { return SOURCE_ICONS[source] ?? '🌐' }

async function loadHistory() {
  histLoading.value = true
  try { histData.value = await http.get('/analytics/summary') } catch {}
  histLoading.value = false
}

// ── Lifecycle ────────────────────────────────────────────────────
onMounted(() => {
  subscribePresence()
  loadHistory()
})

onUnmounted(() => {
  unsubscribePresence()
})
</script>
