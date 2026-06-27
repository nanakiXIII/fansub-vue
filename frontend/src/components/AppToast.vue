<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none" style="max-width: 360px">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 text-[13px] font-medium backdrop-blur-sm"
          :class="[
            layout === 'gundam' ? gundamStyle[t.type] : defaultStyle[t.type],
            layout === 'gundam' ? '' : 'rounded-xl shadow-lg border'
          ]"
        >
          <span class="shrink-0 mt-0.5" v-html="iconMap[t.type]"></span>
          <span class="flex-1 leading-snug" :class="layout === 'gundam' ? 'font-mono text-[11px] tracking-wide' : ''">{{ t.message }}</span>
          <button
            class="shrink-0 opacity-50 hover:opacity-100 transition-opacity ml-1 mt-0.5"
            @click="dismiss(t.id)"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast.js'
import { layout }   from '@/composables/useTheme.js'

const { toasts, dismiss } = useToast()

const defaultStyle = {
  success: 'bg-green-950/90 border-green-500/30 text-green-200',
  error:   'bg-red-950/90 border-red-500/30 text-red-200',
  warning: 'bg-amber-950/90 border-amber-500/30 text-amber-200',
  info:    'bg-bg-1/95 border-white/10 text-ink-1',
}

const gundamStyle = {
  success: 'bg-bg-1/95 border border-l-[3px] border-green-500/25 border-l-green-400 text-green-300 shadow-[0_0_20px_rgba(74,222,128,0.08)]',
  error:   'bg-bg-1/95 border border-l-[3px] border-red-500/25 border-l-red-400 text-red-300 shadow-[0_0_20px_rgba(248,113,113,0.08)]',
  warning: 'bg-bg-1/95 border border-l-[3px] border-amber-500/25 border-l-amber-400 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.08)]',
  info:    'bg-bg-1/95 border border-l-[3px] border-orange/20 border-l-orange text-ink-1 shadow-[0_0_20px_rgb(var(--color-orange)/0.08)]',
}

const iconMap = {
  success: '<svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
  error:   '<svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  warning: '<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  info:    '<svg class="w-4 h-4 text-orange" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(24px); }
.toast-leave-to     { opacity: 0; transform: translateX(24px); }
.toast-move         { transition: transform 0.2s ease; }
</style>
