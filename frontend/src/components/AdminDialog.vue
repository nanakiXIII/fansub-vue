<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="dialog.visible"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @keydown.esc="onCancel"
        @keydown.enter="onConfirm"
        tabindex="-1"
        ref="overlayRef"
      >
        <!-- Fond -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="onCancel" />

        <!-- ══ GUNDAM ══ -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div v-if="dialog.visible && layout === 'gundam'"
            class="relative z-10 bg-bg-1 border border-orange/20 border-l-[3px] border-l-orange/60 w-full max-w-sm flex flex-col shadow-[0_0_40px_rgb(var(--color-orange)/0.08)]"
          >
            <!-- Coin HUD haut-droite -->
            <span class="absolute top-0 right-0 w-3 h-3 border-t border-r border-orange/50 pointer-events-none"></span>
            <span class="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-orange/30 pointer-events-none"></span>

            <!-- Label module -->
            <div class="px-4 py-2 border-b border-orange/10 text-[8px] font-mono tracking-[0.25em] uppercase text-orange/50">
              {{ dialog.variant === 'error' ? '▶ ALERTE · ERREUR SYSTÈME' : '▶ MODULE · CONFIRMATION' }}
            </div>

            <!-- Corps -->
            <div class="p-5 flex items-start gap-4">
              <!-- Icône -->
              <div class="shrink-0 w-9 h-9 flex items-center justify-center border"
                :class="dialog.variant === 'error' ? 'border-red-500/30 bg-red-500/10' : 'border-orange/30 bg-orange/10'">
                <svg v-if="dialog.variant === 'error'" class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <svg v-else class="w-5 h-5 text-orange" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5"
                  :class="dialog.variant === 'error' ? 'text-red-400' : 'text-orange'">
                  {{ dialog.variant === 'error' ? '// ERREUR' : '// CONFIRMATION REQUISE' }}
                </p>
                <p class="text-[12px] text-ink-1 leading-relaxed">{{ dialog.message }}</p>
              </div>
            </div>

            <!-- Boutons -->
            <div class="flex border-t border-orange/10">
              <button
                v-if="dialog.type === 'alert'"
                @click="onConfirm"
                class="flex-1 h-9 text-[11px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border-r border-orange/10"
              >OK</button>
              <template v-else>
                <button
                  @click="onCancel"
                  class="flex-1 h-9 text-[11px] font-mono uppercase tracking-widest text-ink-3 hover:text-ink-1 hover:bg-white/5 transition-colors border-r border-orange/10"
                >{{ dialog.cancelLabel }}</button>
                <button
                  @click="onConfirm"
                  class="flex-1 h-9 text-[11px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >{{ dialog.confirmLabel }}</button>
              </template>
            </div>
          </div>

          <!-- ══ DEFAULT ══ -->
          <div v-else-if="dialog.visible"
            class="relative z-10 bg-bg-2 border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
          >
            <!-- Icône -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center mb-4 shrink-0"
              :class="dialog.variant === 'error' ? 'bg-red-500/15' : 'bg-orange/15'"
            >
              <svg v-if="dialog.variant === 'error'" class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <svg v-else class="w-6 h-6 text-orange" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </div>

            <p class="text-[13px] font-semibold text-white mb-1">
              {{ dialog.variant === 'error' ? 'Erreur' : 'Confirmation' }}
            </p>
            <p class="text-[12px] text-ink-2 leading-relaxed mb-6">{{ dialog.message }}</p>

            <div class="flex gap-2 w-full">
              <button v-if="dialog.type === 'alert'" @click="onConfirm"
                class="flex-1 h-9 rounded-xl text-[12px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors"
              >OK</button>
              <template v-else>
                <button @click="onCancel"
                  class="flex-1 h-9 rounded-xl text-[12px] font-semibold bg-bg-1 text-ink-2 border border-white/[0.08] hover:border-white/20 hover:text-white transition-colors"
                >{{ dialog.cancelLabel }}</button>
                <button @click="onConfirm"
                  class="flex-1 h-9 rounded-xl text-[12px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors"
                >{{ dialog.confirmLabel }}</button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useDialog }  from '@/composables/useDialog.js'
import { layout }     from '@/composables/useTheme.js'

const { dialog, _respond } = useDialog()
const overlayRef = ref(null)

watch(() => dialog.visible, async (v) => {
  if (v) {
    await nextTick()
    overlayRef.value?.focus()
  }
})

function onConfirm() { _respond(true)  }
function onCancel()  { _respond(false) }
</script>
