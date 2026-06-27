<template>
  <nav class="flux-navbar sticky top-0 z-50">
    <div class="h-16 flex items-center px-6 gap-6">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 shrink-0" @click="mobileMenuOpen = false">
        <div class="flux-orb w-9 h-9 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 fill-white drop-shadow" viewBox="0 0 16 16">
            <path d="M3 2l10 6-10 6V2z"/>
          </svg>
        </div>
        <span class="flux-title text-[18px] font-extrabold tracking-tight">
          {{ config.siteName }}
        </span>
      </RouterLink>

      <!-- Nav links (desktop) -->
      <div class="hidden lg:flex flex-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="flux-nav-link text-[14px] font-medium px-4 h-16 flex items-center"
          active-class="flux-nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="flex-1 lg:hidden"></div>

      <!-- Chat (desktop) -->
      <RouterLink
        to="/chat"
        class="hidden lg:flex relative w-9 h-9 items-center justify-center rounded-xl flux-icon-btn shrink-0"
        active-class="flux-icon-btn--active"
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
          class="flux-profile-btn flex items-center gap-2 px-3 py-1.5 rounded-xl text-[14px] font-medium transition-all"
          :class="profileOpen ? 'flux-profile-btn--open' : ''"
        >
          <template v-if="settings.uid">
            <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
                 :style="isImageUrl(settings.avatar) ? {} : { background: settings.avatar || defaultAvatar }">
              <img loading="lazy" v-if="isImageUrl(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover" />
              <span v-else>{{ navInitials }}</span>
            </div>
          </template>
          <svg v-else class="w-4 h-4 shrink-0 text-white/40" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>
          </svg>
          <span v-if="settings.uid" class="flex items-center gap-1.5 text-white/90">
            <span v-if="settings.isAdmin" class="text-[9px] font-bold bg-purple-500/20 text-purple-300 rounded px-1.5 py-px leading-none">ADMIN</span>
            <span v-else-if="settings.roleLabel" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.roleColor ? { background: settings.roleColor + '33', color: settings.roleColor } : {}">{{ settings.roleLabel }}</span>
            <span v-if="settings.activeTitle?.label" class="text-[9px] font-bold rounded px-1.5 py-px leading-none" :style="settings.activeTitle.color ? { background: settings.activeTitle.color + '33', color: settings.activeTitle.color } : {}">{{ settings.activeTitle.label }}</span>
            {{ settings.username }}
          </span>
          <span v-else-if="settings.username" class="text-white/90">{{ settings.username }}</span>
          <span v-else class="text-white/40">Profil</span>
          <svg class="w-3 h-3 text-white/30 shrink-0 transition-transform duration-150" :class="profileOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="flux-drop">
          <div v-if="profileOpen" class="flux-dropdown absolute right-0 top-full mt-2 w-48">
            <RouterLink to="/profil" class="flux-menu-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
              Mon profil
            </RouterLink>
            <RouterLink to="/profil?tab=activity" class="flux-menu-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Activité
            </RouterLink>
            <RouterLink to="/profil?tab=settings" class="flux-menu-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Paramètres
            </RouterLink>
            <template v-if="settings.isAdmin || settings.permissions?.length">
              <div class="flux-divider"></div>
              <RouterLink to="/admin" class="flux-menu-item flux-menu-admin" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Administration
              </RouterLink>
            </template>
            <div class="flux-divider"></div>
            <template v-if="settings.uid">
              <button class="flux-menu-item text-red-400 w-full" @click="handleLogout">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </template>
            <template v-else>
              <RouterLink to="/inscription" class="flux-menu-item" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                S'enregistrer
              </RouterLink>
              <RouterLink to="/connexion" class="flux-menu-item" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </RouterLink>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Chat (mobile) -->
      <RouterLink to="/chat" class="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-xl flux-icon-btn shrink-0" aria-label="Chat" @click="mobileMenuOpen = false">
        <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <!-- Cloche (mobile) -->
      <NotificationBell v-if="settings.uid" class="lg:hidden" />

      <!-- Burger (mobile) -->
      <button class="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl flux-icon-btn shrink-0" @click="mobileMenuOpen = !mobileMenuOpen" :aria-expanded="mobileMenuOpen" aria-label="Menu">
        <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Menu mobile -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen" class="lg:hidden flux-mobile-menu px-6 py-4">
        <div class="flex flex-col gap-0.5 mb-3">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="flux-menu-item text-[13px]" active-class="flux-menu-item--active" @click="mobileMenuOpen = false">
            {{ link.label }}
          </RouterLink>
        </div>
        <div class="flux-divider mb-3"></div>
        <div class="flex flex-col gap-0.5">
          <RouterLink to="/profil" class="flux-menu-item text-[13px]" active-class="flux-menu-item--active" @click="mobileMenuOpen = false">
            <svg class="w-4 h-4 shrink-0 opacity-50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
            Mon profil
          </RouterLink>
          <template v-if="settings.isAdmin || settings.permissions?.length">
            <RouterLink to="/admin" class="flux-menu-item text-[13px] flux-menu-admin" active-class="flux-menu-item--active" @click="mobileMenuOpen = false">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Administration
            </RouterLink>
          </template>
          <template v-if="settings.uid">
            <button class="flux-menu-item text-[13px] text-red-400 w-full" @click="handleLogout">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Se déconnecter
            </button>
          </template>
          <template v-else>
            <RouterLink to="/inscription" class="flux-menu-item text-[13px]" @click="mobileMenuOpen = false">S'enregistrer</RouterLink>
            <RouterLink to="/connexion" class="flux-menu-item text-[13px]" @click="mobileMenuOpen = false">Connexion</RouterLink>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { config } from '@/config.js'
