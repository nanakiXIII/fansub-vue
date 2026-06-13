<template>
  <nav class="glass-navbar sticky top-0 z-50">
    <div class="h-16 flex items-center px-6 gap-6">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 shrink-0" @click="mobileMenuOpen = false">
        <div class="glass-orb w-9 h-9 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 fill-white drop-shadow" viewBox="0 0 16 16">
            <path d="M3 2l10 6-10 6V2z"/>
          </svg>
        </div>
        <span class="glass-title text-[18px] font-extrabold tracking-tight">
          {{ config.siteName }}
        </span>
      </RouterLink>

      <!-- Nav links (desktop) -->
      <div class="hidden lg:flex flex-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="glass-nav-link text-[14px] font-medium px-4 h-16 flex items-center"
          active-class="glass-nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="flex-1 lg:hidden"></div>

      <!-- Chat (desktop) -->
      <RouterLink
        to="/chat"
        class="hidden lg:flex relative w-9 h-9 items-center justify-center rounded-xl glass-icon-btn shrink-0"
        active-class="glass-icon-btn--active"
        aria-label="Chat"
      >
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <!-- Cloche notifications (desktop) -->
      <NotificationBell v-if="settings.uid" class="hidden lg:flex" />

      <!-- Profil dropdown (desktop) -->
      <div class="hidden lg:block relative shrink-0" ref="profileRef">
        <button
          @click="profileOpen = !profileOpen"
          class="glass-profile-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-[14px] font-medium transition-all"
          :class="profileOpen ? 'glass-profile-btn--open' : ''"
        >
          <template v-if="settings.uid">
            <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                 :style="isImageUrl(settings.avatar) ? {} : { background: settings.avatar || defaultAvatar }">
              <img loading="lazy" v-if="isImageUrl(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover" />
              <span v-else>{{ navInitials }}</span>
            </div>
          </template>
          <svg v-else class="w-4 h-4 shrink-0 text-ink-2" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>
          </svg>
          <span v-if="settings.uid" class="flex items-center gap-1.5 text-ink-1">
            <span v-if="settings.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none">ADMIN</span>
            <span v-else-if="settings.roleLabel" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.roleColor ? { background: settings.roleColor + '33', color: settings.roleColor } : {}">{{ settings.roleLabel }}</span>
            <span v-if="settings.activeTitle?.label" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.activeTitle.color ? { background: settings.activeTitle.color + '33', color: settings.activeTitle.color } : {}">{{ settings.activeTitle.label }}</span>
            {{ settings.username }}
          </span>
          <span v-else-if="settings.username" class="text-ink-1">{{ settings.username }}</span>
          <span v-else class="text-ink-2">Profil</span>
          <svg class="w-3 h-3 text-ink-3 shrink-0 transition-transform duration-150" :class="profileOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="glass-drop">
          <div v-if="profileOpen" class="glass-dropdown absolute right-0 top-full mt-2 w-48">
            <RouterLink to="/profil" class="glass-menu-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
              <span v-if="settings.uid">{{ settings.username }}</span>
              <span v-else-if="settings.username" class="flex items-center gap-1.5">{{ settings.username }} <span class="text-ink-3 text-[10px]">(local)</span></span>
              <span v-else>Mon profil</span>
            </RouterLink>
            <template v-if="settings.isAdmin || settings.permissions?.length">
              <div class="glass-divider"></div>
              <RouterLink to="/admin" class="glass-menu-item text-orange" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Administration
              </RouterLink>
            </template>
            <div class="glass-divider"></div>
            <template v-if="settings.uid">
              <button class="glass-menu-item text-red-400 w-full" @click="handleLogout">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </template>
            <template v-else>
              <RouterLink to="/inscription" class="glass-menu-item" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                S'enregistrer
              </RouterLink>
              <RouterLink to="/connexion" class="glass-menu-item" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </RouterLink>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Chat (mobile) -->
      <RouterLink to="/chat" class="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-xl glass-icon-btn shrink-0" aria-label="Chat" @click="mobileMenuOpen = false">
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <!-- Cloche (mobile) -->
      <NotificationBell v-if="settings.uid" class="lg:hidden" />

      <!-- Burger (mobile) -->
      <button class="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl glass-icon-btn shrink-0" @click="mobileMenuOpen = !mobileMenuOpen" :aria-expanded="mobileMenuOpen" aria-label="Menu">
        <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Menu mobile -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="lg:hidden glass-mobile-menu px-6 py-4">
        <div class="flex flex-col gap-0.5 mb-3">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="glass-menu-item text-[13px]" active-class="glass-menu-item--active" @click="mobileMenuOpen = false">
            {{ link.label }}
          </RouterLink>
        </div>
        <div class="glass-divider mb-3"></div>
        <div class="flex flex-col gap-0.5">
          <RouterLink to="/profil" class="glass-menu-item text-[13px]" active-class="glass-menu-item--active" @click="mobileMenuOpen = false">
            <svg class="w-4 h-4 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
            <span v-if="settings.uid">{{ settings.username }}</span>
            <span v-else-if="settings.username">{{ settings.username }} <span class="text-ink-3">(local)</span></span>
            <span v-else>Mon profil</span>
          </RouterLink>
          <template v-if="settings.isAdmin || settings.permissions?.length">
            <RouterLink to="/admin" class="glass-menu-item text-[13px] text-orange" active-class="glass-menu-item--active" @click="mobileMenuOpen = false">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Administration
            </RouterLink>
          </template>
          <template v-if="settings.uid">
            <button class="glass-menu-item text-[13px] text-red-400 w-full" @click="handleLogout">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Se déconnecter
            </button>
          </template>
          <template v-else>
            <RouterLink to="/inscription" class="glass-menu-item text-[13px]" @click="mobileMenuOpen = false">S'enregistrer</RouterLink>
            <RouterLink to="/connexion" class="glass-menu-item text-[13px]" @click="mobileMenuOpen = false">Connexion</RouterLink>
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
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'))
}

