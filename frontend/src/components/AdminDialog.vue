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

        <!-- Carte -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="dialog.visible"
            class="relative z-10 bg-bg-2 border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center text-center"
          >
            <!-- Icône -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center mb-4 shrink-0"
              :class="dialog.variant === 'error' ? 'bg-red-500/15' : 'bg-orange/15'"
            >
              <!-- X pour erreur -->
              <svg
                v-if="dialog.variant === 'error'"
                class="w-6 h-6 text-red-400"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <!-- Poubelle pour confirmation danger -->
              <svg
                v-else
                class="w-6 h-6 text-orange"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"
              >
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
              </svg>
            </div>

            <!-- Titre -->
            <p class="text-[13px] font-semibold text-white mb-1">
              {{ dialog.variant === 'error' ? 'Erreur' : 'Confirmation' }}
            </p>

            <!-- Message -->
            <p class="text-[12px] text-ink-2 leading-relaxed mb-6">{{ dialog.message }}</p>

            <!-- Boutons -->
            <div class="flex gap-2 w-full">
              <!-- Alert : juste OK -->
              <button
                v-if="dialog.type === 'alert'"
                @click="onConfirm"
                class="flex-1 h-9 rounded-xl text-[12px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors"
              >
                OK
              </button>

              <!-- Confirm : Annuler + action -->
              <template v-else>
                <button
                  @click="onCancel"
                  class="flex-1 h-9 rounded-xl text-[12px] font-semibold bg-bg-1 text-ink-2 border border-white/[0.08] hover:border-white/20 hover:text-white transition-colors"
                >
                  {{ dialog.cancelLabel }}
                </button>
                <button
                  @click="onConfirm"
                  class="flex-1 h-9 rounded-xl text-[12px] font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors"
                >
                  {{ dialog.confirmLabel }}
                </button>
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
import { useDialog } from '@/composables/useDialog.js'

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
