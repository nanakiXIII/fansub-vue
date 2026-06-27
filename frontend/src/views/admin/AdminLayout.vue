<template>
  <div class="flex min-h-[calc(100vh-3.5rem)]">

    <!-- Sidebar desktop -->
    <aside class="w-56 shrink-0 bg-bg-1 border-r border-white/[0.07] sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:flex flex-col">
      <div class="px-3 py-4 flex flex-col flex-1 gap-5">

        <div v-for="group in visibleGroups" :key="group.label">
          <div class="text-[9px] font-bold text-ink-3 uppercase tracking-widest mb-1.5 px-2">{{ group.label }}</div>
          <nav class="flex flex-col gap-0.5">
            <RouterLink
              v-for="link in group.links"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium text-ink-2 hover:text-white hover:bg-white/[0.06] transition-colors"
              :class="{ '!text-white !bg-white/[0.08]': isActive(link.to) }"
            >
              <span class="w-4 h-4 shrink-0 flex items-center justify-center" v-html="link.icon"></span>
              <span class="flex-1 truncate">{{ link.label }}</span>
              <span
                v-if="link.badge"
                class="text-[9px] font-bold px-1.5 py-px rounded-full leading-none"
                :class="link.badgeClass || 'bg-orange/20 text-orange'"
              >{{ link.badge }}</span>
            </RouterLink>
          </nav>
        </div>

        <div class="mt-auto pt-3 border-t border-white/[0.07]">
          <RouterLink
            to="/"
            class="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-ink-3 hover:text-white transition-colors"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            Retour au site
          </RouterLink>
        </div>
      </div>
    </aside>

    <!-- Mobile nav (bottom bar) -->
    <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-1 border-t border-white/[0.07] flex overflow-x-auto">
      <RouterLink
        v-for="link in allVisibleLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center gap-0.5 px-3 py-2 text-[9px] font-medium text-ink-3 hover:text-white transition-colors shrink-0 relative"
        :class="{ '!text-orange': isActive(link.to) }"
      >
        <span class="w-4 h-4" v-html="link.icon"></span>
        {{ link.shortLabel }}
        <span v-if="link.badge" class="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-orange"></span>
      </RouterLink>
    </div>

    <!-- Contenu principal -->
    <main class="flex-1 min-w-0 p-5 pb-20 lg:pb-5">

      <!-- Bannière mise à jour GitHub -->
      <Transition name="slide-banner">
        <div
          v-if="version.hasUpdate.value && !version.isDismissed.value"
          class="mb-4 flex items-center gap-3 bg-sky-950/70 border border-sky-500/30 rounded-xl px-4 py-3 text-[12px]"
        >
          <svg class="w-4 h-4 shrink-0 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span class="text-sky-200 flex-1">
            Mise à jour disponible —
            <span class="font-mono text-sky-400">{{ version.localHash }}</span>
            <span class="text-sky-500 mx-1">→</span>
            <span class="font-mono text-white">{{ version.remoteHash.value }}</span>
          </span>
          <a
            :href="`https://github.com/nanakiXIII/fansub-vue/compare/${version.localHash}...main`"
            target="_blank"
            rel="noopener"
            class="shrink-0 text-[11px] font-semibold text-sky-300 hover:text-white transition-colors"
          >
            Voir les changements →
          </a>
          <button
            @click="version.dismiss()"
            class="shrink-0 ml-1 text-sky-600 hover:text-sky-200 transition-colors"
            title="Ignorer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </Transition>

      <RouterView />
    </main>
  </div>

  <AdminDialog />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettings }   from '@/composables/useSettings.js'
import { useGitVersion } from '@/composables/useGitVersion.js'
import AdminDialog from '@/components/AdminDialog.vue'

const route    = useRoute()
const settings = useSettings()
const version  = useGitVersion()

const groups = [
  {
    label: 'Contenu',
    links: [
      {
        to: '/admin/series', label: 'Séries', shortLabel: 'Séries',
        permission: ['series.create', 'series.edit', 'series.delete'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>',
      },
      {
        to: '/admin/news', label: 'Actualités', shortLabel: 'News',
        permission: ['news.create', 'news.edit', 'news.delete'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/></svg>',
      },
      {
        to: '/admin/avancement', label: 'Avancement', shortLabel: 'Avanc.',
        permission: ['inprogress.manage'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      },
    ],
  },
  {
    label: 'Communauté',
    links: [
      {
        to: '/admin/commentaires', label: 'Commentaires', shortLabel: 'Comm.',
        permission: ['comments.moderate'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      },
      {
        to: '/admin/utilisateurs', label: 'Utilisateurs', shortLabel: 'Users',
        permission: ['users.view'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>',
      },
      {
        to: '/admin/equipe', label: 'Équipe', shortLabel: 'Équipe',
        permission: ['team.manage'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      },
      {
        to: '/admin/recrutement', label: 'Recrutement', shortLabel: 'Recru.',
        permission: ['recruit.manage'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
      },
    ],
  },
  {
    label: 'Administration',
    links: [
      {
        to: '/admin/grades', label: 'Grades', shortLabel: 'Grades',
        adminOnly: true,
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
      },
      {
        to: '/admin/succes', label: 'Succès', shortLabel: 'Succès',
        permission: ['achievements.manage'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
      },
      {
        to: '/admin/analytics', label: 'Analytics', shortLabel: 'Analytcs',
        permission: ['analytics.view'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h3m14 0h3M12 2v3m0 14v3"/><path d="M8 8l1.5 1.5M14.5 14.5 16 16M16 8l-1.5 1.5M9.5 14.5 8 16"/></svg>',
      },
      {
        to: '/admin/statistiques', label: 'Statistiques', shortLabel: 'Stats',
        permission: ['stats.view'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
      },
      {
        to: '/admin/beta', label: 'Bêta / Bugs', shortLabel: 'Bêta',
        permission: ['beta.manage'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      },
      {
        to: '/admin/alertes', label: 'Alertes', shortLabel: 'Alertes',
        permission: ['alerts.manage'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      },
      {
        to: '/admin/audit', label: "Logs d'audit", shortLabel: 'Audit',
        permission: ['audit.view'],
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
      },
      {
        to: '/admin/api-tester', label: 'API Tester', shortLabel: 'API',
        adminOnly: true,
        icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      },
    ],
  },
]

// Lien dashboard séparé (toujours en premier)
const dashboardLink = {
  to: '/admin', label: 'Tableau de bord', shortLabel: 'Board',
  icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
}

function canSee(link) {
  const { isAdmin, permissions } = settings
  if (link.adminOnly) return isAdmin
  if (!link.permission) return true
  if (isAdmin) return true
  return link.permission.some(p => permissions.includes(p))
}

const visibleGroups = computed(() => {
  const result = [
    {
      label: 'Navigation',
      links: [dashboardLink],
    },
  ]
  for (const g of groups) {
    if (g.adminOnly && !settings.isAdmin) continue
    const links = g.links.filter(canSee)
    if (links.length) result.push({ label: g.label, links })
  }
  return result
})

const allVisibleLinks = computed(() =>
  visibleGroups.value.flatMap(g => g.links)
)

function isActive(to) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}
</script>

<style scoped>
.slide-banner-enter-active { transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.2s ease; }
.slide-banner-leave-active { transition: opacity 0.15s ease, transform 0.15s ease, max-height 0.15s ease; }
.slide-banner-enter-from, .slide-banner-leave-to { opacity: 0; transform: translateY(-6px); max-height: 0; }
.slide-banner-enter-to, .slide-banner-leave-from { max-height: 80px; }
</style>
