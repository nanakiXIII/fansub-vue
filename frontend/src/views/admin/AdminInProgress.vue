<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Avancement des projets</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ items.length }} entrée(s) · glisser pour réordonner</p>
      </div>
      <button @click="openAdd" class="btn-primary text-[12px] py-2 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter
      </button>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="(item, i) in items"
        :key="item._id"
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

        <!-- Poster -->
        <img loading="lazy" v-if="serieMap[item.serieId]?.poster" :src="serieMap[item.serieId].poster" class="w-8 h-11 rounded object-cover shrink-0 bg-bg-2" />
        <div v-else class="w-8 h-11 rounded bg-bg-2 shrink-0"></div>

        <!-- Infos -->
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-bold text-white truncate">{{ serieMap[item.serieId]?.title ?? item.serieId }}</div>
          <div class="text-[10px] text-ink-3">Ép. {{ item.episode?.num }}</div>
          <!-- Steps bar -->
          <div class="flex items-center gap-0.5 mt-1.5">
            <div
              v-for="(step, si) in item.translation?.steps ?? []"
              :key="si"
              class="flex-1 h-1 rounded-full transition-colors"
              :class="step.done ? 'bg-green-500' : step.current ? 'bg-orange' : 'bg-white/10'"
            ></div>
          </div>
        </div>

        <!-- Current step -->
        <div class="shrink-0 text-center hidden sm:block">
          <div class="text-[9px] text-ink-3">Étape</div>
          <div class="text-[11px] font-bold text-white">{{ currentStep(item) }}</div>
        </div>

        <!-- PCT -->
        <div class="shrink-0 text-center w-10">
          <div class="text-[14px] font-extrabold text-orange">{{ item.translation?.pct ?? 0 }}<span class="text-[9px] text-ink-3">%</span></div>
        </div>

        <!-- Visible toggle -->
        <button
          @click="toggleVisible(item)"
          class="shrink-0 text-[9px] font-bold uppercase rounded-full px-2 py-0.5 border transition-colors"
          :class="item.visible ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-bg-2 text-ink-3 border-white/10'"
        >{{ item.visible ? 'Visible' : 'Masqué' }}</button>

        <button @click="openEdit(item)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="deleteItem(item)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!items.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun projet en cours.</div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div class="text-[15px] font-extrabold text-white mb-4">{{ modal.mode === 'add' ? 'Nouveau projet' : 'Modifier le projet' }}</div>

          <div class="flex flex-col gap-4">

            <!-- ── Série & Épisode ── -->
            <div class="flex flex-col gap-3">
              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest border-b border-white/[0.06] pb-1.5">Série & Épisode</div>

              <!-- Série picker -->
              <label class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Série *</span>
                <div class="relative">
                  <input v-model="serieSearch" @focus="serieDropdown = true" @blur="() => setTimeout(() => serieDropdown = false, 150)"
                    class="admin-input pr-8" placeholder="Rechercher une série…" autocomplete="off" />
                  <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <div v-if="serieDropdown && filteredSeries.length" class="bg-bg-2 border border-white/10 rounded-xl overflow-hidden max-h-40 overflow-y-auto mt-0.5">
                  <button v-for="s in filteredSeries" :key="s.id" type="button" @mousedown.prevent="selectSerie(s)"
                    class="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
                    :class="form.serieId === s.id ? 'bg-orange/10' : ''">
                    <img loading="lazy" v-if="s.poster" :src="s.poster" class="w-6 h-9 object-cover rounded shrink-0" />
                    <span class="text-[12px] text-ink-1 truncate">{{ s.title }}</span>
                  </button>
                </div>
              </label>

              <!-- Épisode -->
              <div class="grid grid-cols-2 gap-3">
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Numéro</span>
                  <input v-model.number="form.episode.num" type="number" class="admin-input" placeholder="12" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Durée</span>
                  <input v-model="form.episode.duration" class="admin-input" placeholder="24 min" />
                </label>
              </div>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Titre de l'épisode</span>
                <input v-model="form.episode.title" class="admin-input" placeholder="Titre optionnel…" />
              </label>
            </div>

            <!-- ── Avancement ── -->
            <div class="flex flex-col gap-3">
              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest border-b border-white/[0.06] pb-1.5">Avancement</div>

              <!-- Steps interactifs -->
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Étapes <span class="normal-case font-normal text-ink-3">(cliquer pour changer l'état)</span></span>
                <div class="bg-bg-2 border border-white/[0.06] rounded-xl overflow-hidden">
                  <div
                    v-for="(step, si) in form.translation.steps"
                    :key="si"
                    @click="cycleStep(si)"
                    class="flex items-center gap-3 px-3 py-2 border-b border-white/[0.05] last:border-0 cursor-pointer hover:bg-white/[0.04] transition-colors select-none"
                  >
                    <!-- Icône état -->
                    <div class="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px]"
                      :class="step.done ? 'bg-green-500 text-white' : step.current ? 'bg-orange text-white' : 'bg-white/10 text-ink-3'">
                      <svg v-if="step.done" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                      <svg v-else-if="step.current" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>
                    </div>
                    <span class="text-[12px] flex-1" :class="step.done ? 'text-green-400 line-through' : step.current ? 'text-orange font-bold' : 'text-ink-3'">{{ step.label }}</span>
                    <span class="text-[9px] text-ink-3">{{ step.done ? 'Terminé' : step.current ? 'En cours' : '—' }}</span>
                  </div>
                </div>
                <p class="text-[9px] text-ink-3">Non démarré → En cours → Terminé</p>
              </div>

              <!-- PCT + ETA -->
              <label class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Avancement (%)</span>
                  <span class="text-[10px] font-bold text-orange">{{ form.translation.pct }}%</span>
                </div>
                <input type="range" v-model.number="form.translation.pct" min="0" max="100" class="accent-orange w-full h-2 rounded cursor-pointer" />
              </label>
            </div>

            <!-- ── Staff ── -->
            <div class="flex flex-col gap-3">
              <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest border-b border-white/[0.06] pb-1.5">Staff assigné</div>
              <div class="grid grid-cols-2 gap-3">
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Traducteur</span>
                  <input v-model="form.staff.translator" class="admin-input" placeholder="Pseudo…" list="staff-list" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Correcteur</span>
                  <input v-model="form.staff.proofreader" class="admin-input" placeholder="Pseudo…" list="staff-list" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Timer</span>
                  <input v-model="form.staff.timer" class="admin-input" placeholder="Pseudo…" list="staff-list" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Encodeur</span>
                  <input v-model="form.staff.encoder" class="admin-input" placeholder="Pseudo…" list="staff-list" />
                </label>
              </div>
              <datalist id="staff-list">
                <option v-for="m in teamMembers" :key="m._id" :value="m.name" />
              </datalist>
            </div>

            <!-- Visibilité -->
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" v-model="form.visible" class="w-4 h-4 accent-orange" />
              <span class="text-[12px] text-ink-1">Visible sur le site</span>
            </label>
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

const DEFAULT_STEPS = ['Brut', 'Traduction', 'Correction', 'Timing', 'Encodage', 'Mise en ligne']

const items       = ref([])
const allSeries   = ref([])
const teamMembers = ref([])
const loading     = ref(true)
const modal       = ref(null)
const saving      = ref(false)
const formError   = ref('')
const form        = ref({})
const serieSearch = ref('')
const serieDropdown = ref(false)

// ── Drag & drop ────────────────────────────────────────────────────
const dragIndex = ref(null)

function onDragStart(i) { dragIndex.value = i }
function onDragOver(i) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const arr    = [...items.value]
  const moved  = arr.splice(dragIndex.value, 1)[0]
  arr.splice(i, 0, moved)
  items.value  = arr
  dragIndex.value = i
}
async function onDragEnd() {
  dragIndex.value = null
  await Promise.all(items.value.map((item, i) => http.put(`/inprogress/${item._id}`, { order: i })))
}

