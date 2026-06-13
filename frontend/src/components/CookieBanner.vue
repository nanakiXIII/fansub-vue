<template>
  <Transition name="cookie-banner">
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-[200] px-4 pb-4 pointer-events-none"
    >
      <div class="max-w-3xl mx-auto bg-bg-1 border border-white/[0.1] rounded-2xl shadow-2xl p-4 sm:p-5 pointer-events-auto">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">

          <!-- Icône + texte -->
          <div class="flex items-start gap-3 flex-1 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-orange/15 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4.5 h-4.5 text-orange" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M12 22C6.477 22 2 17.523 2 12c0-.585.055-1.156.158-1.71a4 4 0 0 0 4.134-6.586A10 10 0 1 1 12 22z"/>
                <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/>
                <circle cx="9.5" cy="14.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="15.5" cy="14.5" r="0.7" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div>
              <div class="text-[13px] font-bold text-white mb-0.5">Ce site utilise des cookies</div>
              <p class="text-[11px] text-ink-2 leading-relaxed">
                Nous utilisons des cookies et le stockage local pour sauvegarder votre progression, vos téléchargements et vos préférences.
                Ces données restent sur cet appareil et ne sont pas transmises à des tiers.
                <span class="text-ink-3">Conformément au RGPD, votre consentement est requis.</span>
              </p>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex gap-2 sm:flex-col sm:items-stretch shrink-0">
            <button
              @click="accept"
              class="btn-primary text-[12px] py-2 px-4 justify-center flex-1 sm:flex-none"
            >
              Tout accepter
            </button>
            <button
              @click="decline"
              class="btn-ghost text-[12px] py-2 px-4 justify-center flex-1 sm:flex-none"
            >
              Refuser
            </button>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const LS_KEY = 'fansub_consent'

const visible = ref(!localStorage.getItem(LS_KEY))

function accept() {
  localStorage.setItem(LS_KEY, 'accepted')
  visible.value = false
}

function decline() {
  localStorage.setItem(LS_KEY, 'declined')
  visible.value = false
}
</script>

<style scoped>
.cookie-banner-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.cookie-banner-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.cookie-banner-enter-from   { opacity: 0; transform: translateY(16px); }
.cookie-banner-leave-to     { opacity: 0; transform: translateY(16px); }
</style>
