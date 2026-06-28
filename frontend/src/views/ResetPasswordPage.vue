<template>
  <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="bg-bg-1 border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <h1 class="text-[15px] font-extrabold text-white mb-1">Nouveau mot de passe</h1>

        <template v-if="!token">
          <p class="text-[12px] text-red-400 mt-2">
            Lien invalide. Vérifie que tu as bien copié l'adresse complète depuis l'e-mail.
          </p>
        </template>

        <template v-else-if="done">
          <p class="text-[12px] text-green-400 mt-2">Mot de passe mis à jour, te voilà connecté(e).</p>
          <RouterLink to="/profil" class="btn-primary justify-center py-2.5 text-[13px] mt-4 w-full">
            Aller à mon profil
          </RouterLink>
        </template>

        <template v-else>
          <form @submit.prevent="submit" class="flex flex-col gap-3 mt-2">
            <div>
              <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Nouveau mot de passe</label>
              <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="6 caractères minimum"
                class="auth-input"
                @input="error = ''"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Confirmer</label>
              <input
                v-model="confirm"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                class="auth-input"
                @input="error = ''"
              />
            </div>
            <p v-if="error" class="text-[10px] text-red-400">{{ error }}</p>
            <button type="submit" class="btn-primary justify-center py-2.5 text-[13px]" :disabled="loading || !password">
              {{ loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/auth.js'
import { useAuth } from '@/composables/useAuth.js'

const route  = useRoute()
const router = useRouter()
const { loginWithToken } = useAuth()

const token = computed(() => route.query.token || '')

const password = ref('')
const confirm  = ref('')
const error    = ref('')
const loading  = ref(false)
const done     = ref(false)

async function submit() {
  error.value = ''
  if (password.value.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  loading.value = true
  try {
    const { token: jwt, refreshToken } = await authService.resetPassword(token.value, password.value)
    await loginWithToken(jwt, refreshToken)
    done.value = true
    setTimeout(() => router.push('/profil'), 1500)
  } catch (err) {
    error.value = err.message || 'Lien invalide ou expiré.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-input {
  width: 100%;
  background: rgb(var(--color-bg-2));
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 13px;
  color: rgb(var(--color-ink-1));
  outline: none;
  transition: border-color 0.15s;
}
.auth-input::placeholder { color: rgb(var(--color-ink-3)); }
.auth-input:focus { border-color: rgb(var(--color-orange) / 0.6); }
</style>
