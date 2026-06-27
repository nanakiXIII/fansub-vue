<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      <TransitionGroup name="achievement-toast" tag="div" class="flex flex-col gap-3 items-end">

        <!-- ══ GUNDAM ══ -->
        <div
          v-if="layout === 'gundam'"
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto relative overflow-hidden w-72 bg-bg-1 border border-l-[3px]"
          :style="{ borderColor: toast.color + '30', borderLeftColor: toast.color }"
        >
          <!-- Coin HUD -->
          <span class="absolute top-0 right-0 w-2.5 h-2.5 pointer-events-none" :style="{ borderTop: `1px solid ${toast.color}80`, borderRight: `1px solid ${toast.color}80` }"></span>

          <!-- Étiquette module -->
          <div class="px-3 py-1.5 border-b flex items-center gap-2" :style="{ borderColor: toast.color + '20' }">
            <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24" :style="{ color: toast.color }">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
            <span class="text-[8px] font-mono tracking-[0.2em] uppercase flex-1" :style="{ color: toast.color }">// SUCCÈS DÉBLOQUÉ</span>
            <button @click="dismiss(toast.id)" class="text-ink-3 hover:text-white transition-colors">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Corps -->
          <div class="flex items-center gap-3 p-3">
            <!-- Icône carré -->
            <div class="relative shrink-0 w-11 h-11 flex items-center justify-center text-[24px] border"
              :style="{ background: toast.color + '18', borderColor: toast.color + '40' }">
              {{ toast.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[12px] font-mono font-bold text-white leading-tight">{{ toast.name }}</div>
              <div class="text-[10px] text-ink-3 mt-0.5 leading-snug">{{ toast.description }}</div>
              <span v-if="toast.rewardTitle"
                class="inline-flex items-center mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 border tracking-wider"
                :style="{ background: toast.color + '18', color: toast.color, borderColor: toast.color + '40' }">
                « {{ toast.rewardTitle }} »
              </span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="h-[2px] w-full" :style="{ background: toast.color + '20' }">
            <div class="h-full achievement-progress-bar" :style="{ background: toast.color, '--dur': '5.5s' }"></div>
          </div>
        </div>

        <!-- ══ DEFAULT ══ -->
        <div
          v-else
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto relative overflow-hidden rounded-2xl border shadow-2xl w-72"
          :style="{ borderColor: toast.color + '55', background: `linear-gradient(135deg, rgb(var(--color-bg-1)) 0%, ${toast.color}12 100%)` }"
        >
          <!-- Glow de fond -->
          <div class="absolute inset-0 pointer-events-none opacity-20 blur-2xl rounded-2xl" :style="{ background: toast.color }"></div>

          <!-- Contenu -->
          <div class="relative p-4">
            <!-- Header -->
            <div class="flex items-center gap-1.5 mb-3">
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" :style="{ color: toast.color }">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
              <span class="text-[10px] font-bold uppercase tracking-widest" :style="{ color: toast.color }">Succès débloqué !</span>
              <button @click="dismiss(toast.id)" class="ml-auto text-ink-3 hover:text-white transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Corps -->
            <div class="flex items-center gap-3">
              <div class="relative shrink-0">
                <div class="absolute inset-0 rounded-full blur-md opacity-60" :style="{ background: toast.color }"></div>
                <div class="relative w-12 h-12 rounded-full flex items-center justify-center text-[26px] border"
                  :style="{ background: toast.color + '22', borderColor: toast.color + '55' }">
                  {{ toast.icon }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-extrabold text-white leading-tight">{{ toast.name }}</div>
                <div class="text-[11px] text-ink-3 mt-0.5 leading-snug">{{ toast.description }}</div>
                <span v-if="toast.rewardTitle"
                  class="inline-flex items-center mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  :style="{ background: toast.color + '22', color: toast.color, borderColor: toast.color + '44' }">
                  « {{ toast.rewardTitle }} »
                </span>
              </div>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="h-[2px] w-full" :style="{ background: toast.color + '22' }">
            <div class="h-full achievement-progress-bar" :style="{ background: toast.color, '--dur': '5.5s' }"></div>
          </div>
        </div>

      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useAchievementToast } from '@/composables/useAchievementToast.js'
import { layout }              from '@/composables/useTheme.js'
const { toasts, dismiss } = useAchievementToast()
</script>

<style scoped>
.achievement-toast-enter-active {
  animation: toast-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.achievement-toast-leave-active {
  animation: toast-out 0.3s ease-in forwards;
}
@keyframes toast-in {
  from { opacity: 0; transform: translateX(110%) scale(0.85); }
  to   { opacity: 1; transform: translateX(0)    scale(1);    }
}
@keyframes toast-out {
  from { opacity: 1; transform: translateX(0)    scale(1);    }
  to   { opacity: 0; transform: translateX(110%) scale(0.9);  }
}

.achievement-progress-bar {
  animation: drain var(--dur, 5.5s) linear forwards;
  transform-origin: left;
}
@keyframes drain {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}
</style>
