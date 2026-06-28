<template>
  <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="bg-bg-1 border border-white/[0.08] rounded-2xl p-6 shadow-2xl text-center">
        <h1 class="text-[15px] font-extrabold text-white mb-1.5">Vérification de l'e-mail</h1>

        <p v-if="loading" class="text-[12px] text-ink-3 mt-2">Vérification en cours…</p>
        <p v-else-if="success" class="text-[12px] text-green-400 mt-2">Ton adresse e-mail est confirmée. Merci !</p>
        <p v-else class="text-[12px] text-red-400 mt-2">{{ error }}</p>

        <RouterLink v-if="!loading" to="/profil" class="btn-primary justify-center py-2.5 text-[13px] mt-4 w-full">
          Aller à mon profil
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '@/services/auth.js'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const error   = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    error.value = 'Lien invalide.'
    loading.value = false
    return
  }
  try {
    await authService.verifyEmail(token)
    success.value = true
  } catch (err) {
    error.value = err.message || 'Lien invalide ou expiré.'
  } finally {
    loading.value = false
  }
})
</script>
