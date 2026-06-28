<template>
  <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-sm">
      <div class="bg-bg-1 border border-white/[0.08] rounded-2xl p-6 shadow-2xl">
        <h1 class="text-[15px] font-extrabold text-white mb-1">Mot de passe oublié</h1>

        <template v-if="sent">
          <p class="text-[12px] text-ink-2 mt-2 leading-relaxed">
            Si cette adresse correspond à un compte, un e-mail avec un lien de réinitialisation vient d'être envoyé.
          </p>
          <RouterLink to="/connexion" class="btn-primary justify-center py-2.5 text-[13px] mt-4 w-full">
            Retour à la connexion
          </RouterLink>
        </template>

        <template v-else>
          <p class="text-[12px] text-ink-3 mt-2 mb-4 leading-relaxed">
            Indique l'adresse e-mail de ton compte, on t'envoie un lien pour choisir un nouveau mot de passe.
          </p>
          <form @submit.prevent="submit" class="flex flex-col gap-3">
            <input
              v-model.trim="email"
              type="email"
              autocomplete="email"
              placeholder="exemple@mail.com"
              class="auth-input"
              :class="error ? 'border-red-500/60 focus:border-red-500' : ''"
              @input="error = ''"
            />
            <p v-if="error" class="text-[10px] text-red-400">{{ error }}</p>
            <button type="submit" class="btn-primary justify-center py-2.5 text-[13px]" :disabled="loading || !email">
              {{ loading ? 'Envoi…' : 'Envoyer le lien' }}
            </button>
          </form>
          <p class="text-center text-[12px] text-ink-3 mt-4">
            <RouterLink to="/connexion" class="text-orange hover:text-orange-hover font-semibold transition-colors">
              Retour à la connexion
            </RouterLink>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { authService } from '@/services/auth.js'

const email   = ref('')
const error   = ref('')
const loading = ref(false)
const sent    = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authService.forgotPassword(email.value)
    sent.value = true
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
