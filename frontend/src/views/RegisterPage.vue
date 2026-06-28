<template>
  <div class="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">

    <!-- Layout : mascotte à gauche, formulaire à droite -->
    <div class="flex flex-col lg:flex-row items-center gap-10 w-full max-w-3xl">

      <!-- ══ COLONNE GAUCHE : mascotte ══ -->
      <div class="w-full lg:w-auto flex justify-center shrink-0 lg:sticky lg:top-1/2 lg:-translate-y-1/2">
        <div class="mascot-col">
          <Transition name="bubble" mode="out-in">
            <!-- Succès -->
            <div v-if="success" key="success" class="bubble-box bubble-success">
              <strong class="block text-[13px] font-extrabold mb-0.5">Compte créé ! 🎉</strong>
              <span class="text-[11px] opacity-80 leading-snug">Tu peux maintenant te connecter.</span>
              <span class="bubble-tail-down bubble-tail-success"/>
            </div>
            <!-- Erreur -->
            <div v-else-if="globalError" key="err" class="bubble-box bubble-error">
              {{ globalError }}
              <span class="bubble-tail-down bubble-tail-error"/>
            </div>
            <!-- Bienvenue (par défaut) -->
            <div v-else key="welcome" class="bubble-box bubble-welcome">
              <strong class="block text-[13px] font-extrabold mb-0.5">Créer un compte !</strong>
              <span class="text-[11px] opacity-75 leading-snug">Rejoins la communauté&nbsp;✨</span>
              <span class="bubble-tail-down bubble-tail-welcome"/>
            </div>
          </Transition>

          <AppMascot :size="150" :class="{ 'mascot-shake': shaking }"/>
        </div>
      </div>

      <!-- ══ COLONNE DROITE : formulaire ══ -->
      <div class="flex-1 w-full min-w-0">

      <!-- Inscriptions fermées -->
      <div v-if="!registrationEnabled" class="bg-bg-1 border border-white/[0.08] rounded-2xl p-6 shadow-2xl text-center">
        <strong class="block text-[14px] font-extrabold text-white mb-1.5">Inscriptions fermées</strong>
        <p class="text-[12px] text-ink-2 leading-relaxed">
          Les nouvelles inscriptions sont temporairement désactivées. Reviens un peu plus tard !
        </p>
      </div>

      <!-- Carte formulaire -->
      <div v-else class="bg-bg-1 border border-white/[0.08] rounded-2xl p-6 shadow-2xl">

        <!-- OAuth : masqué si aucun provider configuré -->
        <template v-if="providers.google || providers.discord">
        <div :class="['mb-5', providers.google && providers.discord ? 'grid grid-cols-2 gap-2' : 'flex']">
          <button v-if="providers.google" type="button" @click="oauthLogin('google')" class="flex-1 flex items-center justify-center gap-2 bg-bg-2 hover:bg-bg-3 border border-white/[0.08] rounded-lg py-2 text-[12px] font-medium text-ink-1 transition-colors">
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button v-if="providers.discord" type="button" @click="oauthLogin('discord')" class="flex-1 flex items-center justify-center gap-2 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-lg py-2 text-[12px] font-medium text-[#7289da] transition-colors">
            <svg class="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Discord
          </button>
        </div>

        <!-- Séparateur -->
        <div class="flex items-center gap-3 mb-5">
          <div class="flex-1 h-px bg-white/[0.07]"></div>
          <span class="text-[11px] text-ink-3">ou avec un e-mail</span>
          <div class="flex-1 h-px bg-white/[0.07]"></div>
        </div>
        </template>

        <form @submit.prevent="submit" class="flex flex-col gap-4">

          <!-- Pseudo -->
          <div>
            <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Pseudo</label>
            <input
              v-model.trim="form.username"
              type="text"
              autocomplete="username"
              maxlength="24"
              placeholder="Ex : Otaku_Fan42"
              class="auth-input"
              :class="errors.username ? 'border-red-500/60 focus:border-red-500' : ''"
              @input="errors.username = ''"
            />
            <p v-if="errors.username" class="text-[10px] text-red-400 mt-1">{{ errors.username }}</p>
            <p v-else class="text-[10px] text-ink-3 mt-1">3 à 24 caractères · lettres, chiffres et underscores</p>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Adresse e-mail</label>
            <input
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              placeholder="exemple@mail.com"
              class="auth-input"
              :class="errors.email ? 'border-red-500/60 focus:border-red-500' : ''"
              @input="errors.email = ''"
            />
            <p v-if="errors.email" class="text-[10px] text-red-400 mt-1">{{ errors.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Mot de passe</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="8 caractères minimum"
                class="auth-input pr-10"
                :class="errors.password ? 'border-red-500/60 focus:border-red-500' : ''"
                @input="errors.password = ''"
              />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="text-[10px] text-red-400 mt-1">{{ errors.password }}</p>

            <!-- Indicateur de force -->
            <div v-if="form.password" class="flex gap-1 mt-2">
              <div v-for="i in 4" :key="i"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="i <= passwordStrength ? strengthColor : 'bg-bg-3'"
              ></div>
            </div>
            <p v-if="form.password" class="text-[10px] mt-1" :class="strengthTextColor">{{ strengthLabel }}</p>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label class="block text-[11px] font-semibold text-ink-2 mb-1.5">Confirmer le mot de passe</label>
            <div class="relative">
              <input
                v-model="form.confirm"
                :type="showConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="auth-input pr-10"
                :class="errors.confirm ? 'border-red-500/60 focus:border-red-500' : ''"
                @input="errors.confirm = ''"
              />
              <button type="button" @click="showConfirm = !showConfirm"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-1 transition-colors">
                <svg v-if="!showConfirm" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.confirm" class="text-[10px] text-red-400 mt-1">{{ errors.confirm }}</p>
          </div>

          <!-- CGU -->
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <div
              class="w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5"
              :class="form.cgu ? 'bg-orange border-orange' : errors.cgu ? 'bg-bg-2 border-red-500/60' : 'bg-bg-2 border-white/[0.15]'"
              @click="form.cgu = !form.cgu; errors.cgu = ''"
            >
              <svg v-if="form.cgu" class="w-2.5 h-2.5 fill-white" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5"/></svg>
            </div>
            <span class="text-[11px] text-ink-2 leading-relaxed">
              J'accepte les
              <a href="#" class="text-orange hover:underline">conditions d'utilisation</a>
              et la
              <a href="#" class="text-orange hover:underline">politique de confidentialité</a>
            </span>
          </label>
          <p v-if="errors.cgu" class="text-[10px] text-red-400 -mt-2">{{ errors.cgu }}</p>

          <!-- Captcha -->
          <AppCaptcha ref="captchaRef" />

          <!-- Bouton -->
          <button
            type="submit"
            class="btn-primary justify-center py-2.5 text-[13px] mt-1"
            :disabled="loading || success"
          >
            <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ loading ? 'Création du compte…' : 'Créer mon compte' }}
          </button>
        </form>
      </div>

      <!-- Lien connexion -->
      <p class="text-center text-[12px] text-ink-3 mt-5">
        Déjà un compte ?
        <RouterLink to="/connexion" class="text-orange hover:text-orange-hover font-semibold transition-colors ml-1">
          Se connecter
        </RouterLink>
      </p>

      </div><!-- fin colonne droite -->
    </div><!-- fin layout -->
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppCaptcha from '@/components/AppCaptcha.vue'
import AppMascot from '@/components/AppMascot.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useOAuthProviders, loadProviders } from '@/composables/useOAuthProviders.js'
import { useBeta } from '@/composables/useBeta.js'

