<template>
  <div>

    <!-- Header -->
    <div class="mb-7">
      <h1 class="text-[22px] font-extrabold text-white leading-tight">Tableau de bord</h1>
      <p class="text-[12px] text-ink-3 mt-0.5">Bienvenue, {{ settings.username }} — vue d'ensemble du site</p>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
      <RouterLink
        v-for="stat in stats"
        :key="stat.label"
        :to="stat.link"
        class="group bg-bg-1 border border-white/[0.06] rounded-xl p-4 hover:border-white/15 hover:-translate-y-0.5 transition-all"
      >
        <div class="flex items-start justify-between mb-3">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            :class="stat.color"
          >
            <span class="w-4 h-4" v-html="stat.icon"></span>
          </div>
          <span
            v-if="stat.alert"
            class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400"
          >{{ stat.alert }}</span>
        </div>
        <div class="text-[24px] font-extrabold text-white leading-none mb-1">
          {{ loading ? '—' : stat.value }}
        </div>
        <div class="text-[11px] font-medium text-ink-2">{{ stat.label }}</div>
        <div v-if="stat.sub" class="text-[10px] text-ink-3 mt-0.5">{{ stat.sub }}</div>
      </RouterLink>
    </div>

    <!-- Stats membres -->
    <div class="mb-8">
      <div class="section-title mb-3">Activité des membres</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <RouterLink
          v-for="stat in memberStats"
          :key="stat.label"
          to="/admin/statistiques"
          class="group bg-bg-1 border border-white/[0.06] rounded-xl p-4 hover:border-white/15 hover:-translate-y-0.5 transition-all"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="stat.color">
              <span class="w-4 h-4" v-html="stat.icon"></span>
            </div>
          </div>
          <div class="text-[24px] font-extrabold text-white leading-none mb-1">
            {{ loading ? '—' : stat.value.toLocaleString('fr-FR') }}
          </div>
          <div class="text-[11px] font-medium text-ink-2">{{ stat.label }}</div>
          <div v-if="stat.sub" class="text-[10px] text-ink-3 mt-0.5">{{ loading ? '' : stat.sub }}</div>
        </RouterLink>
      </div>
    </div>

    <!-- Deux colonnes : raccourcis + activité récente -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

      <!-- Raccourcis -->
      <div>
        <div class="section-title mb-3">Actions rapides</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <RouterLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="bg-bg-1 border border-white/[0.06] rounded-xl p-4 hover:border-white/15 hover:-translate-y-0.5 transition-all flex flex-col gap-2"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="link.color">
              <span class="w-4 h-4" v-html="link.icon"></span>
            </div>
            <div>
              <div class="text-[12px] font-semibold text-white">{{ link.label }}</div>
              <div class="text-[10px] text-ink-3 mt-0.5">{{ link.desc }}</div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Panneau latéral : état du site -->
      <div class="flex flex-col gap-3">

        <!-- État bêta -->
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
          <div class="text-[11px] font-bold text-ink-2 uppercase tracking-wide mb-3">État du site</div>
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center justify-between text-[12px]">
              <span class="text-ink-2">Mode bêta</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="betaStatus ? 'bg-orange/20 text-orange' : 'bg-bg-3 text-ink-3'"
              >{{ betaStatus ? 'Actif' : 'Inactif' }}</span>
            </div>
            <div class="flex items-center justify-between text-[12px]">
              <span class="text-ink-2">Bugs ouverts</span>
              <RouterLink to="/admin/beta" class="text-[10px] font-bold text-white hover:text-orange transition-colors">
                {{ loading ? '—' : counts.bugsOpen }} <span class="text-ink-3 font-normal">voir →</span>
              </RouterLink>
            </div>
            <div class="flex items-center justify-between text-[12px]">
              <span class="text-ink-2">Commentaires à modérer</span>
              <RouterLink to="/admin/commentaires" class="text-[10px] font-bold text-white hover:text-orange transition-colors">
                {{ loading ? '—' : counts.pending }} <span class="text-ink-3 font-normal">voir →</span>
              </RouterLink>
            </div>
            <div class="flex items-center justify-between text-[12px]">
              <span class="text-ink-2">Postes recrutement</span>
              <RouterLink to="/admin/recrutement" class="text-[10px] font-bold text-white hover:text-orange transition-colors">
                {{ loading ? '—' : counts.recruit }} ouverts <span class="text-ink-3 font-normal">→</span>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Liens admin système -->
        <div class="bg-bg-1 border border-white/[0.06] rounded-xl p-4">
          <div class="text-[11px] font-bold text-ink-2 uppercase tracking-wide mb-3">Administration</div>
          <div class="flex flex-col gap-1">
            <RouterLink
              v-for="link in systemLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2.5 px-2 py-2 rounded-lg text-[12px] text-ink-2 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <span class="w-4 h-4 shrink-0 text-ink-3" v-html="link.icon"></span>
              {{ link.label }}
              <svg class="w-3 h-3 ml-auto text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { useSettings } from '@/composables/useSettings.js'