import { useNavbar } from '@/composables/useNavbar.js'
import NotificationBell from '@/components/NotificationBell.vue'

const {
  settings, chatUnread, mobileMenuOpen, profileOpen, profileRef,
  defaultAvatar, navInitials, isImageUrl, navLinks, handleLogout,
} = useNavbar('linear-gradient(135deg,#a855f7,#22d3ee)')
</script>

<style scoped>
.flux-navbar {
  background: rgba(7,6,15,0.72);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 2px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(192,132,252,0.06);
}

.flux-orb {
  background: linear-gradient(135deg, #a855f7, #22d3ee);
  box-shadow: 0 0 16px rgba(168,85,247,0.6), 0 0 32px rgba(168,85,247,0.2);
}

@keyframes fx-shimmer { to { background-position: -200% center; } }
.flux-title {
  background: linear-gradient(90deg, #c084fc 0%, #f5f2ff 25%, #22d3ee 50%, #f5f2ff 75%, #c084fc 100%);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: fx-shimmer 5s linear infinite;
  filter: drop-shadow(0 0 10px rgba(192,132,252,0.35));
}

.flux-nav-link {
  color: rgba(245,242,255,0.5);
  position: relative;
  transition: color 0.2s;
}
.flux-nav-link::after {
  content: '';
  position: absolute;
  bottom: 0; left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #c084fc, #22d3ee, transparent);
  box-shadow: 0 0 10px rgba(192,132,252,0.6);
  border-radius: 2px;
  transition: transform 0.25s ease;
}
.flux-nav-link:hover { color: rgba(245,242,255,0.9); }
.flux-nav-link:hover::after { transform: translateX(-50%) scaleX(0.6); }
.flux-nav-link--active { color: rgba(245,242,255,1) !important; }
.flux-nav-link--active::after { transform: translateX(-50%) scaleX(1) !important; }

.flux-icon-btn {
  color: rgba(245,242,255,0.4);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  transition: all 0.2s;
}
.flux-icon-btn:hover, .flux-icon-btn--active {
  color: rgba(245,242,255,0.95);
  background: rgba(192,132,252,0.08);
  border-color: rgba(192,132,252,0.2);
  box-shadow: 0 0 14px rgba(168,85,247,0.2);
}

.flux-profile-btn {
  color: rgba(245,242,255,0.5);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all 0.2s;
}
.flux-profile-btn:hover, .flux-profile-btn--open {
  color: rgba(245,242,255,0.95);
  background: rgba(192,132,252,0.07);
  border-color: rgba(192,132,252,0.2);
  box-shadow: 0 0 18px rgba(168,85,247,0.15);
}

.flux-dropdown {
  background: rgba(14,12,31,0.88);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(192,132,252,0.06), inset 0 1px 0 rgba(255,255,255,0.06);
  overflow: hidden;
}

.flux-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(245,242,255,0.65);
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.flux-menu-item:hover { background: rgba(255,255,255,0.05); color: rgba(245,242,255,0.95); }
.flux-menu-item--active { background: rgba(192,132,252,0.07); color: rgba(245,242,255,0.95); }
.flux-menu-admin { color: #c084fc; }
.flux-menu-admin:hover { background: rgba(192,132,252,0.08); color: #c084fc; }

.flux-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 2px 12px; }

.flux-mobile-menu {
  background: rgba(7,6,15,0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.05);
}

.flux-drop-enter-active, .flux-drop-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.flux-drop-enter-from, .flux-drop-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }
.mobile-menu-enter-active, .mobile-menu-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