// ── Helpers ────────────────────────────────────────────────────────
const serieMap = computed(() => {
  const m = {}
  for (const s of allSeries.value) m[s.id] = s
  return m
})

function currentStep(item) {
  return item.translation?.steps?.find(s => s.current)?.label
    ?? (item.translation?.steps?.every(s => s.done) ? 'Terminé' : 'En attente')
}

const filteredSeries = computed(() => {
  const q = serieSearch.value.trim().toLowerCase()
  if (!q) return allSeries.value
  return allSeries.value.filter(s => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
})

function selectSerie(s) {
  form.value.serieId = s.id
  serieSearch.value  = s.title
  serieDropdown.value = false
}

// ── Steps ──────────────────────────────────────────────────────────
function cycleStep(i) {
  const steps = form.value.translation.steps
  const step  = steps[i]
  if (!step.done && !step.current) {
    // Passer en cours — désactiver l'ancien current
    steps.forEach(s => s.current = false)
    step.current = true
  } else if (step.current) {
    step.current = false
    step.done    = true
    // Mettre automatiquement le suivant en cours s'il existe
    const next = steps[i + 1]
    if (next && !next.done) { steps.forEach(s => s.current = false); next.current = true }
  } else {
    // done → reset
    step.done    = false
    step.current = false
  }
  // Recalculer pct
  const done = steps.filter(s => s.done).length
  form.value.translation.pct = Math.round((done / steps.length) * 100)
}

function makeDefaultSteps() {
  return DEFAULT_STEPS.map(label => ({ label, done: false, current: false }))
}

// ── CRUD ───────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [data, series, team] = await Promise.all([
      http.get('/inprogress'),
      http.get('/series'),
      http.get('/team'),
    ])
    items.value       = data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    allSeries.value   = series
    teamMembers.value = team
  } catch {}
  loading.value = false
})

