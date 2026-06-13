<template>
  <div class="min-h-screen bg-bg-0 flex items-center justify-center">
    <div class="flex flex-col items-center gap-4 text-center px-6">
      <template v-if="!failed">
        <svg class="w-10 h-10 animate-spin text-orange" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p class="text-[14px] text-ink-2">Connexion en cours…</p>
      </template>
      <template v-else>
        <div class="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
        <p class="text-[14px] text-ink-1 font-semibold">Connexion annulée</p>
        <p class="text-[12px] text-ink-3">La connexion via le fournisseur a échoué ou a été annulée.</p>
        <RouterLink to="/connexion" class="btn-primary text-[12px] px-4 py-2">Réessayer</RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const { loginWithToken } = useAuth()
const failed = ref(false)

onMounted(async () => {
  const params       = new URLSearchParams(window.location.search)
  const token        = params.get('token')
  const refreshToken = params.get('refreshToken')
  const error        = params.get('oauth')

  if (error || !token) {
    failed.value = true
    return
  }

  await loginWithToken(token, refreshToken)
  router.replace('/')
})
</script>
