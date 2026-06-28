<template>
  <nav class="gundam-navbar fixed top-0 left-0 right-0 z-50 select-none">

    <!-- Barre supérieure accent + hachurage -->
    <div class="gundam-top-bar" aria-hidden="true">
      <div class="gundam-top-fill"></div>
      <div class="gundam-top-stripe"></div>
      <div class="gundam-top-fill" style="width:24px;flex:none"></div>
    </div>

    <!-- Ligne scanline -->
    <div class="gundam-scanlines" aria-hidden="true"></div>

    <!-- Contenu principal -->
    <div class="h-14 flex items-center px-5 gap-3 relative z-10">

      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-3 shrink-0 group" @click="mobileMenuOpen = false">
        <div class="gundam-emblem shrink-0">
          <svg class="w-[14px] h-[14px] fill-white drop-shadow" viewBox="0 0 16 16">
            <path d="M3 2l10 6-10 6V2z"/>
          </svg>
        </div>
        <div class="flex flex-col gap-0 leading-none">
          <span class="gundam-site-name" :class="{ 'gundam-site-name--booted': booted }">{{ displayName }}</span>
          <span class="gundam-sys-id">{{ displaySysId }}<span :class="booted ? 'gundam-cursor-blink' : 'gundam-cursor'">▌</span></span>
        </div>
      </RouterLink>

      <!-- Séparateur vertical -->
      <div class="hidden lg:block w-px h-6 bg-orange/20 mx-1 shrink-0"></div>

      <!-- Nav links desktop -->
      <div class="hidden lg:flex flex-1 items-center gap-0.5">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="gundam-nav-link"
          active-class="gundam-nav-link--active"
        >
          {{ link.label }}
        </RouterLink>
      </div>
      <div class="flex-1 lg:hidden"></div>

      <!-- Chat desktop -->
      <RouterLink
        v-if="chatEnabled"
        to="/chat"
        class="hidden lg:flex gundam-icon-btn relative shrink-0"
        active-class="gundam-icon-btn--on"
        aria-label="Chat"
      >
        <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-1 leading-none">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
      </RouterLink>

      <!-- Notifications desktop -->
      <NotificationBell v-if="settings.uid" class="hidden lg:flex" />

      <!-- Profil desktop -->
      <div class="hidden lg:block relative shrink-0" ref="profileRef">
        <button
          @click="profileOpen = !profileOpen"
          class="gundam-profile-btn"
          :class="profileOpen ? 'gundam-profile-btn--open' : ''"
        >
          <div class="gundam-pilot-bar"></div>
          <template v-if="settings.uid">
            <div
              class="w-6 h-6 shrink-0 flex items-center justify-center text-[9px] font-bold text-white border border-orange/30 overflow-hidden"
              :style="isImageUrl(settings.avatar) ? {} : { background: settings.avatar || defaultAvatar }"
            >
              <img loading="lazy" v-if="isImageUrl(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover" />
              <span v-else>{{ navInitials }}</span>
            </div>
          </template>
          <svg v-else class="w-4 h-4 shrink-0 text-orange/60" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/>
          </svg>
          <div class="flex flex-col items-start leading-none gap-0.5">
            <span v-if="settings.uid || settings.username" class="text-[11px] font-bold tracking-wide text-ink-1">
              <span v-if="settings.isAdmin" class="text-[8px] font-bold bg-orange/20 text-orange px-1 py-px mr-1 leading-none">ADMIN</span>
              {{ settings.username }}
            </span>
            <span v-else class="text-[11px] font-bold tracking-wide text-orange/60">ANONYME</span>
            <span class="text-[8px] tracking-widest font-mono" :class="settings.uid ? 'text-green-400' : 'text-ink-3'">
              {{ settings.uid ? '● CONNECTÉ' : '○ HORS LIGNE' }}
            </span>
          </div>
          <svg class="w-3 h-3 text-orange/40 shrink-0 transition-transform duration-150" :class="profileOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="g-drop">
          <div v-if="profileOpen" class="gundam-dropdown absolute right-0 top-full mt-1 w-52">
            <div class="px-3 py-1.5 border-b border-orange/10">
              <span class="text-[8px] tracking-widest font-mono text-orange/60">ACCÈS PILOTE</span>
            </div>
            <RouterLink to="/profil" class="gundam-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
              <span v-if="settings.uid">{{ settings.username }}</span>
              <span v-else-if="settings.username">{{ settings.username }} <span class="text-ink-3 text-[10px]">(local)</span></span>
              <span v-else>Mon profil</span>
            </RouterLink>
            <RouterLink to="/profil?tab=activity" class="gundam-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Activité
            </RouterLink>
            <RouterLink to="/profil?tab=settings" class="gundam-item" @click="profileOpen = false">
              <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Paramètres
            </RouterLink>
            <template v-if="settings.isAdmin || settings.permissions?.length">
              <div class="gundam-sep"></div>
              <RouterLink to="/admin" class="gundam-item text-orange" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Administration
              </RouterLink>
            </template>
            <div class="gundam-sep"></div>
            <template v-if="settings.uid">
              <button class="gundam-item text-red-400 w-full" @click="handleLogout">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Déconnecter
              </button>
            </template>
            <template v-else>
              <RouterLink to="/inscription" class="gundam-item" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Enregistrement
              </RouterLink>
              <RouterLink to="/connexion" class="gundam-item" @click="profileOpen = false">
                <svg class="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Connexion
              </RouterLink>
            </template>
          </div>
        </Transition>
      </div>

      <!-- Mobile uniquement (chat + notifs + burger) -->
      <div class="gundam-mobile-icons">
        <RouterLink v-if="chatEnabled" to="/chat" class="gundam-icon-btn relative shrink-0" aria-label="Chat" @click="mobileMenuOpen = false">
          <svg class="w-[15px] h-[15px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span v-if="chatUnread > 0" class="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-1 leading-none">{{ chatUnread > 9 ? '9+' : chatUnread }}</span>
        </RouterLink>
        <NotificationBell v-if="settings.uid" />
        <button class="gundam-icon-btn shrink-0" @click="mobileMenuOpen = !mobileMenuOpen" :aria-expanded="mobileMenuOpen" aria-label="Menu">
          <svg v-if="!mobileMenuOpen" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Barre inférieure -->
    <div class="gundam-bottom-bar" aria-hidden="true"></div>

    <!-- Menu mobile -->
    <Transition name="g-slide">
      <div v-if="mobileMenuOpen" class="lg:hidden gundam-mobile px-5 py-4">
        <p class="gundam-section-label">NAVIGATION</p>
        <div class="flex flex-col gap-px mb-4">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="gundam-item text-[13px]"
            active-class="gundam-item--active"
            @click="mobileMenuOpen = false"
          >{{ link.label }}</RouterLink>
        </div>
        <div class="gundam-sep mb-4"></div>
        <p class="gundam-section-label">ACCÈS PILOTE</p>
        <div class="flex flex-col gap-px">
          <RouterLink to="/profil" class="gundam-item text-[13px]" @click="mobileMenuOpen = false">
            <svg class="w-4 h-4 shrink-0 opacity-60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
            <span v-if="settings.uid">{{ settings.username }}</span>
            <span v-else>Mon profil</span>
          </RouterLink>
          <template v-if="settings.isAdmin || settings.permissions?.length">
            <RouterLink to="/admin" class="gundam-item text-[13px] text-orange" @click="mobileMenuOpen = false">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Administration
            </RouterLink>
          </template>
          <template v-if="settings.uid">
            <button class="gundam-item text-[13px] text-red-400 w-full" @click="handleLogout">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Déconnecter
            </button>
          </template>
          <template v-else>
            <RouterLink to="/inscription" class="gundam-item text-[13px]" @click="mobileMenuOpen = false">Enregistrement</RouterLink>
            <RouterLink to="/connexion" class="gundam-item text-[13px]" @click="mobileMenuOpen = false">Connexion</RouterLink>
          </template>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { config } from '@/config.js'
