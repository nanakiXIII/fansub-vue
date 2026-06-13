<template>
  <nav class="sticky top-0 z-50 bg-bg-1/95 backdrop-blur-md border-b border-white/[0.07]">
    <div class="h-14 flex items-center px-6 gap-6">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 shrink-0" @click="mobileMenuOpen = false">
        <div class="w-8 h-8 bg-orange rounded-full flex items-center justify-center">
          <svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 16 16">
            <path d="M3 2l10 6-10 6V2z"/>
          </svg>
        </div>
        <span class="site-title text-[17px] font-extrabold tracking-tight">
          {{ config.siteName }}
        </span>
      </RouterLink>

      <!-- Nav links (desktop) -->
      <div class="hidden lg:flex flex-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-[14px] font-medium text-ink-2 px-3 h-14 flex items-center border-b-2 border-transparent hover:text-white transition-colors"
          active-class="!text-white !border-orange"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="flex-1 lg:hidden"></div>

      <!-- Bouton Chat (desktop) -->
      <RouterLink
        to="/chat"
        class="hidden lg:flex relative w-9 h-9 items-center justify-center rounded-lg text-ink-2 hover:text-white hover:bg-bg-2 transition-colors shrink-0"
        active-class="!text-white !bg-bg-2"
        aria-label="Chat"
      >
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span
          v-if="chatUnread > 0"
          class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none"
        >{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <!-- Cloche notifications (desktop, connecté uniquement) -->
      <NotificationBell v-if="settings.uid" class="hidden lg:flex" />

      <!-- Actions (desktop) — dropdown Profil -->
      <div class="hidden lg:block relative shrink-0" ref="profileRef">
        <button
          @click="profileOpen = !profileOpen"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-medium transition-colors"
          :class="profileOpen ? 'bg-bg-2 text-white' : 'text-ink-2 hover:bg-bg-2 hover:text-white'"
        >
          <!-- Avatar ou icône -->
          <template v-if="settings.uid">
            <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                 :style="isImageUrl(settings.avatar) ? {} : { background: settings.avatar || defaultAvatar }">
              <img loading="lazy" v-if="isImageUrl(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover" />
              <span v-else>{{ navInitials }}</span>
            </div>
          </template>
          <svg v-else class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>
          </svg>
          <span v-if="settings.uid" class="flex items-center gap-1.5">
            <span v-if="settings.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none">ADMIN</span>
            <span v-else-if="settings.roleLabel" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.roleColor ? { background: settings.roleColor + '33', color: settings.roleColor } : { background: 'rgb(var(--color-bg-3))', color: 'rgb(var(--color-ink-2))' }">{{ settings.roleLabel }}</span>
            <span v-if="settings.activeTitle?.label" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.activeTitle.color ? { background: settings.activeTitle.color + '33', color: settings.activeTitle.color } : { background: 'rgb(var(--color-bg-3))', color: 'rgb(var(--color-ink-2))' }">{{ settings.activeTitle.label }}</span>
            {{ settings.username }}
          </span>
          <span v-else-if="settings.username" class="flex items-center gap-1.5">
            <span v-if="settings.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none">ADMIN</span>
            {{ settings.username }}
            <span class="text-ink-3 font-normal">(local)</span>
          </span>
          <span v-else class="flex items-center gap-1.5">
            <span v-if="settings.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none">ADMIN</span>
            Profil
          </span>
          <svg
            class="w-3 h-3 shrink-0 transition-transform duration-150"
            :class="profileOpen ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="prof-drop">
          <div
            v-if="profileOpen"
            class="absolute right-0 top-full mt-2 w-44 bg-bg-1 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden"
          >
            <RouterLink
              to="/profil"
              class="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-ink-1 hover:bg-white/[0.05] transition-colors"
              @click="profileOpen = false"
            >
              <svg class="w-3.5 h-3.5 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>
              </svg>
              <span v-if="settings.uid">{{ settings.username }}</span>
              <span v-else-if="settings.username" class="flex items-center gap-1.5">
                {{ settings.username }}
                <span class="text-ink-3 font-normal text-[10px]">(local)</span>
              </span>
              <span v-else>Mon profil</span>
            </RouterLink>

            <template v-if="settings.isAdmin || settings.permissions?.length">
              <div class="h-px bg-white/[0.07] mx-3"></div>
              <RouterLink
                to="/admin"
                class="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-orange hover:bg-white/[0.05] transition-colors"
                @click="profileOpen = false"
              >
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Administration
              </RouterLink>
            </template>

            <div class="h-px bg-white/[0.07] mx-3"></div>

            <!-- Connecté → Se déconnecter -->
            <template v-if="settings.uid">
              <button
                class="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-red-400 hover:bg-white/[0.05] transition-colors"
                @click="handleLogout"
              >
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Se déconnecter
              </button>
            </template>

            <!-- Non connecté → S'enregistrer + Connexion -->
            <template v-else>
              <RouterLink
                to="/inscription"
                class="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-ink-1 hover:bg-white/[0.05] transition-colors"
                @click="profileOpen = false"
              >
                <svg class="w-3.5 h-3.5 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                S'enregistrer
              </RouterLink>
              <RouterLink
                to="/connexion"
                class="flex items-center gap-2.5 px-3.5 py-2.5 text-[12px] font-medium text-ink-1 hover:bg-white/[0.05] transition-colors"
                @click="profileOpen = false"
              >
                <svg class="w-3.5 h-3.5 text-ink-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Connexion
              </RouterLink>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Bouton Chat (mobile) -->
      <RouterLink
        to="/chat"
        class="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-lg text-ink-2 hover:text-white hover:bg-bg-2 transition-colors shrink-0"
        aria-label="Chat"
        @click="mobileMenuOpen = false"
      >
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span
          v-if="chatUnread > 0"
          class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none"
        >{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <!-- Cloche notifications (mobile, connecté uniquement) -->
      <NotificationBell v-if="settings.uid" class="lg:hidden" />

      <!-- Bouton menu (mobile) -->
      <button
        class="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-ink-2 hover:text-white hover:bg-bg-2 transition-colors shrink-0"
        @click="mobileMenuOpen = !mobileMenuOpen"
        :aria-expanded="mobileMenuOpen"
        aria-label="Ouvrir le menu de navigation"
      >
        <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Menu déroulant (mobile) -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-white/[0.07] bg-bg-1 px-6 py-3">
        <div class="flex flex-col gap-1 mb-3">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-[13px] font-medium text-ink-2 px-3 py-2.5 rounded-lg hover:text-white hover:bg-bg-2 transition-colors"
            active-class="!text-white !bg-bg-2"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </RouterLink>
        </div>
        <div class="flex flex-col gap-1 pt-3 border-t border-white/[0.07]">
          <RouterLink
            to="/profil"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-ink-2 hover:text-white hover:bg-bg-2 transition-colors"
            active-class="!text-white !bg-bg-2"
            @click="mobileMenuOpen = false"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>
            </svg>
            <span v-if="settings.uid" class="flex items-center gap-1.5">
              {{ settings.username }}
              <span v-if="settings.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none">ADMIN</span>
              <span v-else-if="settings.roleLabel" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.roleColor ? { background: settings.roleColor + '33', color: settings.roleColor } : { background: 'rgb(var(--color-bg-3))', color: 'rgb(var(--color-ink-2))' }">{{ settings.roleLabel }}</span>
              <span v-if="settings.activeTitle?.label" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.activeTitle.color ? { background: settings.activeTitle.color + '33', color: settings.activeTitle.color } : { background: 'rgb(var(--color-bg-3))', color: 'rgb(var(--color-ink-2))' }">{{ settings.activeTitle.label }}</span>
            </span>
            <span v-else-if="settings.username" class="flex items-center gap-1.5">
              {{ settings.username }}
              <span class="text-ink-3 font-normal">(local)</span>
            </span>
            <span v-else>Mon profil</span>
          </RouterLink>

          <template v-if="settings.isAdmin || settings.permissions?.length">
            <RouterLink
              to="/admin"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-orange hover:bg-bg-2 transition-colors"
              active-class="!bg-bg-2"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Administration
            </RouterLink>
          </template>

          <!-- Connecté → Se déconnecter -->
          <template v-if="settings.uid">
            <button
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-red-400 hover:bg-bg-2 transition-colors w-full"
              @click="handleLogout"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </template>

          <!-- Non connecté → S'enregistrer + Connexion -->
          <template v-else>
            <RouterLink
              to="/inscription"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-ink-2 hover:text-white hover:bg-bg-2 transition-colors"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              S'enregistrer
            </RouterLink>
            <RouterLink
              to="/connexion"
              class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-ink-2 hover:text-white hover:bg-bg-2 transition-colors"
              @click="mobileMenuOpen = false"
            >
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Connexion
            </RouterLink>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { config } from '@/config.js'
import { useSettings } from '@/composables/useSettings.js'
import { useAuth } from '@/composables/useAuth.js'
import { useChat } from '@/composables/useChat.js'
import NotificationBell from '@/components/NotificationBell.vue'

const settings       = useSettings()
const { logout }     = useAuth()
const { unread: chatUnread } = useChat()
const router         = useRouter()
const mobileMenuOpen = ref(false)
const profileOpen    = ref(false)
const profileRef     = ref(null)

const defaultAvatar = 'linear-gradient(135deg,#f97316,#fb923c)'
const navInitials   = computed(() =>
  (settings.username ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '?'
)
function isImageUrl(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('https') || val.startsWith('data:'))
}

const navLinks = [
  { to: '/',          label: 'Accueil'    },
  { to: '/catalogue', label: 'Catalogue'  },
  { to: '/equipe',    label: 'Équipe'     },
]

function onOutsideClick(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    profileOpen.value = false
  }
}

function handleLogout() {
  logout()
  profileOpen.value    = false
  mobileMenuOpen.value = false
  router.push('/')
}

onMounted(() => document.addEventListener('click', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))
</script>

<style scoped>
.site-title {
  background: linear-gradient(90deg,
    rgb(var(--color-orange)) 0%,
    rgb(var(--color-ink-1)) 25%,
    rgb(var(--color-orange-hover)) 50%,
    rgb(var(--color-ink-1)) 75%,
    rgb(var(--color-orange)) 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: site-title-shimmer 6s linear infinite;
}
@keyframes site-title-shimmer {
  to { background-position: -200% center; }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.prof-drop-enter-active,
.prof-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.prof-drop-enter-from,
.prof-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