import { useBeta } from '@/composables/useBeta.js'

const settings = useSettings()
const { betaEnabled: betaStatus } = useBeta()

const loading = ref(true)
const counts  = ref({
  series: 0, users: 0, news: 0,
  team: 0, pending: 0, recruit: 0, bugsOpen: 0, inprogress: 0,
  totalWatched: 0, totalWatchedCompleted: 0, totalMemberDownloads: 0, totalAchievements: 0,
})

onMounted(async () => {
  const [series, users, news, team, comments, recruit, bugs, inprogress, memberStats] = await Promise.allSettled([
    http.get('/series'),
    http.get('/auth/users'),
    http.get('/news'),
    http.get('/team'),
    http.get('/comments?admin=1'),
    http.get('/recruit'),
    http.get('/bugs?status=open&limit=0'),
    http.get('/inprogress'),
    http.get('/stats'),
  ])
  const val = r => (r.status === 'fulfilled' ? r.value : null)
  const arr = r => (Array.isArray(val(r)) ? val(r) : [])
  const ms  = val(memberStats) ?? {}
  counts.value = {
    series:               arr(series).length,
    users:                arr(users).length,
    news:                 arr(news).length,
    team:                 arr(team).length,
    pending:              arr(comments).filter(c => c.status === 'pending').length,
    recruit:              arr(recruit).filter(r => r.open).length,
    bugsOpen:             val(bugs)?.total ?? 0,
    inprogress:           arr(inprogress).length,
    totalWatched:         ms.totalWatched         ?? 0,
    totalWatchedCompleted:ms.totalWatchedCompleted ?? 0,
    totalMemberDownloads: ms.totalMemberDownloads  ?? 0,
    totalAchievements:    ms.totalAchievements     ?? 0,
  }
  loading.value = false
})

// ── Icônes ──────────────────────────────────────────────────────────
const ico = {
  series:   '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>',
  users:    '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>',
  news:     '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M10 6h8v4h-8z"/></svg>',
  team:     '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  comments: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  bug:      '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  chart:    '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
  star:     '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
  badge:    '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
  clock:    '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  analytics:'<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h3m14 0h3M12 2v3m0 14v3"/></svg>',
  recruit:  '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
}

