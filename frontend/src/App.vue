<template>
  <div class="min-h-screen bg-bg-0 text-ink-1 font-sans flex flex-col">
    <template v-if="isBlocked">
      <MaintenancePage />
    </template>
    <template v-else>
      <component :is="currentNavbar" />
      <main class="flex-1">
        <RouterView />
      </main>
      <AppFooter />
      <CookieBanner />
      <AchievementToast />
      <AppToast />
      <ChatWidget />
      <BugReportWidget />
    </template>
    <!-- Toujours monté pour recevoir les alertes et les mises à jour settings -->
    <SiteAlert />

    <!-- Bandeau maintenance visible uniquement pour les admins -->
    <Transition name="slide-up">
      <div
        v-if="maintenanceEnabled && settings.isAdmin"
        class="fixed bottom-0 left-0 right-0 z-[9990] flex items-center justify-between gap-3 px-4 py-2.5 bg-red-950/95 border-t border-red-500/30 backdrop-blur-sm"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0"></span>
          <span class="text-[12px] font-semibold text-red-200 truncate">
            Mode maintenance actif — les visiteurs voient une page de maintenance
          </span>
        </div>
        <RouterLink
          to="/admin/beta"
          class="shrink-0 text-[11px] font-bold px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors whitespace-nowrap"
        >
          Gérer →
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import AppNavbar       from '@/components/AppNavbar.vue'
import AppNavbarGlass  from '@/components/AppNavbarGlass.vue'
import AppFooter       from '@/components/AppFooter.vue'
import CookieBanner    from '@/components/CookieBanner.vue'
import AchievementToast from '@/components/AchievementToast.vue'
import AppToast         from '@/components/AppToast.vue'
import ChatWidget      from '@/components/ChatWidget.vue'
import BugReportWidget from '@/components/BugReportWidget.vue'
import SiteAlert       from '@/components/SiteAlert.vue'
import MaintenancePage from '@/components/MaintenancePage.vue'
import { useAuth }     from '@/composables/useAuth.js'
import { useSocket }   from '@/composables/useSocket.js'
import { useSettings } from '@/composables/useSettings.js'
import { layout }      from '@/composables/useTheme.js'
import { useFollows }  from '@/composables/useFollows.js'
import { useNotifications } from '@/composables/useNotifications.js'
import { useBeta }     from '@/composables/useBeta.js'

const { init, logout } = useAuth()
const { connect, socket } = useSocket()
const settings    = useSettings()
const { load: loadFollows, reset: resetFollows } = useFollows()
const { load: loadNotifs, reset: resetNotifs, prepend: prependNotif } = useNotifications()
const { maintenanceEnabled, maintenanceAllowedRoles } = useBeta()
const currentNavbar = computed(() => layout.value === 'glass' ? AppNavbarGlass : AppNavbar)

// Bloqué si maintenance active ET pas admin ET rôle non autorisé
const isBlocked = computed(() => {
  if (!maintenanceEnabled.value) return false
  if (settings.isAdmin) return false
  if (settings.role && maintenanceAllowedRoles.value.includes(settings.role)) return false
  return true
})

watch(() => settings.uid, (uid) => {
  if (uid) { loadFollows(uid); loadNotifs(uid) }
  else      { resetFollows(); resetNotifs() }
})

onMounted(async () => {
  await init()
  const token = localStorage.getItem('fansub_jwt')
  connect(token)
  socket.on('notification:new', prependNotif)
  window.addEventListener('auth:logout', logout)
})
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform .25s ease, opacity .25s ease; }
.slide-up-enter-from, .slide-up-leave-to       { transform: translateY(100%); opacity: 0; }
</style>
