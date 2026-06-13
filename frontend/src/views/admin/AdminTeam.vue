<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Équipe</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ members.length }} membre(s)</p>
      </div>
      <button @click="openAdd" class="btn-primary text-[12px] py-2 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter
      </button>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="m in members"
        :key="m._id"
        class="bg-bg-1 border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <div
          class="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden"
          :style="m.avatarGradient ? { background: m.avatarGradient } : { background: '#444' }"
        >
          <img loading="lazy" v-if="m.avatar" :src="m.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ m.initials }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-bold text-white">{{ m.name }}</div>
          <div class="text-[10px] text-ink-3">{{ m.department }} · {{ m.role }}</div>
        </div>
        <span
          class="shrink-0 text-[9px] font-bold uppercase rounded-full px-2 py-0.5 border"
          :class="m.active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-bg-2 text-ink-3 border-white/10'"
        >{{ m.active ? 'Actif' : 'Inactif' }}</span>

        <button @click="toggleActive(m)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors" title="Basculer actif/inactif">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button @click="openEdit(m)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors" title="Modifier">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="deleteMember(m)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Supprimer">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!members.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun membre.</div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
          <div class="text-[15px] font-extrabold text-white mb-4">
            {{ modal.mode === 'add' ? 'Ajouter un membre' : 'Modifier le membre' }}
          </div>

          <div class="flex flex-col gap-3">

            <!-- Sélecteur d'utilisateur (ajout uniquement) -->
            <template v-if="modal.mode === 'add'">
              <label class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Utilisateur *</span>
                <div class="relative">
                  <input
                    v-model="userSearch"
                    @focus="showUserList = true"
                    @blur="onUserSearchBlur"
                    class="admin-input pr-8"
                    placeholder="Rechercher un utilisateur…"
                    autocomplete="off"
                  />
                  <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div
                  v-if="showUserList && filteredAvailableUsers.length"
                  class="bg-bg-2 border border-white/[0.1] rounded-xl overflow-hidden mt-0.5 max-h-44 overflow-y-auto"
                >
                  <button
                    v-for="u in filteredAvailableUsers" :key="u._id"
                    @mousedown.prevent="selectUser(u)"
                    class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
                    :class="form.userId === u._id ? 'bg-white/[0.06]' : ''"
                  >
                    <div class="w-7 h-7 rounded-full bg-bg-1 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-bold text-ink-2">
                      <img loading="lazy" v-if="u.avatar" :src="u.avatar" class="w-full h-full object-cover" />
                      <span v-else>{{ u.username.slice(0, 2).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0">
                      <div class="text-[12px] text-white font-semibold">{{ u.username }}</div>
                      <div v-if="u.isAdmin" class="text-[9px] text-orange font-bold">Admin</div>
                    </div>
                    <svg v-if="form.userId === u._id" class="ml-auto w-3.5 h-3.5 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                </div>
                <div
                  v-else-if="showUserList && userSearch && !filteredAvailableUsers.length"
                  class="bg-bg-2 border border-white/[0.1] rounded-xl px-3 py-2.5 mt-0.5 text-[11px] text-ink-3"
                >
                  Aucun utilisateur disponible
                </div>
              </label>

              <!-- Aperçu utilisateur sélectionné -->
              <div v-if="selectedUser" class="flex items-center gap-3 bg-bg-2 border border-white/[0.08] rounded-xl px-3 py-2.5">
                <div class="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-bold text-white bg-bg-1">
                  <img loading="lazy" v-if="selectedUser.avatar" :src="selectedUser.avatar" class="w-full h-full object-cover" />
                  <span v-else>{{ selectedUser.username.slice(0, 2).toUpperCase() }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-[12px] font-bold text-white">{{ selectedUser.username }}</div>
                  <div class="text-[10px] text-ink-3">Compte sélectionné</div>
                </div>
                <button @click="clearUser" class="text-ink-3 hover:text-white transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div v-else-if="!availableUsers.length" class="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
                Tous les utilisateurs sont déjà dans l'équipe.
              </div>

              <div class="border-t border-white/[0.07] pt-3 mt-1"></div>
            </template>

            <!-- Nom affiché -->
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Nom affiché *</span>
              <input v-model="form.name" class="admin-input" placeholder="Kitsune_sub" />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Rôle</span>
              <input v-model="form.role" class="admin-input" placeholder="Fondatrice & coordination" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Département *</span>
              <select v-model="form.department" class="admin-input">
                <option value="">-- Choisir --</option>
                <option v-for="d in departments" :key="d" :value="d">{{ d }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Depuis</span>
              <input v-model="form.joined" class="admin-input" placeholder="2019" />
            </label>

            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Description</span>
              <textarea v-model="form.bio" class="admin-input resize-none h-20" placeholder="Courte description…"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Postes <span class="normal-case font-normal">(séparés par des virgules)</span></span>
              <input v-model="form.tagsStr" class="admin-input" placeholder="Traduction, Timing, QC" />
            </label>

            <!-- Gradient builder -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Dégradé avatar</span>
              <div class="flex items-center gap-3 p-3 bg-bg-2 rounded-lg border border-white/[0.06]">
                <div class="flex items-center gap-1.5">
                  <div v-for="(color, i) in gradStops" :key="i" class="flex flex-col items-center gap-1">
                    <input
                      type="color" :value="color"
                      @input="e => setGradStop(i, e.target.value)"
                      class="w-8 h-8 rounded-lg cursor-pointer border border-white/10 p-0.5 bg-transparent"
                    />
                    <span class="text-[8px] text-ink-3 font-mono">{{ color }}</span>
                  </div>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <div class="flex items-center gap-1">
                    <input type="number" v-model.number="gradAngle" @input="buildGradient" min="0" max="360" class="admin-input w-14 text-center px-1 py-1.5" />
                    <span class="text-[10px] text-ink-3">°</span>
                  </div>
                  <span class="text-[8px] text-ink-3">angle</span>
                </div>
                <!-- Aperçu dégradé + initiales -->
                <div
                  class="flex-1 h-12 rounded-lg border border-white/10 min-w-0 flex items-center justify-center text-[13px] font-bold text-white"
                  :style="{ background: form.avatarGradient || '#1a1a2a' }"
                >{{ form.initials || '??' }}</div>
              </div>
              <input v-model="form.avatarGradient" class="admin-input font-mono text-[11px]" placeholder="linear-gradient(135deg,#f47521,#c2540a)" @change="parseGradient" />
            </div>

          </div>

          <div v-if="formError" class="mt-3 text-[11px] text-red-400">{{ formError }}</div>
          <div class="flex gap-2 mt-5">
            <button @click="modal = null" class="btn-outline flex-1 text-[12px] py-2">Annuler</button>
            <button @click="submitForm" :disabled="saving" class="btn-primary flex-1 text-[12px] py-2">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { useDialog } from '@/composables/useDialog.js'

const { showAlert, showConfirm } = useDialog()

const members        = ref([])
const loading        = ref(true)
const modal          = ref(null)
const saving         = ref(false)
const formError      = ref('')
const departments    = ['Direction', 'Traduction', 'Édition', 'Communauté', 'Ancien Membre']

const form           = ref({})
const availableUsers = ref([])
const selectedUser   = ref(null)
const userSearch     = ref('')
const showUserList   = ref(false)

// ── Gradient ──────────────────────────────────────────────────────
const gradStops = ref(['#1a1a2a', '#2a1050', '#0a0816'])
const gradAngle = ref(135)

function setGradStop(i, val) { gradStops.value[i] = val; buildGradient() }
function buildGradient() { form.value.avatarGradient = `linear-gradient(${gradAngle.value}deg,${gradStops.value.join(',')})` }
function parseGradient() {
  const str = form.value.avatarGradient || ''
  const am = str.match(/(\d+)deg/)
  if (am) gradAngle.value = parseInt(am[1])
  const colors = [...str.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => `#${m[1]}`)
  if (colors[0]) gradStops.value[0] = colors[0]
  if (colors[1]) gradStops.value[1] = colors[1]
  if (colors[2]) gradStops.value[2] = colors[2]
}
function resetGradient() {
  gradStops.value = ['#1a1a2a', '#2a1050', '#0a0816']
  gradAngle.value = 135
  buildGradient()
}

onMounted(async () => {
  try { members.value = await http.get('/team') } catch {}
  loading.value = false
})

const filteredAvailableUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase()
  if (!q) return availableUsers.value
  return availableUsers.value.filter(u => u.username.toLowerCase().includes(q))
})

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function selectUser(u) {
  selectedUser.value      = u
  userSearch.value        = u.username
  showUserList.value      = false
  form.value.userId       = u._id
  form.value.name         = u.username
  form.value.slug         = toSlug(u.username)
  form.value.initials     = u.username.slice(0, 2).toUpperCase()
}

function clearUser() {
  selectedUser.value      = null
  userSearch.value        = ''
  form.value.userId       = null
  form.value.name         = ''
  form.value.slug         = ''
  form.value.initials     = ''
}

function onUserSearchBlur() {
  setTimeout(() => { showUserList.value = false }, 150)
}

async function openAdd() {
  form.value     = { userId: null, slug: '', name: '', role: '', department: '', initials: '', joined: '', avatarGradient: '', bio: '', tagsStr: '' }
  selectedUser.value = null
  userSearch.value   = ''
  showUserList.value = false
  formError.value    = ''
  resetGradient()
  try { availableUsers.value = await http.get('/team/available-users') } catch { availableUsers.value = [] }
  modal.value = { mode: 'add' }
}

function openEdit(m) {
  form.value      = { ...m, tagsStr: (m.tags ?? []).join(', ') }
  formError.value = ''
  parseGradient()
  modal.value     = { mode: 'edit', id: m._id }
}

async function toggleActive(m) {
  try {
    const updated = await http.put(`/team/${m._id}`, { active: !m.active })
    const idx = members.value.findIndex(x => x._id === m._id)
    if (idx !== -1) members.value[idx] = updated
  } catch (e) { showAlert(e.message) }
}

async function deleteMember(m) {
  if (!await showConfirm(`Retirer « ${m.name} » de l'équipe ?`)) return
  try {
    await http.delete(`/team/${m._id}`)
    members.value = members.value.filter(x => x._id !== m._id)
  } catch (e) { showAlert(e.message) }
}

async function submitForm() {
  formError.value = ''
  if (modal.value.mode === 'add' && !form.value.userId) {
    formError.value = 'Veuillez sélectionner un utilisateur.'
    return
  }
  if (!form.value.name || !form.value.department) {
    formError.value = 'Nom et département sont requis.'
    return
  }
  if (modal.value.mode === 'add' && !form.value.slug) {
    formError.value = 'Le slug est requis.'
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      tags: form.value.tagsStr.split(',').map(t => t.trim()).filter(Boolean),
    }
    delete payload.tagsStr
    if (modal.value.mode === 'add') {
      const created = await http.post('/team', payload)
      members.value.push(created)
    } else {
      const updated = await http.put(`/team/${modal.value.id}`, payload)
      const idx = members.value.findIndex(x => x._id === modal.value.id)
      if (idx !== -1) members.value[idx] = updated
    }
    modal.value = null
  } catch (e) { formError.value = e.message }
  saving.value = false
}
</script>

<style scoped>
.admin-input {
  @apply w-full bg-bg-2 border border-white/[0.1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors;
}
</style>
