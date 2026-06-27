<template>
  <div class="relative" ref="bellRef">
    <!-- Bouton cloche -->
    <button
      @click="open = !open"
      class="relative flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors"
      :class="[
        layout === 'gundam'
          ? (open ? 'text-orange border border-orange/40 bg-orange/10' : 'text-ink-2 border border-transparent hover:border-orange/30 hover:text-orange')
          : (open ? 'bg-bg-2 text-white rounded-lg' : 'text-ink-2 hover:bg-bg-2 hover:text-white rounded-lg')
      ]"
      aria-label="Notifications"
    >
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <!-- Badge non lus -->
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0.5 min-w-[15px] h-[15px] flex items-center justify-center rounded-full bg-orange text-[8px] font-bold text-white px-1 leading-none"
      >{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <!-- Dropdown -->
    <Transition name="notif-drop">
      <div
        v-if="open"
        class="absolute right-0 top-full mt-2 w-80 overflow-hidden z-50 shadow-2xl"
        :class="layout === 'gundam'
          ? 'bg-bg-1 border border-orange/20 border-l-[3px] border-l-orange/50'
          : 'bg-bg-1 border border-white/[0.1] rounded-xl'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-3.5 py-2.5 border-b"
          :class="layout === 'gundam' ? 'border-orange/10' : 'border-white/[0.07]'"
        >
          <span v-if="layout === 'gundam'" class="text-[9px] font-mono tracking-[0.2em] uppercase text-orange/70">
            // NOTIFICATIONS
          </span>
          <span v-else class="text-[12px] font-bold text-white">Notifications</span>
          <button
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="text-[10px] font-medium text-orange hover:text-orange/80 transition-colors"
            :class="layout === 'gundam' ? 'font-mono tracking-wider' : ''"
          >
            {{ layout === 'gundam' ? '[ TOUT LU ]' : 'Tout marquer lu' }}
          </button>
        </div>

        <!-- Liste -->
        <div class="max-h-[380px] overflow-y-auto">
          <div v-if="notifications.length === 0"
            class="text-center py-10 text-ink-3"
            :class="layout === 'gundam' ? 'text-[10px] font-mono tracking-widest' : 'text-[12px]'"
          >
            {{ layout === 'gundam' ? '// AUCUNE NOTIFICATION' : 'Aucune notification' }}
          </div>

          <div
            v-for="notif in notifications"
            :key="notif._id"
            class="group flex items-start gap-2.5 px-3 py-2.5 border-b last:border-0 cursor-pointer transition-colors"
            :class="[
              layout === 'gundam'
                ? (notif.read
                    ? 'border-orange/[0.06] hover:bg-orange/[0.04] border-l-[2px] border-l-transparent hover:border-l-orange/30'
                    : 'border-orange/[0.08] bg-orange/[0.06] hover:bg-orange/[0.1] border-l-[2px] border-l-orange/60')
                : (notif.read
                    ? 'border-white/[0.04] hover:bg-white/[0.03]'
                    : 'border-white/[0.04] bg-orange/5 hover:bg-orange/[0.08]')
            ]"
            @click="handleClick(notif)"
          >
            <!-- Poster miniature -->
            <div class="w-9 h-12 shrink-0 relative bg-bg-3 overflow-hidden"
              :class="layout === 'gundam' ? '' : 'rounded-md'"
            >
              <img loading="lazy" v-if="notif.seriePoster" :src="notif.seriePoster" class="absolute inset-0 w-full h-full object-cover" />
            </div>
            <!-- Texte -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-white leading-snug mb-0.5 line-clamp-2"
                :class="layout === 'gundam' ? 'text-[10px] font-mono' : 'text-[11px]'"
              >{{ notif.serieTitle }}</div>
              <div class="text-ink-2 mb-1"
                :class="layout === 'gundam' ? 'text-[9px] font-mono' : 'text-[10px]'"
              >
                EP{{ String(notif.epNum).padStart(2, '0') }}
                <span v-if="notif.epTitle && notif.epTitle !== `Épisode ${notif.epNum}`"> — {{ notif.epTitle }}</span>
                <span class="text-ink-3 ml-1">{{ layout === 'gundam' ? '[DISPO]' : 'est disponible' }}</span>
              </div>
              <div class="text-ink-3"
                :class="layout === 'gundam' ? 'text-[8px] font-mono tracking-wider' : 'text-[10px]'"
              >{{ timeAgo(notif.createdAt) }}</div>
            </div>
            <!-- Point non lu -->
            <div v-if="!notif.read" class="w-1.5 h-1.5 mt-1.5 shrink-0"
              :class="layout === 'gundam' ? 'bg-orange' : 'bg-orange rounded-full'"
            ></div>
            <!-- Bouton supprimer -->
            <button
              @click.stop="remove(notif._id)"
              class="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-red-400 transition-all p-0.5 ml-0.5 shrink-0"
              aria-label="Supprimer"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter }        from 'vue-router'
import { useNotifications } from '@/composables/useNotifications.js'
import { layout }           from '@/composables/useTheme.js'

const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications()
const router  = useRouter()
const open    = ref(false)
const bellRef = ref(null)

function handleClick(notif) {
  if (!notif.read) markRead(notif._id)
  open.value = false
  router.push(`/serie/${notif.serieId}?season=${notif.seasonSlug}#episode-${notif.epNum}`)
}

function timeAgo(date) {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date)) / 60000)
  if (diff < 1)  return "À l'instant"
  if (diff < 60) return `Il y a ${diff} min`
  const h = Math.floor(diff / 60)
  if (h < 24)   return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)    return `Il y a ${d}j`
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

function onOutside(e) {
  if (bellRef.value && !bellRef.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', onOutside))
onBeforeUnmount(() => document.removeEventListener('click', onOutside))
</script>

<style scoped>
.notif-drop-enter-active,
.notif-drop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.notif-drop-enter-from,
.notif-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}
</style>
