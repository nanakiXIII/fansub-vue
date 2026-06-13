<template>
  <div class="fixed inset-0 z-[9998] bg-bg-0 flex flex-col items-center justify-center px-6 text-center">

    <!-- Icône animée -->
    <div class="relative mb-8">
      <div class="w-24 h-24 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center">
        <svg class="w-12 h-12 text-orange" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <!-- Pulse ring -->
      <div class="absolute inset-0 rounded-full border border-orange/20 animate-ping opacity-40"></div>
    </div>

    <!-- Texte -->
    <h1 class="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight mb-3">
      Maintenance en cours
    </h1>
    <p class="text-[14px] text-ink-2 max-w-sm leading-relaxed mb-8">
      Le site est temporairement indisponible pendant que nous effectuons des améliorations.
      Revenez dans quelques instants !
    </p>

    <!-- Badge utilisateur connecté -->
    <div v-if="settings.username" class="flex items-center gap-2.5 px-4 py-2.5 bg-bg-1 border border-white/[0.07] rounded-xl text-[12px] text-ink-2 mb-6">
      <div
        class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
        :style="isImageAvatar(settings.avatar) ? {} : { background: settings.avatar || '#334155' }"
      >
        <img loading="lazy" v-if="isImageAvatar(settings.avatar)" :src="settings.avatar" class="w-full h-full object-cover" />
        <span v-else>{{ (settings.username || '?')[0].toUpperCase() }}</span>
      </div>
      <span>Connecté en tant que <strong class="text-white">{{ settings.username }}</strong></span>
    </div>

    <!-- Lien connexion si pas connecté -->
    <RouterLink v-else to="/connexion" class="btn-primary mb-6">
      Se connecter
    </RouterLink>

    <!-- Indicateur de chargement discret -->
    <div class="flex items-center gap-2 text-[11px] text-ink-3">
      <span class="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
      Maintenance active — vérification toutes les 30 secondes
    </div>

  </div>
</template>

<script setup>
import { useSettings } from '@/composables/useSettings.js'

const settings = useSettings()

function isImageAvatar(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('/') || val.startsWith('data:'))
}
</script>
