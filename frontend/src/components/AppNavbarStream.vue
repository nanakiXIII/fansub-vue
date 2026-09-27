<template>
  <nav class="st-nav sticky top-0 z-50">
    <div class="h-16 flex items-center px-6 gap-7 max-w-[1400px] mx-auto">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 shrink-0" @click="mobileMenuOpen = false">
        <svg viewBox="0 0 32 32" fill="none" class="w-8 h-8">
          <rect width="32" height="32" rx="9" fill="url(#st-navg)"/>
          <path d="M13 10l9 6-9 6V10z" fill="#04211d"/>
          <defs><linearGradient id="st-navg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4de8d8"/><stop offset="1" stop-color="#0e6e63"/></linearGradient></defs>
        </svg>
        <span class="st-word">{{ config.siteName }}</span>
      </RouterLink>

      <!-- Nav links (desktop) -->
      <div class="hidden lg:flex items-center gap-1 flex-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="st-link"
          active-class="st-link-active"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="flex-1 lg:hidden"></div>

      <!-- Recherche -->
      <RouterLink to="/catalogue" class="hidden lg:flex items-center justify-center st-icon-btn" aria-label="Rechercher">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      </RouterLink>

      <!-- Chat (desktop) -->
      <RouterLink
        v-if="chatEnabled"
        to="/chat"
        class="hidden lg:flex items-center justify-center st-icon-btn relative"
        active-class="st-icon-btn-active"
        aria-label="Chat"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span v-if="chatUnread > 0" class="st-badge-dot">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <NotificationBell v-if="settings.uid" class="hidden lg:flex" />

      <!-- Profil (desktop) -->
      <div class="hidden lg:block relative shrink-0" ref="profileRef">
        <button @click="profileOpen = !profileOpen" class="st-profile-btn" :class="profileOpen ? 'st-profile-btn-open' : ''">
          <template v-if="settings.uid">
            <div class="st-avatar" :style="isImageUrl(settings.avatar) ? {} : { background: settings.avatar || defaultAvatar }">
              <img loading="lazy" v-if="isImageUrl(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover rounded-[7px]" />
              <span v-else>{{ navInitials }}</span>
            </div>
          </template>
          <svg v-else class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
          <span v-if="settings.uid" class="st-profile-name">
            <span v-if="settings.isAdmin" class="st-tag st-tag-admin">ADMIN</span>
            <span v-else-if="settings.roleLabel" class="st-tag" :style="{ background: (settings.roleColor || '#22d6c4') + '26', color: settings.roleColor || '#22d6c4' }">{{ settings.roleLabel }}</span>
            {{ settings.username }}
          </span>
          <span v-else class="st-profile-name">Profil</span>
          <svg class="w-3 h-3 shrink-0 transition-transform duration-150" :class="profileOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <Transition name="st-drop">
          <div v-if="profileOpen" class="st-dropdown">
            <RouterLink to="/profil" class="st-drop-item" @click="profileOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
              <span v-if="settings.uid || settings.username">{{ settings.username }}</span>
              <span v-else>Mon profil</span>
            </RouterLink>
            <RouterLink to="/profil?tab=activity" class="st-drop-item" @click="profileOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Activité
            </RouterLink>
            <RouterLink to="/profil?tab=settings" class="st-drop-item" @click="profileOpen = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Paramètres
            </RouterLink>
            <template v-if="settings.isAdmin || settings.permissions?.length">
              <div class="st-drop-sep"></div>
              <RouterLink to="/admin" class="st-drop-item st-drop-item-accent" @click="profileOpen = false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Administration
              </RouterLink>
            </template>
            <div class="st-drop-sep"></div>
            <template v-if="settings.uid">
              <button class="st-drop-item st-drop-item-danger w-full" @click="handleLogout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </template>
            <template v-else>
              <RouterLink to="/inscription" class="st-drop-item" @click="profileOpen = false">S'enregistrer</RouterLink>
              <RouterLink to="/connexion" class="st-drop-item" @click="profileOpen = false">Connexion</RouterLink>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Mobile -->
      <RouterLink v-if="chatEnabled" to="/chat" class="lg:hidden flex items-center justify-center st-icon-btn relative" aria-label="Chat" @click="mobileMenuOpen = false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span v-if="chatUnread > 0" class="st-badge-dot">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>
      <NotificationBell v-if="settings.uid" class="lg:hidden" />
      <button class="lg:hidden flex items-center justify-center st-icon-btn" @click="mobileMenuOpen = !mobileMenuOpen" :aria-expanded="mobileMenuOpen" aria-label="Ouvrir le menu de navigation">
        <svg v-if="!mobileMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <Transition name="st-mobile">
      <div v-if="mobileMenuOpen" class="lg:hidden st-mobile-panel">
        <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="st-mobile-link" active-class="st-mobile-link-active" @click="mobileMenuOpen = false">
          {{ link.label }}
        </RouterLink>
        <div class="st-drop-sep my-2"></div>
        <RouterLink to="/profil" class="st-mobile-link" @click="mobileMenuOpen = false">
          {{ settings.uid || settings.username ? settings.username : 'Mon profil' }}
        </RouterLink>
        <RouterLink v-if="settings.isAdmin || settings.permissions?.length" to="/admin" class="st-mobile-link st-drop-item-accent" @click="mobileMenuOpen = false">Administration</RouterLink>
        <button v-if="settings.uid" class="st-mobile-link st-drop-item-danger text-left" @click="handleLogout">Se déconnecter</button>
        <template v-else>
          <RouterLink to="/inscription" class="st-mobile-link" @click="mobileMenuOpen = false">S'enregistrer</RouterLink>
          <RouterLink to="/connexion" class="st-mobile-link" @click="mobileMenuOpen = false">Connexion</RouterLink>
        </template>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { config } from '@/config.js'
