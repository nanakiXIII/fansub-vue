<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div>
      <h1 class="text-[18px] font-extrabold text-white">Alertes</h1>
      <p class="text-[11px] text-ink-3 mt-0.5">Envoie une notification instantanée à tous les utilisateurs connectés ou à quelqu'un en particulier</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

      <!-- ── Formulaire ── -->
      <form @submit.prevent="send" class="flex flex-col gap-5">

        <!-- Type -->
        <div class="sidebar-card p-4">
          <span class="field-label block mb-3">Type d'alerte</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="t in TYPES" :key="t.id"
              type="button"
              @click="form.type = t.id"
              class="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12px] font-semibold transition-colors"
              :class="form.type === t.id ? t.activeClass : 'border-white/[0.07] bg-bg-2 text-ink-2 hover:text-white hover:border-white/20'"
            >
              <span class="w-4 h-4 shrink-0" v-html="t.icon"></span>
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Contenu -->
        <div class="sidebar-card p-4 flex flex-col gap-4">
          <span class="field-label block -mb-1">Contenu</span>

          <div>
            <span class="field-label block mb-1.5">Titre <span class="normal-case font-normal text-ink-3">(optionnel)</span></span>
            <input
              v-model="form.title"
              type="text"
              maxlength="80"
              placeholder="Ex : Maintenance planifiée"
              class="field-input"
            />
          </div>

          <div>
            <span class="field-label block mb-1.5">Message *</span>
            <textarea
              v-model="form.message"
              maxlength="500"
              rows="3"
              placeholder="Contenu de l'alerte…"
              class="field-input resize-none"
              required
            ></textarea>
            <div class="text-[10px] text-ink-3 mt-1 text-right">{{ form.message.length }}/500</div>
          </div>
        </div>

        <!-- Destinataires -->
        <div class="sidebar-card p-4 flex flex-col gap-3">
          <span class="field-label block">Destinataires</span>

          <label class="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors -mx-1">
            <div class="relative w-4 h-4 shrink-0">
              <input type="radio" v-model="form.targetType" value="all" class="sr-only peer" />
              <div class="w-4 h-4 rounded-full border border-white/20 peer-checked:border-orange peer-checked:bg-orange/10 transition-colors"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div v-if="form.targetType === 'all'" class="w-2 h-2 rounded-full bg-orange"></div>
              </div>
            </div>
            <div>
              <div class="text-[12px] font-semibold text-ink-1 group-hover:text-white transition-colors">Tous les utilisateurs connectés</div>
              <div class="text-[10px] text-ink-3 mt-px">Broadcast à toutes les sessions actives</div>
            </div>
          </label>

          <label class="flex items-center gap-3 cursor-pointer group py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors -mx-1">
            <div class="relative w-4 h-4 shrink-0">
              <input type="radio" v-model="form.targetType" value="user" class="sr-only peer" />
              <div class="w-4 h-4 rounded-full border border-white/20 peer-checked:border-orange peer-checked:bg-orange/10 transition-colors"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div v-if="form.targetType === 'user'" class="w-2 h-2 rounded-full bg-orange"></div>
              </div>
            </div>
            <div>
              <div class="text-[12px] font-semibold text-ink-1 group-hover:text-white transition-colors">Utilisateur spécifique</div>
              <div class="text-[10px] text-ink-3 mt-px">Envoyer à une seule personne</div>
            </div>
          </label>

          <!-- Sélecteur user -->
          <div v-if="form.targetType === 'user'" class="flex flex-col gap-2 mt-1">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                v-model="userSearch"
                type="text"
                placeholder="Rechercher un utilisateur…"
                class="field-input pl-8"
                @focus="showDropdown = true"
                @blur="onBlurSearch"
              />
            </div>

            <div
              v-if="showDropdown && filteredUsers.length"
              class="bg-bg-2 border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl"
            >
              <button
                v-for="u in filteredUsers" :key="u._id"
                type="button"
                @mousedown.prevent="selectUser(u)"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors border-b border-white/[0.04] last:border-0"
              >
                <div
                  class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden"
                  :style="isImageAvatar(u.avatar) ? {} : { background: u.avatar || '#334155' }"
                >
                  <img loading="lazy" v-if="isImageAvatar(u.avatar)" :src="u.avatar" class="w-full h-full object-cover" />
                  <span v-else>{{ (u.username || '?')[0].toUpperCase() }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] font-semibold text-white truncate">{{ u.username }}</div>
                  <div v-if="u.email" class="text-[10px] text-ink-3 truncate">{{ u.email }}</div>
                </div>
                <span v-if="u.isAdmin" class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 shrink-0">Admin</span>
              </button>
            </div>

            <div v-if="form.targetUser" class="flex items-center gap-3 px-3 py-2.5 bg-bg-2 rounded-xl border border-orange/20">
              <div
                class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden"
                :style="isImageAvatar(form.targetUser.avatar) ? {} : { background: form.targetUser.avatar || '#334155' }"
              >
                <img loading="lazy" v-if="isImageAvatar(form.targetUser.avatar)" :src="form.targetUser.avatar" class="w-full h-full object-cover" />
                <span v-else>{{ (form.targetUser.username || '?')[0].toUpperCase() }}</span>
              </div>
              <span class="text-[12px] font-semibold text-white flex-1 truncate">{{ form.targetUser.username }}</span>
              <button type="button" @click="clearUser" class="text-ink-3 hover:text-red-400 transition-colors shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Erreur -->
        <div v-if="error" class="flex items-center gap-2 text-[12px] text-red-400 px-3 py-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {{ error }}
        </div>

        <!-- Bouton envoi -->
        <button
          type="submit"
          :disabled="sending || (form.targetType === 'user' && !form.targetUser)"
          class="btn-primary justify-center py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg v-if="!sending" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>
          {{ sending ? 'Envoi en cours…' : form.targetType === 'all' ? 'Envoyer à tous' : `Envoyer à ${form.targetUser?.username ?? '…'}` }}
        </button>

      </form>

      <!-- ── Colonne droite ── -->
      <div class="flex flex-col gap-4">

        <!-- Aperçu live -->
        <div class="sidebar-card p-4">
          <span class="field-label block mb-3">Aperçu</span>
          <div class="flex gap-3 p-3.5 rounded-xl border" :class="currentStyle.wrapper">
            <div class="w-5 h-5 shrink-0 mt-0.5" :class="currentStyle.icon" v-html="currentIcon"></div>
            <div class="flex-1 min-w-0">
              <div v-if="form.title" class="text-[13px] font-bold text-white mb-0.5 truncate">{{ form.title }}</div>
              <div class="text-[12px] leading-relaxed break-words" :class="currentStyle.text">
                {{ form.message || 'Message de l\'alerte…' }}
              </div>
              <div class="text-[10px] text-ink-3 mt-1.5 flex items-center gap-1">
                <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M4 20c0-3.9 3.6-7 8-7s8 3.1 8 7"/></svg>
                {{ settings.username }}
              </div>
            </div>
          </div>
        </div>

        <!-- Historique envois (session) -->
        <div class="sidebar-card">
          <div class="sidebar-card-header">Envois récents</div>
          <div v-if="!history.length" class="px-4 py-8 text-[11px] text-ink-3 text-center">Aucun envoi cette session</div>
          <div v-else class="divide-y divide-white/[0.04]">
            <div
              v-for="h in history" :key="h.id"
              class="flex items-start gap-3 px-4 py-3"
            >
              <span class="w-2 h-2 rounded-full mt-1.5 shrink-0" :class="styleFor(h.type).dot"></span>
              <div class="flex-1 min-w-0">
                <div class="text-[12px] font-semibold text-white truncate">{{ h.title || h.message }}</div>
                <div class="text-[10px] text-ink-3 mt-0.5 flex items-center gap-1.5">
                  <span>{{ h.targetType === 'all' ? 'Tous' : h.targetUser?.username }}</span>
                  <span class="opacity-40">·</span>
                  <span>{{ fmtTime(h.sentAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { useSettings } from '@/composables/useSettings.js'

const settings = useSettings()

// ── Types ────────────────────────────────────────────────────────
const TYPES = [
  {
    id: 'info', label: 'Info', activeClass: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  },
  {
    id: 'warning', label: 'Avertissement', activeClass: 'border-orange/40 bg-orange/10 text-orange',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  },
  {
    id: 'success', label: 'Succès', activeClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  },
  {
    id: 'error', label: 'Erreur', activeClass: 'border-red-500/40 bg-red-500/10 text-red-400',
    icon: '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  },
]

const STYLES = {
  info:    { wrapper: 'bg-blue-950/60 border-blue-500/40',       icon: 'text-blue-400',    text: 'text-blue-100',    dot: 'bg-blue-400'    },
  warning: { wrapper: 'bg-orange-950/60 border-orange/40',       icon: 'text-orange',      text: 'text-orange-100',  dot: 'bg-orange'      },
  success: { wrapper: 'bg-emerald-950/60 border-emerald-500/40', icon: 'text-emerald-400', text: 'text-emerald-100', dot: 'bg-emerald-400' },
  error:   { wrapper: 'bg-red-950/60 border-red-500/40',         icon: 'text-red-400',     text: 'text-red-100',     dot: 'bg-red-400'     },
}
function styleFor(type) { return STYLES[type] ?? STYLES.info }

const currentStyle = computed(() => styleFor(form.type))
const currentIcon  = computed(() => TYPES.find(t => t.id === form.type)?.icon ?? '')

// ── Formulaire ───────────────────────────────────────────────────
const form = reactive({ type: 'info', title: '', message: '', targetType: 'all', targetUser: null })
const sending = ref(false)
const error   = ref('')
const history = ref([])

// ── Sélecteur utilisateur ─────────────────────────────────────────
const allUsers     = ref([])
const userSearch   = ref('')
const showDropdown = ref(false)

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  const list = q ? allUsers.value.filter(u => u.username?.toLowerCase().includes(q)) : allUsers.value
  return list.slice(0, 15)
})

function selectUser(u) {
  form.targetUser = u
  userSearch.value = u.username
  showDropdown.value = false
}
function clearUser() { form.targetUser = null; userSearch.value = '' }
function onBlurSearch() { setTimeout(() => { showDropdown.value = false }, 150) }
function isImageAvatar(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('/') || val.startsWith('data:'))
}

// ── Envoi ─────────────────────────────────────────────────────────
async function send() {
  if (!form.message.trim()) return
  if (form.targetType === 'user' && !form.targetUser) return
  error.value = ''
  sending.value = true
  try {
    await http.post('/alerts', {
      type:         form.type,
      title:        form.title || undefined,
      message:      form.message,
      targetType:   form.targetType,
      targetUserId: form.targetType === 'user' ? form.targetUser._id : undefined,
    })
    history.value.unshift({
      id: Date.now(), type: form.type,
      title: form.title, message: form.message,
      targetType: form.targetType,
      targetUser: form.targetUser ? { ...form.targetUser } : null,
      sentAt: new Date(),
    })
    if (history.value.length > 10) history.value.pop()
    form.message = ''
    form.title   = ''
  } catch (e) {
    error.value = e.message ?? 'Erreur lors de l\'envoi'
  }
  sending.value = false
}

function fmtTime(date) {
  return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try { allUsers.value = await http.get('/auth/users') } catch {}
})
</script>

<style scoped>
.field-label { @apply text-[10px] font-bold text-ink-3 uppercase tracking-widest; }
.field-input  { @apply w-full bg-bg-2 border border-white/[0.1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors; }
</style>