import { useNavbar } from '@/composables/useNavbar.js'
import NotificationBell from '@/components/NotificationBell.vue'

const {
  settings, chatUnread, chatEnabled, mobileMenuOpen, profileOpen, profileRef,
  defaultAvatar, navInitials, isImageUrl, navLinks, handleLogout,
} = useNavbar('linear-gradient(135deg,#f97316,#fb923c)')

// ── Animation boot terminal ──────────────────────────────────────
const GLITCH_CHARS = 'XΨ#@01ΛΣ▒∆◈⬡⊕!%'
const SYS_ID_TEXT  = 'SYSTÈME FANSUB · OPÉRATIONNEL'

function rndChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
}

const displayName  = ref(
  config.siteName.split('').map(c => c === ' ' ? ' ' : rndChar()).join('')
)
const displaySysId = ref('')
const booted       = ref(false)

const _ivs = []
const _tos = []

function decodeText(target, setter, fps = 28, framesPerChar = 5) {
  return new Promise(resolve => {
    let frame = 0
    const total = target.length * framesPerChar
    const iv = setInterval(() => {
      setter(
        target.split('').map((ch, i) => {
          if (ch === ' ' || ch === '·' || ch === '—') return ch
          return frame >= (i + 1) * framesPerChar ? ch : rndChar()
        }).join('')
      )
      if (++frame > total) { setter(target); clearInterval(iv); resolve() }
    }, fps)
    _ivs.push(iv)
  })
}

