<template>
  <Teleport to="body">
    <div class="fixed top-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style="max-width: 380px; width: calc(100vw - 2rem)">
      <TransitionGroup
        name="alert"
        tag="div"
        class="flex flex-col gap-2"
      >
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="pointer-events-auto flex gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-sm"
          :class="styleFor(alert.type).wrapper"
        >
          <!-- Icône -->
          <div class="shrink-0 w-5 h-5 mt-0.5" :class="styleFor(alert.type).icon" v-html="iconFor(alert.type)"></div>

          <!-- Contenu -->
          <div class="flex-1 min-w-0">
            <div v-if="alert.title" class="text-[13px] font-bold text-white mb-0.5">{{ alert.title }}</div>
            <div class="text-[12px] leading-relaxed" :class="styleFor(alert.type).text">{{ alert.message }}</div>
            <div class="text-[10px] text-ink-3 mt-1.5 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
              {{ alert.from }}
            </div>
          </div>

          <!-- Timer + fermer -->
          <div class="flex flex-col items-end gap-2 shrink-0">
            <button
              @click="dismiss(alert.id)"
              class="text-ink-3 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <!-- Barre de progression -->
            <div class="w-1 rounded-full overflow-hidden bg-white/10 self-stretch">
              <div
                class="w-full rounded-full transition-none"
                :class="styleFor(alert.type).bar"
                :style="{ height: progressOf(alert.id) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocket } from '@/composables/useSocket.js'

const { socket } = useSocket()

const DURATION = 9000 // ms avant auto-dismiss

const alerts    = ref([])
const timers    = new Map()  // id → { startedAt, timeoutId }

const STYLES = {
  info:    { wrapper: 'bg-blue-950/80  border-blue-500/50',  icon: 'text-blue-400',    text: 'text-blue-100',    bar: 'bg-blue-400'    },
  warning: { wrapper: 'bg-orange-950/80 border-orange/50',   icon: 'text-orange',      text: 'text-orange-100',  bar: 'bg-orange'      },
  success: { wrapper: 'bg-emerald-950/80 border-emerald-500/50', icon: 'text-emerald-400', text: 'text-emerald-100', bar: 'bg-emerald-400' },
  error:   { wrapper: 'bg-red-950/80   border-red-500/50',   icon: 'text-red-400',     text: 'text-red-100',     bar: 'bg-red-400'     },
}
function styleFor(type) { return STYLES[type] ?? STYLES.info }

const ICONS = {
  info:    '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  warning: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  success: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error:   '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
}
function iconFor(type) { return ICONS[type] ?? ICONS.info }

// Barre de progression (% restant)
const tick     = ref(0)
let tickerId   = null

function progressOf(id) {
  const t = timers.get(id)
  if (!t) return 0
  const elapsed = Date.now() - t.startedAt
  return Math.max(0, 100 - (elapsed / DURATION) * 100)
}

function add(alert) {
  alerts.value.unshift(alert)
  const timeoutId = setTimeout(() => dismiss(alert.id), DURATION)
  timers.set(alert.id, { startedAt: Date.now(), timeoutId })
}

function dismiss(id) {
  const t = timers.get(id)
  if (t) { clearTimeout(t.timeoutId); timers.delete(id) }
  alerts.value = alerts.value.filter(a => a.id !== id)
}

onMounted(() => {
  socket.on('alert:new', add)
  tickerId = setInterval(() => { tick.value++ }, 200)
})

onUnmounted(() => {
  socket.off('alert:new', add)
  if (tickerId) clearInterval(tickerId)
  for (const { timeoutId } of timers.values()) clearTimeout(timeoutId)
})
</script>

<style scoped>
.alert-enter-active { transition: all .25s ease; }
.alert-leave-active { transition: all .2s ease; }
.alert-enter-from   { opacity: 0; transform: translateX(20px); }
.alert-leave-to     { opacity: 0; transform: translateX(20px); }
.alert-move         { transition: transform .25s ease; }
</style>