import { useNavbar } from '@/composables/useNavbar.js'
import NotificationBell from '@/components/NotificationBell.vue'

const {
  settings, chatUnread, chatEnabled, mobileMenuOpen, profileOpen, profileRef,
  defaultAvatar, navInitials, isImageUrl, navLinks, handleLogout,
} = useNavbar('linear-gradient(145deg,#4de8d8,#0e6e63)')
</script>

<style scoped>
.st-nav {
  background: rgba(6,10,16,.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255,255,255,.09);
  font-family: "Manrope", ui-sans-serif, sans-serif;
}
.st-word { font-family: "Sora", ui-sans-serif, sans-serif; font-weight: 700; font-size: 17px; letter-spacing: .01em; color: rgb(var(--color-ink-1)); }

.st-link { font-size: 14px; font-weight: 600; color: #93a1ac; padding: 8px 14px; border-radius: 8px; transition: color .15s ease, background .15s ease; }
.st-link:hover { color: #eef4f6; background: rgba(255,255,255,.05); }
.st-link-active { color: #eef4f6 !important; background: rgba(34,214,196,.12) !important; }

.st-icon-btn { width: 38px; height: 38px; border-radius: 9px; color: #93a1ac; }
.st-icon-btn svg { width: 18px; height: 18px; }
.st-icon-btn:hover { background: rgba(255,255,255,.06); color: #eef4f6; }
.st-icon-btn-active { color: #22d6c4 !important; background: rgba(34,214,196,.1) !important; }
.st-badge-dot { position: absolute; top: -2px; right: -2px; min-width: 16px; height: 16px; border-radius: 999px; background: #ff5d6c; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; line-height: 1; }

.st-profile-btn { display: flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 10px; color: #93a1ac; font-size: 14px; font-weight: 600; }
.st-profile-btn:hover, .st-profile-btn-open { background: rgba(255,255,255,.06); color: #eef4f6; }
.st-avatar { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-family: "Sora"; font-size: 10px; font-weight: 700; color: #04211d; overflow: hidden; }
.st-profile-name { display: flex; align-items: center; gap: 6px; }
.st-tag { font-family: "IBM Plex Mono"; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; line-height: 1.4; }
.st-tag-admin { background: rgba(34,214,196,.18); color: #22d6c4; }

.st-dropdown { position: absolute; right: 0; top: calc(100% + 8px); width: 200px; background: #0c131c; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,.5); overflow: hidden; padding: 5px; }
.st-drop-item { display: flex; align-items: center; gap: 10px; padding: 9px 11px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #eef4f6; }
.st-drop-item svg { width: 15px; height: 15px; color: #52606c; flex-shrink: 0; }
.st-drop-item:hover { background: rgba(255,255,255,.06); }
.st-drop-item-accent { color: #22d6c4 !important; }
.st-drop-item-danger { color: #ff5d6c !important; }
.st-drop-sep { height: 1px; background: rgba(255,255,255,.09); margin: 5px 6px; }

.st-mobile-panel { border-top: 1px solid rgba(255,255,255,.09); background: #0c131c; padding: 12px 20px 16px; display: flex; flex-direction: column; gap: 2px; }
.st-mobile-link { font-size: 14px; font-weight: 600; color: #93a1ac; padding: 10px 10px; border-radius: 9px; }
.st-mobile-link:hover, .st-mobile-link-active { color: #eef4f6; background: rgba(255,255,255,.06); }

.st-drop-enter-active, .st-drop-leave-active { transition: opacity .15s ease, transform .15s ease; }
.st-drop-enter-from, .st-drop-leave-to { opacity: 0; transform: translateY(-6px) scale(.97); }
.st-mobile-enter-active, .st-mobile-leave-active { transition: opacity .18s ease, transform .18s ease; }
.st-mobile-enter-from, .st-mobile-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