function openAdd() {
  form.value = {
    serieId: '',
    visible: true,
    episode:     { num: null, title: '', duration: '' },
    translation: { pct: 0, steps: makeDefaultSteps() },
    staff:       { translator: null, proofreader: null, timer: null, encoder: null },
  }
  serieSearch.value = ''
  formError.value   = ''
  modal.value = { mode: 'add' }
}

function openEdit(item) {
  form.value = {
    ...item,
    episode:     { ...item.episode },
    translation: {
      ...item.translation,
      steps: item.translation?.steps?.length
        ? item.translation.steps.map(s => ({ ...s }))
        : makeDefaultSteps(),
    },
    staff: { ...item.staff },
  }
  serieSearch.value = serieMap.value[item.serieId]?.title ?? item.serieId
  formError.value   = ''
  modal.value = { mode: 'edit', id: item._id }
}

async function toggleVisible(item) {
  try {
    const updated = await http.put(`/inprogress/${item._id}`, { visible: !item.visible })
    const idx = items.value.findIndex(x => x._id === item._id)
    if (idx !== -1) items.value[idx] = updated
  } catch (e) { showAlert(e.message) }
}

async function deleteItem(item) {
  const title = serieMap.value[item.serieId]?.title ?? item.serieId
  if (!await showConfirm(`Supprimer l'entrée pour « ${title} » ?`)) return
  try {
    await http.delete(`/inprogress/${item._id}`)
    items.value = items.value.filter(x => x._id !== item._id)
  } catch (e) { showAlert(e.message) }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.serieId) { formError.value = 'Veuillez sélectionner une série.'; return }
  if (!form.value.episode?.num) { formError.value = 'Le numéro d\'épisode est requis.'; return }
  saving.value = true
  try {
    const payload = { ...form.value }
    // Nettoyer les champs staff vides
    for (const k of Object.keys(payload.staff)) {
      if (!payload.staff[k]) payload.staff[k] = null
    }
    if (modal.value.mode === 'add') {
      payload.order = items.value.length
      const created = await http.post('/inprogress', payload)
      items.value.push(created)
    } else {
      const updated = await http.put(`/inprogress/${modal.value.id}`, payload)
      const idx = items.value.findIndex(x => x._id === modal.value.id)
      if (idx !== -1) items.value[idx] = updated
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
