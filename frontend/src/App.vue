<template>
  <div :class="['min-h-screen', 'text-ink-1', 'font-sans', 'flex', 'flex-col', layout === 'gundam' ? 'gh-root' : layout === 'flux' ? 'fx-root' : 'bg-bg-0']">

    <!-- Blips radar Gundam -->
    <div
      v-for="blip in radarBlips"
      :key="blip.id"
      class="gh-radar-blip"
      :style="{ left: blip.x + 'px', top: blip.y + 'px' }"
      aria-hidden="true"
    ></div>

    <!-- Orbes aurora FLUX 2026 -->
    <template v-if="layout === 'flux'">
      <div class="fx-aurora-orb fx-aurora-orb-1" aria-hidden="true"></div>
      <div class="fx-aurora-orb fx-aurora-orb-2" aria-hidden="true"></div>
      <div class="fx-aurora-orb fx-aurora-orb-3" aria-hidden="true"></div>
      <div class="fx-aurora-orb fx-aurora-orb-4" aria-hidden="true"></div>
    </template>

    <template v-if="isBlocked">
      <MaintenancePage />
    </template>
    <template v-else>
      <component :is="currentNavbar" />
      <main class="flex-1" :class="layout === 'gundam' ? 'pt-[59px]' : ''">
        <RouterView v-slot="{ Component, route }">
          <Transition v-if="!route.path.startsWith('/admin')" name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
          <component v-else :is="Component" />
        </RouterView>
      </main>
      <component :is="currentFooter" />
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
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue'
import AppNavbar       from '@/components/AppNavbar.vue'
import AppNavbarGlass  from '@/components/AppNavbarGlass.vue'
import AppNavbarGundam from '@/components/AppNavbarGundam.vue'
import AppNavbarFlux   from '@/components/AppNavbarFlux.vue'
import AppFooter       from '@/components/AppFooter.vue'
import AppFooterGundam from '@/components/AppFooterGundam.vue'
import AppFooterFlux   from '@/components/AppFooterFlux.vue'
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
const currentNavbar = computed(() => {
  if (layout.value === 'glass')  return AppNavbarGlass
  if (layout.value === 'gundam') return AppNavbarGundam
  if (layout.value === 'flux')   return AppNavbarFlux
  return AppNavbar
})
const currentFooter = computed(() => {
  if (layout.value === 'gundam') return AppFooterGundam
  if (layout.value === 'flux')   return AppFooterFlux
  return AppFooter
})

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

// ── Radar blips (thème Gundam) ───────────────────────────────────────────────
const radarBlips = ref([])
let blipSeq = 0
let blipTimer = null
const blipTimeouts = []

// Le radar tourne 360° en 5000ms (gh-radar-spin). Centre viewport : (innerWidth-170, innerHeight-170)
function spawnRadarBlip() {
  if (layout.value !== 'gundam') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const R  = 310
  const cx = window.innerWidth  - 170
  const cy = window.innerHeight - 170
  // Angle actuel du bras de balayage (0° = haut, sens horaire, période 5s)
  const sweepDeg = (Date.now() % 5000) / 5000 * 360
  const angleDeg = sweepDeg + (Math.random() * 50 - 25)
  const angleRad = angleDeg * Math.PI / 180
  const r  = R * (0.15 + Math.random() * 0.85)
  const x  = cx + r * Math.sin(angleRad)
  const y  = cy - r * Math.cos(angleRad)
  if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) return
  const id = blipSeq++
  radarBlips.value.push({ id, x, y })
  const t = setTimeout(() => { radarBlips.value = radarBlips.value.filter(b => b.id !== id) }, 2400)
  blipTimeouts.push(t)
}

function startBlips() { if (!blipTimer) blipTimer = setInterval(spawnRadarBlip, 900) }
function stopBlips()  {
  clearInterval(blipTimer)
  blipTimer = null
  blipTimeouts.splice(0).forEach(clearTimeout)
  radarBlips.value = []
}

function onVisibilityChange() {
  if (layout.value !== 'gundam') return
  document.hidden ? stopBlips() : startBlips()
}

watch(() => layout.value, (val, oldVal) => {
  if (oldVal === 'gundam' && val !== 'gundam') sessionStorage.removeItem('gh_booted')
  val === 'gundam' ? startBlips() : stopBlips()
}, { immediate: true })

onBeforeUnmount(() => {
  stopBlips()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

onMounted(async () => {
  await init()
  const token = localStorage.getItem('fansub_jwt')
  connect(token)
  socket.on('notification:new', prependNotif)
  window.addEventListener('auth:logout', logout)
  document.addEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform .25s ease, opacity .25s ease; }
.slide-up-enter-from, .slide-up-leave-to       { transform: translateY(100%); opacity: 0; }

/* ── Transitions de page ── */
.page-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.page-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.page-enter-from   { opacity: 0; transform: translateY(8px); }
.page-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ── Radar blips ── */
.gh-radar-blip {
  position: fixed;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
  background: rgb(244, 117, 33);
  box-shadow: 0 0 8px rgba(244,117,33,0.9), 0 0 18px rgba(244,117,33,0.5);
  animation: gh-blip 2.4s ease-out forwards;
}
/* Anneau expansif autour du blip */
.gh-radar-blip::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid rgba(244,117,33,0.7);
  animation: gh-blip-ring 2.4s ease-out forwards;
}
</style>