const navLinks = [
  { to: '/',          label: 'Accueil'   },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/equipe',    label: 'Équipe'    },
]

function onOutsideClick(e) {
  if (profileRef.value && !profileRef.value.contains(e.target)) profileOpen.value = false
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
.glass-navbar {
  background: rgba(var(--color-bg-0), 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 0 2px 32px rgba(0, 0, 0, 0.35);
}
.glass-orb {
  background: rgb(var(--color-orange));
  box-shadow: 0 0 12px rgba(var(--color-orange), 0.5), 0 0 24px rgba(var(--color-orange), 0.2);
}
.glass-title {
  background: linear-gradient(90deg, rgb(var(--color-orange)) 0%, rgb(var(--color-ink-1)) 30%, rgb(var(--color-orange-hover)) 60%, rgb(var(--color-ink-1)) 80%, rgb(var(--color-orange)) 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: shimmer 6s linear infinite;
  filter: drop-shadow(0 0 8px rgba(var(--color-orange), 0.3));
}
@keyframes shimmer { to { background-position: -200% center; } }

.glass-nav-link {
  color: rgb(var(--color-ink-2));
  position: relative;
  transition: color 0.2s;
}
.glass-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgb(var(--color-orange)), transparent);
  box-shadow: 0 0 8px rgba(var(--color-orange), 0.6);
  border-radius: 2px;
  transition: transform 0.25s ease;
}
.glass-nav-link:hover { color: white; }
.glass-nav-link:hover::after { transform: translateX(-50%) scaleX(0.6); }
.glass-nav-link--active { color: white !important; }
.glass-nav-link--active::after { transform: translateX(-50%) scaleX(1) !important; }

.glass-icon-btn {
  color: rgb(var(--color-ink-2));
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.2s;
}
.glass-icon-btn:hover, .glass-icon-btn--active {
  color: white;
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 0 12px rgba(var(--color-orange), 0.1);
}

.glass-profile-btn {
  color: rgb(var(--color-ink-2));
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;
}
.glass-profile-btn:hover, .glass-profile-btn--open {
  color: white;
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: 0 0 16px rgba(var(--color-orange), 0.08);
}

.glass-dropdown {
  background: rgba(var(--color-bg-1), 0.75);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.glass-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--color-ink-1));
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.glass-menu-item:hover { background: rgba(255, 255, 255, 0.06); color: white; }
.glass-menu-item--active { background: rgba(var(--color-orange), 0.08); color: white; }

.glass-divider { height: 1px; background: rgba(255, 255, 255, 0.07); margin: 2px 12px; }

.glass-mobile-menu {
  background: rgba(var(--color-bg-0), 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.glass-drop-enter-active, .glass-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.glass-drop-enter-from, .glass-drop-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }
.mobile-menu-enter-active, .mobile-menu-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