const { registrationEnabled } = useBeta()
const captchaRef = ref(null)
const form = reactive({ username: '', email: '', password: '', confirm: '', cgu: false })
const errors = reactive({ username: '', email: '', password: '', confirm: '', cgu: '' })
const globalError = ref('')
const showPassword = ref(false)
const showConfirm  = ref(false)
const loading = ref(false)
const success = ref(false)

const router    = useRouter()
const { register } = useAuth()
const providers = useOAuthProviders()

function oauthLogin(provider) {
  window.location.href = `/api/auth/${provider}`
}

onMounted(() => { loadProviders() })

const shaking = ref(false)
watch(globalError, (val) => {
  if (val) {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 520)
  }
})

// ── Force du mot de passe ──────────────────────────────────────────────────
const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) || /[^a-zA-Z0-9]/.test(p)) score++
  return Math.max(1, score)
})

const strengthColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'bg-red-500'
  if (s === 2) return 'bg-orange'
  if (s === 3) return 'bg-yellow-400'
  return 'bg-green-500'
})

const strengthTextColor = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'text-red-400'
  if (s === 2) return 'text-orange'
  if (s === 3) return 'text-yellow-400'
  return 'text-green-400'
})

const strengthLabel = computed(() => {
  const s = passwordStrength.value
  if (s <= 1) return 'Très faible'
  if (s === 2) return 'Faible'
  if (s === 3) return 'Correct'
  return 'Robuste'
})

