<template>
  <Teleport to="body">
    <!-- Bouton flottant -->
    <Transition name="bug-fab">
      <button
        v-if="betaEnabled"
        @click="toggle"
        class="bug-fab"
        :class="{ 'bug-fab--open': open }"
        aria-label="Signaler un bug"
        title="Signaler un bug"
      >
        <svg v-if="!open" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        <span class="bug-beta-badge">BETA</span>
      </button>
    </Transition>

    <!-- Panel -->
    <Transition name="bug-panel">
      <div v-if="open && betaEnabled" class="bug-panel">
        <div class="bug-header">
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-bold text-white">Signaler un bug</span>
            <span class="text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded px-1.5 py-px">BETA</span>
          </div>
          <p class="text-[10px] text-ink-3 mt-0.5">Tu testes une version bêta — merci pour ton aide !</p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submitReport" class="bug-body">
          <div v-if="sent" class="text-center py-6">
            <div class="text-3xl mb-2">✅</div>
            <p class="text-[13px] font-bold text-white mb-1">Rapport envoyé !</p>
            <p class="text-[11px] text-ink-3">Merci pour ton retour.</p>
            <button type="button" @click="resetForm" class="mt-4 text-[11px] text-accent-1 hover:underline">Signaler un autre bug</button>
          </div>

          <template v-else>
            <div>
              <label class="bug-label">Titre <span class="text-ink-3">(optionnel)</span></label>
              <input
                v-model="form.title"
                type="text"
                maxlength="200"
                placeholder="Ex : Le bouton ne fonctionne pas"
                class="bug-input"
              />
            </div>

            <div>
              <label class="bug-label">Description <span class="text-red-400">*</span></label>
              <textarea
                v-model="form.description"
                maxlength="2000"
                rows="4"
                placeholder="Décris ce qui ne va pas, les étapes pour reproduire…"
                class="bug-input resize-none"
                required
              ></textarea>
              <div class="text-[9px] text-ink-3 text-right mt-0.5">{{ form.description.length }}/2000</div>
            </div>

            <div>
              <label class="bug-label">Page concernée</label>
              <input
                v-model="form.url"
                type="text"
                class="bug-input"
                readonly
              />
            </div>

            <div v-if="errorMsg" class="text-[11px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{{ errorMsg }}</div>

            <button
              type="submit"
              :disabled="submitting || !form.description.trim()"
              class="bug-submit-btn"
            >
              <span v-if="submitting">Envoi…</span>
              <span v-else>Envoyer le rapport</span>
            </button>
          </template>
        </form>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { http } from '@/services/http.js'
import { useBeta } from '@/composables/useBeta.js'

const { betaEnabled } = useBeta()
const route = useRoute()

const open      = ref(false)
const sent      = ref(false)
const submitting = ref(false)
const errorMsg  = ref('')

const form = reactive({
  title:       '',
  description: '',
  url:         '',
})

watch(open, (val) => {
  if (val) form.url = window.location.href
})

watch(() => route.fullPath, () => {
  form.url = window.location.href
})

function toggle() {
  open.value = !open.value
  if (open.value) form.url = window.location.href
}

async function submitReport() {
  if (!form.description.trim()) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await http.post('/bugs', {
      title:       form.title,
      description: form.description,
      url:         form.url,
      userAgent:   navigator.userAgent,
    })
    sent.value = true
  } catch (err) {
    errorMsg.value = err.message || 'Erreur lors de l\'envoi'
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.url = window.location.href
  sent.value = false
  errorMsg.value = ''
}
</script>

<style scoped>
.bug-fab {
  position: fixed;
  bottom: 5.5rem;
  left: 1.5rem;
  z-index: 9000;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border: none;
}
.bug-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 28px rgba(249, 115, 22, 0.55);
}
.bug-fab--open {
  background: rgba(255,255,255,0.08);
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}

.bug-beta-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f97316;
  color: white;
  font-size: 7px;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 999px;
  letter-spacing: 0.05em;
}

.bug-panel {
  position: fixed;
  bottom: 9.5rem;
  left: 1.5rem;
  z-index: 8999;
  width: 340px;
  background: #1a1a2e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.15);
  overflow: hidden;
  max-height: 520px;
}

.bug-header {
  padding: 12px 14px;
  background: rgba(249,115,22,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.bug-body {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.bug-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin-bottom: 4px;
}

.bug-input {
  width: 100%;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 7px 10px;
  color: white;
  font-size: 12px;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.bug-input:focus { border-color: rgba(249,115,22,0.5); }
.bug-input::placeholder { color: rgba(255,255,255,0.25); }
.bug-input[readonly] { opacity: 0.5; cursor: default; }

.bug-submit-btn {
  width: 100%;
  padding: 9px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ef4444);
  color: white;
  font-size: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 2px;
}
.bug-submit-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.bug-submit-btn:not(:disabled):hover { opacity: 0.87; }

/* Transitions */
.bug-fab-enter-active, .bug-fab-leave-active { transition: opacity 0.2s, transform 0.2s; }
.bug-fab-enter-from, .bug-fab-leave-to { opacity: 0; transform: scale(0.8); }

.bug-panel-enter-active { animation: bugPanelIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bug-panel-leave-active { animation: bugPanelOut 0.18s ease-in forwards; }
@keyframes bugPanelIn  { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes bugPanelOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(12px) scale(0.96); } }

@media (max-width: 400px) {
  .bug-panel { width: calc(100vw - 2rem); left: 1rem; }
}
</style>