function typeText(target, setter, delay = 38) {
  setter('')
  return new Promise(resolve => {
    let i = 0
    const iv = setInterval(() => {
      setter(target.slice(0, ++i))
      if (i >= target.length) { clearInterval(iv); resolve() }
    }, delay)
    _ivs.push(iv)
  })
}

function startGlitch(text, setter) {
  const iv = setInterval(() => {
    const arr  = text.split('')
    const n    = 1 + Math.floor(Math.random() * 2)
    const idxs = Array.from({ length: n }, () => Math.floor(Math.random() * arr.length))
    setter(arr.map((ch, i) => (!idxs.includes(i) || ch === ' ') ? ch : rndChar()).join(''))
    const t = setTimeout(() => setter(text), 70 + Math.random() * 80)
    _tos.push(t)
  }, 3000 + Math.random() * 2000)
  _ivs.push(iv)
}

onMounted(() => {
  if (sessionStorage.getItem('gh_booted')) {
    displayName.value = config.siteName
    displaySysId.value = SYS_ID_TEXT
    booted.value = true
    startGlitch(config.siteName, v => { displayName.value = v })
    return
  }
  const t0 = setTimeout(async () => {
    await decodeText(config.siteName, v => { displayName.value = v })
    const t1 = setTimeout(async () => {
      await typeText(SYS_ID_TEXT, v => { displaySysId.value = v })
      booted.value = true
      sessionStorage.setItem('gh_booted', '1')
      startGlitch(config.siteName, v => { displayName.value = v })
    }, 120)
    _tos.push(t1)
  }, 200)
  _tos.push(t0)
})

onBeforeUnmount(() => {
  _ivs.forEach(iv => clearInterval(iv))
  _tos.forEach(t  => clearTimeout(t))
})
</script>

<style scoped>
/* ── Shell ──────────────────────────────────────────────────────── */
.gundam-navbar {
  background: rgba(5, 8, 16, 0.98);
}

/* Barre accent top */
.gundam-top-bar {
  display: flex;
  height: 3px;
  gap: 3px;
}
.gundam-top-fill {
  flex: 1;
  background: rgb(var(--color-orange));
}
.gundam-top-stripe {
  width: 56px;
  flex-shrink: 0;
  background: repeating-linear-gradient(
    90deg,
    rgb(var(--color-orange)) 0px,
    rgb(var(--color-orange)) 5px,
    rgba(var(--color-orange), 0.15) 5px,
    rgba(var(--color-orange), 0.15) 9px
  );
}

/* Scanlines overlay */
.gundam-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 3px,
    rgba(0, 0, 0, 0.12) 3px,
    rgba(0, 0, 0, 0.12) 4px
  );
  pointer-events: none;
  z-index: 0;
}

/* Barre bas */
.gundam-bottom-bar {
  height: 1px;
  background: linear-gradient(
    90deg,
    rgb(var(--color-orange)),
    rgba(var(--color-orange), 0.4) 60%,
    transparent
  );
}

/* ── Emblème logo ───────────────────────────────────────────────── */
.gundam-emblem {
  position: relative;
  width: 36px;
  height: 36px;
  background: rgb(var(--color-orange));
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  filter: drop-shadow(0 0 8px rgba(var(--color-orange), 0.55));
  flex-shrink: 0;
  transition: filter 0.2s;
}
a:hover .gundam-emblem {
  filter: drop-shadow(0 0 14px rgba(var(--color-orange), 0.9));
}
.gundam-site-name {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: white;
  line-height: 1;
  font-family: 'Courier New', monospace;
  transition: text-shadow 0.3s;
}
.gundam-site-name--booted {
  animation: title-pulse 5s ease-in-out infinite;
}
@keyframes title-pulse {
  0%, 100% { text-shadow: none; }
  50%       { text-shadow: 0 0 12px rgba(var(--color-orange), 0.35), 0 0 28px rgba(var(--color-orange), 0.12); }
}

