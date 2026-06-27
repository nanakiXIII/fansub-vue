<template>
  <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="bg-bg-1 border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <h1 class="text-[15px] font-extrabold text-ink-1 mb-1">Devenir admin</h1>

        <template v-if="!settings.uid">
          <p class="text-[12px] text-ink-3 mt-2">
            Connecte-toi d'abord avec le compte que tu veux promouvoir admin.
          </p>
          <RouterLink to="/connexion" class="btn-primary justify-center py-2.5 text-[13px] mt-4 w-full">
            Se connecter
          </RouterLink>
        </template>

        <template v-else-if="done">
          <p class="text-[12px] text-green-400 mt-2">
            Compte « {{ settings.username }} » promu admin. Le token est désormais invalide.
          </p>
          <RouterLink to="/admin" class="btn-primary justify-center py-2.5 text-[13px] mt-4 w-full">
            Aller à l'administration
          </RouterLink>
        </template>

        <template v-else>
          <p class="text-[12px] text-ink-3 mt-2 mb-4">
            Connecté en tant que <strong class="text-ink-1">{{ settings.username }}</strong>.
            Entre le token (usage unique) défini dans <code class="text-orange">ADMIN_CLAIM_TOKEN</code>.
          </p>
          <form @submit.prevent="submit" class="flex flex-col gap-3">
            <input
              v-model.trim="token"
              type="text"
              autocomplete="off"
              placeholder="Token"
              class="auth-input"
              :class="error ? 'border-red-500/60 focus:border-red-500' : ''"
              @input="error = ''"
            />
            <p v-if="error" class="text-[10px] text-red-400">{{ error }}</p>
            <button type="submit" class="btn-primary justify-center py-2.5 text-[13px]" :disabled="loading || !token">
              {{ loading ? 'Vérification…' : 'Devenir admin' }}
            </button>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettings } from '@/composables/useSettings.js'
import { authService } from '@/services/auth.js'

const settings = useSettings()
const token = ref('')
const error = ref('')
const loading = ref(false)
const done = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { user } = await authService.claimAdmin(token.value)
    settings.isAdmin = user.isAdmin
    settings.permissions = user.permissions ?? []
    done.value = true
  } catch (err) {
    error.value = err.message || 'Une erreur est survenue.'
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