// ── Validation ─────────────────────────────────────────────────────────────
function validate() {
  let ok = true
  Object.keys(errors).forEach(k => errors[k] = '')

  if (!form.username || form.username.length < 3) {
    errors.username = 'Le pseudo doit contenir au moins 3 caractères.'
    ok = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Lettres, chiffres et underscores uniquement.'
    ok = false
  }

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Adresse e-mail invalide.'
    ok = false
  }

  if (!form.password || form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    ok = false
  }

  if (form.password !== form.confirm) {
    errors.confirm = 'Les mots de passe ne correspondent pas.'
    ok = false
  }

  if (!form.cgu) {
    errors.cgu = 'Tu dois accepter les conditions d\'utilisation.'
    ok = false
  }

  return ok
}

async function submit() {
  globalError.value = ''
  success.value = false
  if (!validate()) return
  if (!captchaRef.value?.validate()) return

  loading.value = true
  try {
    await register(form.username, form.email, form.password)
    success.value = true
    setTimeout(() => router.push('/profil'), 1500)
  } catch (err) {
    console.error('[register]', err.status, err.message, err.data)
    globalError.value = err.status === 409
      ? 'Ce pseudo ou cet email est déjà utilisé.'
      : (err.message || 'Une erreur est survenue. Réessaie dans un instant.')
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* ── Zone mascotte ────────────────────────────────── */
.mascot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ── Bulle de dialogue ────────────────────────────── */
.bubble-box {
  position: relative;
  padding: 9px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.45;
  text-align: center;
  border: 1px solid;
  max-width: 200px;
  margin-bottom: 10px;
}
.bubble-welcome {
  background: rgb(255 255 255 / 0.06);
  border-color: rgb(255 255 255 / 0.13);
  color: rgb(var(--color-ink-1));
}
.bubble-error {
  background: rgb(239 68 68 / 0.12);
  border-color: rgb(239 68 68 / 0.35);
  color: #f87171;
}
.bubble-success {
  background: rgb(34 197 94 / 0.12);
  border-color: rgb(34 197 94 / 0.35);
  color: #4ade80;
}

/* Queue triangulaire vers le bas */
.bubble-tail-down {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}
.bubble-tail-welcome { border-top: 8px solid rgb(255 255 255 / 0.13); }
.bubble-tail-error   { border-top: 8px solid rgb(239 68 68 / 0.35); }
.bubble-tail-success { border-top: 8px solid rgb(34 197 94 / 0.35); }

/* ── Transitions bulle ────────────────────────────── */
.bubble-enter-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bubble-leave-active { transition: all 0.16s ease-in; }
.bubble-enter-from, .bubble-leave-to { opacity: 0; transform: scale(0.88); }

/* ── Shake mascotte sur erreur ────────────────────── */
.mascot-shake :deep(.mascot-img) {
  animation: reg-shake 0.5s ease-in-out !important;
}
@keyframes reg-shake {
  0%, 100% { transform: translateX(0); }
  18%       { transform: translateX(-7px) rotate(-3deg); }
  36%       { transform: translateX(7px)  rotate(3deg);  }
  54%       { transform: translateX(-5px) rotate(-2deg); }
  72%       { transform: translateX(5px)  rotate(2deg);  }
  90%       { transform: translateX(-2px); }
}

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