.gundam-sys-id {
  font-size: 7px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--color-orange));
  opacity: 0.65;
  font-family: monospace;
  margin-top: 3px;
}

/* Curseur terminal */
.gundam-cursor {
  color: rgb(var(--color-orange));
  opacity: 0.8;
}
.gundam-cursor-blink {
  color: rgb(var(--color-orange));
  opacity: 0.7;
  animation: cursor-blink 1s steps(1) infinite;
}
@keyframes cursor-blink {
  0%, 49%   { opacity: 0.7; }
  50%, 100% { opacity: 0; }
}

/* ── Nav links ──────────────────────────────────────────────────── */
.gundam-nav-link {
  position: relative;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--color-ink-2));
  border: 1px solid transparent;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.gundam-nav-link:hover {
  color: rgb(var(--color-ink-1));
  background: rgba(var(--color-orange), 0.07);
  border-color: rgba(var(--color-orange), 0.2);
}
.gundam-nav-link--active {
  color: rgb(var(--color-orange)) !important;
  background: rgba(var(--color-orange), 0.09) !important;
  border-color: rgba(var(--color-orange), 0.28) !important;
}
.gundam-nav-link--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: rgb(var(--color-orange));
  box-shadow: 0 0 6px rgba(var(--color-orange), 0.9);
}

/* ── Icon button ────────────────────────────────────────────────── */
.gundam-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  color: rgb(var(--color-ink-2));
  background: rgba(var(--color-orange), 0.05);
  border: 1px solid rgba(var(--color-orange), 0.14);
  border-radius: 0;
  transition: all 0.15s;
  cursor: pointer;
}
.gundam-icon-btn:hover, .gundam-icon-btn--on {
  color: rgb(var(--color-orange));
  background: rgba(var(--color-orange), 0.12);
  border-color: rgba(var(--color-orange), 0.35);
  box-shadow: 0 0 10px rgba(var(--color-orange), 0.15);
}

/* ── Profile button ─────────────────────────────────────────────── */
.gundam-profile-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 12px 5px 6px;
  background: rgba(var(--color-orange), 0.04);
  border: 1px solid rgba(var(--color-orange), 0.16);
  color: rgb(var(--color-ink-1));
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.gundam-profile-btn:hover,
.gundam-profile-btn--open {
  background: rgba(var(--color-orange), 0.09);
  border-color: rgba(var(--color-orange), 0.36);
  box-shadow: 0 0 12px rgba(var(--color-orange), 0.1);
}
.gundam-pilot-bar {
  width: 3px;
  height: 22px;
  background: rgb(var(--color-orange));
  opacity: 0.75;
  flex-shrink: 0;
}

/* ── Dropdown ───────────────────────────────────────────────────── */
.gundam-dropdown {
  background: rgba(5, 8, 16, 0.98);
  border: 1px solid rgba(var(--color-orange), 0.22);
  border-top: 2px solid rgb(var(--color-orange));
  box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 24px rgba(var(--color-orange), 0.06);
}
.gundam-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--color-ink-1));
  letter-spacing: 0.04em;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border-left: 2px solid transparent;
}
.gundam-item:hover {
  background: rgba(var(--color-orange), 0.08);
  color: white;
  border-left-color: rgb(var(--color-orange));
}
.gundam-item--active {
  background: rgba(var(--color-orange), 0.08);
  border-left-color: rgb(var(--color-orange));
  color: rgb(var(--color-orange));
}
.gundam-sep {
  height: 1px;
  background: rgba(var(--color-orange), 0.1);
  margin: 2px 0;
}

/* ── Mobile ─────────────────────────────────────────────────────── */
.gundam-mobile {
  background: rgba(5, 8, 16, 0.99);
  border-top: 1px solid rgba(var(--color-orange), 0.15);
}
.gundam-section-label {
  font-size: 8px;
  font-family: monospace;
  letter-spacing: 0.22em;
  color: rgba(var(--color-orange), 0.55);
  padding: 0 14px 6px;
  text-transform: uppercase;
}

/* ── Responsive ─────────────────────────────────────────────────── */
.gundam-mobile-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}
@media (min-width: 1024px) {
  .gundam-mobile-icons { display: none; }
}

/* ── Transitions ────────────────────────────────────────────────── */
.g-drop-enter-active, .g-drop-leave-active   { transition: opacity 0.12s ease, transform 0.12s ease; }
.g-drop-enter-from,  .g-drop-leave-to        { opacity: 0; transform: translateY(-6px); }
.g-slide-enter-active, .g-slide-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.g-slide-enter-from,   .g-slide-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