const stats = [
  { label: 'Séries',       link: '/admin/series',       get value() { return counts.value.series   }, sub: 'catalogue',       color: 'bg-blue-500/15 text-blue-400',     icon: ico.series   },
  { label: 'Membres',      link: '/admin/utilisateurs', get value() { return counts.value.users    }, sub: 'inscrits',        color: 'bg-purple-500/15 text-purple-400', icon: ico.users    },
  { label: 'Actualités',   link: '/admin/news',         get value() { return counts.value.news     }, sub: 'articles',        color: 'bg-emerald-500/15 text-emerald-400', icon: ico.news   },
  { label: 'Équipe',       link: '/admin/equipe',       get value() { return counts.value.team     }, sub: 'membres actifs',  color: 'bg-yellow-500/15 text-yellow-400', icon: ico.team    },
  { label: 'Commentaires', link: '/admin/commentaires', get value() { return counts.value.pending  }, get alert() { return counts.value.pending  > 0 ? '!' : null }, sub: 'en attente',     color: 'bg-orange/15 text-orange',         icon: ico.comments },
  { label: 'Bugs',         link: '/admin/beta',         get value() { return counts.value.bugsOpen }, get alert() { return counts.value.bugsOpen > 0 ? String(counts.value.bugsOpen) : null }, sub: 'rapports ouverts', color: 'bg-red-500/15 text-red-400', icon: ico.bug },
  { label: 'Recrutement',  link: '/admin/recrutement',  get value() { return counts.value.recruit  }, sub: 'postes ouverts',  color: 'bg-cyan-500/15 text-cyan-400',    icon: ico.recruit  },
  { label: 'Avancement',   link: '/admin/avancement',   get value() { return counts.value.inprogress }, sub: 'séries en cours', color: 'bg-indigo-500/15 text-indigo-400', icon: ico.clock   },
]

const memberStats = [
  { label: 'Visionnages',   get value() { return counts.value.totalWatched          }, get sub() { return counts.value.totalWatchedCompleted + ' terminés' }, color: 'bg-sky-500/15 text-sky-400',    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>' },
  { label: 'Téléchargements', get value() { return counts.value.totalMemberDownloads }, sub: 'par les membres',                                              color: 'bg-teal-500/15 text-teal-400',  icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' },
  { label: 'Succès débloqués', get value() { return counts.value.totalAchievements  }, sub: 'toutes récompenses',                                           color: 'bg-amber-500/15 text-amber-400', icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' },
]

const quickLinks = [
  { to: '/admin/series',       label: 'Séries',        desc: 'Gérer le catalogue',    color: 'bg-blue-500/15 text-blue-400',     icon: ico.series   },
  { to: '/admin/news',         label: 'Actualités',    desc: 'Rédiger un article',    color: 'bg-emerald-500/15 text-emerald-400', icon: ico.news   },
  { to: '/admin/avancement',   label: 'Avancement',    desc: 'Traductions en cours',  color: 'bg-indigo-500/15 text-indigo-400', icon: ico.clock    },
  { to: '/admin/commentaires', label: 'Commentaires',  desc: 'Modérer',               color: 'bg-orange/15 text-orange',         icon: ico.comments },
  { to: '/admin/utilisateurs', label: 'Utilisateurs',  desc: 'Comptes & permissions', color: 'bg-purple-500/15 text-purple-400', icon: ico.users    },
  { to: '/admin/equipe',       label: 'Équipe',        desc: 'Gérer le staff',        color: 'bg-yellow-500/15 text-yellow-400', icon: ico.team     },
  { to: '/admin/recrutement',  label: 'Recrutement',   desc: 'Postes ouverts',        color: 'bg-cyan-500/15 text-cyan-400',     icon: ico.recruit  },
  { to: '/admin/beta',         label: 'Bêta / Bugs',   desc: 'Rapports & mode bêta', color: 'bg-red-500/15 text-red-400',       icon: ico.bug      },
  { to: '/admin/statistiques', label: 'Statistiques',  desc: 'Téléchargements',       color: 'bg-teal-500/15 text-teal-400',     icon: ico.chart    },
]

const systemLinks = [
  { to: '/admin/grades',        label: 'Grades & rôles',  icon: ico.badge    },
  { to: '/admin/succes',        label: 'Succès',          icon: ico.star     },
  { to: '/admin/analytics',     label: 'Analytics',       icon: ico.analytics},
  { to: '/admin/statistiques',  label: 'Statistiques',    icon: ico.chart    },
]
</script>
