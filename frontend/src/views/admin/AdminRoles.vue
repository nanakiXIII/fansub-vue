<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Grades</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ roles.length }} grade(s) · glisser pour réordonner</p>
      </div>
      <button @click="openAdd" class="btn-primary text-[12px] py-2 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter
      </button>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="(r, i) in roles"
        :key="r._id"
        draggable="true"
        @dragstart="onDragStart(i)"
        @dragover.prevent="onDragOver(i)"
        @dragend="onDragEnd"
        class="bg-bg-1 border border-white/[0.06] rounded-xl px-3 py-3 flex items-center gap-3 transition-opacity"
        :class="dragIndex === i ? 'opacity-40' : 'opacity-100'"
      >
        <!-- Handle -->
        <div class="shrink-0 cursor-grab active:cursor-grabbing text-ink-3/40 hover:text-ink-3 transition-colors px-0.5">
          <svg class="w-3.5 h-4" viewBox="0 0 14 16" fill="currentColor">
            <circle cx="4" cy="4"  r="1.4"/><circle cx="10" cy="4"  r="1.4"/>
            <circle cx="4" cy="8"  r="1.4"/><circle cx="10" cy="8"  r="1.4"/>
            <circle cx="4" cy="12" r="1.4"/><circle cx="10" cy="12" r="1.4"/>
          </svg>
        </div>
        <!-- Badge aperçu -->
        <div
          class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold text-white"
          :style="{ background: r.color || 'linear-gradient(135deg,#1a0d2e,#2a1050)' }"
        >{{ r.label }}</div>
        <div class="flex-1 min-w-0">
          <div class="text-[10px] text-ink-3 truncate">{{ r.description || '—' }}</div>
        </div>
        <span class="text-[9px] text-ink-3 font-mono shrink-0">lvl {{ i }}</span>
        <button @click="openEdit(r)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="deleteRole(r)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!roles.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun grade créé.</div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
          <div class="text-[15px] font-extrabold text-white mb-4">{{ modal.mode === 'add' ? 'Nouveau grade' : 'Modifier le grade' }}</div>
          <div class="flex flex-col gap-3">

            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Nom du grade *</span>
              <input v-model="form.label" @input="autoName" class="admin-input" placeholder="Fondateur, Staff, Helper…" />
            </label>

            <!-- Gradient builder -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Couleur du badge</span>
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
                <!-- Aperçu badge -->
                <div class="flex-1 flex items-center justify-center min-w-0">
                  <div
                    class="px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                    :style="{ background: form.color || '#1a1a2a' }"
                  >{{ form.label || 'Aperçu' }}</div>
                </div>
              </div>
              <input v-model="form.color" class="admin-input font-mono text-[11px]" placeholder="linear-gradient(135deg,#1a0d2e,#2a1050)" @change="parseGradient" />
            </div>

            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Description</span>
              <input v-model="form.description" class="admin-input" placeholder="Membres fondateurs du groupe…" />
            </label>

            <!-- Permissions -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Permissions</span>
                <div class="flex gap-2">
                  <button type="button" @click="toggleAll(true)" class="text-[9px] text-orange hover:underline">Tout cocher</button>
                  <span class="text-ink-3 text-[9px]">·</span>
                  <button type="button" @click="toggleAll(false)" class="text-[9px] text-ink-3 hover:text-white">Tout décocher</button>
                </div>
              </div>
              <div class="bg-bg-2 border border-white/[0.06] rounded-xl overflow-hidden">
                <div v-for="group in permissionGroups" :key="group.label" class="border-b border-white/[0.05] last:border-0 px-3 py-2.5">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold text-ink-2">{{ group.label }}</span>
                    <button type="button" @click="toggleGroup(group, true)" class="text-[9px] text-ink-3 hover:text-orange transition-colors">tout</button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <label v-for="p in group.perms" :key="p.key" class="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        :value="p.key"
                        v-model="form.permissions"
                        class="w-3.5 h-3.5 accent-orange rounded"
                      />
                      <span class="text-[11px] text-ink-1">{{ p.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
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
import { ref, onMounted } from 'vue'
import { http } from '@/services/http.js'

const roles     = ref([])
const loading   = ref(true)
const modal     = ref(null)
const saving    = ref(false)
const formError = ref('')
const form      = ref({})

// ── Drag & drop ────────────────────────────────────────────────────
const dragIndex = ref(null)

function onDragStart(i) { dragIndex.value = i }

function onDragOver(i) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const items   = [...roles.value]
  const dragged = items.splice(dragIndex.value, 1)[0]
  items.splice(i, 0, dragged)
  roles.value   = items
  dragIndex.value = i
}

async function onDragEnd() {
  dragIndex.value = null
  await Promise.all(roles.value.map((r, i) => http.put(`/roles/${r._id}`, { level: i })))
}

// ── Gradient builder ───────────────────────────────────────────────
const gradStops = ref(['#5b21b6', '#7c3aed', '#1e1b4b'])
const gradAngle = ref(135)

function setGradStop(i, val) { gradStops.value[i] = val; buildGradient() }
function buildGradient() { form.value.color = `linear-gradient(${gradAngle.value}deg,${gradStops.value.join(',')})` }
function parseGradient() {
  const str = form.value.color || ''
  const am  = str.match(/(\d+)deg/)
  if (am) gradAngle.value = parseInt(am[1])
  const colors = [...str.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map(m => {
    const h = m[1]; return h.length === 3 ? '#' + h.split('').map(c => c + c).join('') : '#' + h
  })
  if (colors[0]) gradStops.value[0] = colors[0]
  if (colors[1]) gradStops.value[1] = colors[1]
  if (colors[2]) gradStops.value[2] = colors[2]
}
function resetGradient() { gradStops.value = ['#5b21b6', '#7c3aed', '#1e1b4b']; gradAngle.value = 135; buildGradient() }

// ── Permissions ────────────────────────────────────────────────────
const permissionGroups = [
  {
    label: 'Contenu',
    perms: [
      { key: 'content.preview', label: 'Voir les brouillons / non publiés' },
    ],
  },
  {
    label: 'Actualités',
    perms: [
      { key: 'news.create',  label: 'Créer' },
      { key: 'news.edit',    label: 'Modifier' },
      { key: 'news.delete',  label: 'Supprimer' },
      { key: 'news.publish', label: 'Publier' },
    ],
  },
  {
    label: 'Séries',
    perms: [
      { key: 'series.create', label: 'Créer' },
      { key: 'series.edit',   label: 'Modifier' },
      { key: 'series.delete', label: 'Supprimer' },
    ],
  },
  {
    label: 'Commentaires',
    perms: [{ key: 'comments.moderate', label: 'Modérer' }],
  },
  {
    label: 'Équipe',
    perms: [{ key: 'team.manage', label: 'Gérer' }],
  },
  {
    label: 'Recrutement',
    perms: [{ key: 'recruit.manage', label: 'Gérer' }],
  },
  {
    label: 'Avancement',
    perms: [{ key: 'inprogress.manage', label: 'Gérer' }],
  },
  {
    label: 'Statistiques',
    perms: [{ key: 'stats.view', label: 'Consulter' }],
  },
  {
    label: 'Utilisateurs',
    perms: [{ key: 'users.view', label: 'Voir la liste' }],
  },
  {
    label: 'Succès',
    perms: [{ key: 'achievements.manage', label: 'Gérer' }],
  },
  {
    label: 'Analytics',
    perms: [{ key: 'analytics.view', label: 'Consulter' }],
  },
  {
    label: 'Bêta / Bugs',
    perms: [{ key: 'beta.manage', label: 'Gérer' }],
  },
  {
    label: 'Alertes',
    perms: [{ key: 'alerts.manage', label: 'Gérer' }],
  },
  {
    label: 'Audit',
    perms: [{ key: 'audit.view', label: "Voir les logs d'audit" }],
  },
]

const ALL_PERMS = permissionGroups.flatMap(g => g.perms.map(p => p.key))

function toggleAll(val) {
  form.value.permissions = val ? [...ALL_PERMS] : []
}
function toggleGroup(group, val) {
  const keys = group.perms.map(p => p.key)
  const current = new Set(form.value.permissions)
  if (val) keys.forEach(k => current.add(k))
  else     keys.forEach(k => current.delete(k))
  form.value.permissions = [...current]
}

// ── Name auto ──────────────────────────────────────────────────────
function toName(str) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function autoName() {
  if (modal.value?.mode === 'add') form.value.name = toName(form.value.label)
}

onMounted(async () => {
  try { roles.value = await http.get('/roles') } catch {}
  loading.value = false
})

function openAdd() {
  form.value  = { name: '', label: '', color: '', description: '', permissions: [] }
  formError.value = ''
  resetGradient()
  modal.value = { mode: 'add' }
}

function openEdit(r) {
  form.value  = { ...r }
  formError.value = ''
  parseGradient()
  modal.value = { mode: 'edit', id: r._id }
}

async function deleteRole(r) {
  if (!confirm(`Supprimer le grade « ${r.label} » ? Il sera retiré de tous les utilisateurs.`)) return
  try {
    await http.delete(`/roles/${r._id}`)
    roles.value = roles.value.filter(x => x._id !== r._id)
  } catch (e) { alert(e.message) }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.label) { formError.value = 'Le nom du grade est requis.'; return }
  if (modal.value.mode === 'add' && !form.value.name) form.value.name = toName(form.value.label)
  saving.value = true
  try {
    if (modal.value.mode === 'add') {
      form.value.level = roles.value.length
      const created = await http.post('/roles', form.value)
      roles.value.push(created)
    } else {
      const updated = await http.put(`/roles/${modal.value.id}`, form.value)
      const idx = roles.value.findIndex(x => x._id === modal.value.id)
      if (idx !== -1) roles.value[idx] = updated
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
