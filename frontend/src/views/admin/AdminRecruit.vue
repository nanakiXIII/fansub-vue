<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Recrutement</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ roles.length }} poste(s) · {{ openCount }} ouvert(s)</p>
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
        <!-- Drag handle -->
        <div class="shrink-0 cursor-grab active:cursor-grabbing text-ink-3/40 hover:text-ink-3 transition-colors px-0.5">
          <svg class="w-3.5 h-4" viewBox="0 0 14 16" fill="currentColor">
            <circle cx="4" cy="4"  r="1.4"/><circle cx="10" cy="4"  r="1.4"/>
            <circle cx="4" cy="8"  r="1.4"/><circle cx="10" cy="8"  r="1.4"/>
            <circle cx="4" cy="12" r="1.4"/><circle cx="10" cy="12" r="1.4"/>
          </svg>
        </div>

        <div class="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-lg" :style="{ background: r.color || '#1a1a2a' }">{{ r.icon }}</div>
        <div class="flex-1 min-w-0">
          <div class="text-[12px] font-bold text-white">{{ r.title }}</div>
          <div class="text-[10px] text-ink-3 flex gap-1 flex-wrap mt-0.5">
            <span v-for="t in r.tags" :key="t" class="bg-bg-2 px-1.5 py-px rounded">{{ t }}</span>
          </div>
        </div>
        <button
          @click="toggleOpen(r)"
          class="shrink-0 text-[9px] font-bold uppercase rounded-full px-2.5 py-1 border transition-colors"
          :class="r.open
            ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
            : 'bg-bg-2 text-ink-3 border-white/10 hover:border-white/20'"
        >{{ r.open ? 'Ouvert' : 'Fermé' }}</button>
        <button @click="openEdit(r)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="deleteRole(r)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!roles.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun poste.</div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
          <div class="text-[15px] font-extrabold text-white mb-4">{{ modal.mode === 'add' ? 'Nouveau poste' : 'Modifier le poste' }}</div>
          <div class="flex flex-col gap-3">

            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Titre *</span>
              <input v-model="form.title" @input="autoSlug" class="admin-input" placeholder="Traducteur JP → FR" />
            </label>

            <!-- Icône picker -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Icône</span>
              <div class="relative" ref="iconPickerRef">
                <button
                  type="button"
                  @click="iconPickerOpen = !iconPickerOpen"
                  class="admin-input flex items-center gap-2 cursor-pointer w-full text-left"
                >
                  <span class="text-[20px] leading-none">{{ form.icon || '🎯' }}</span>
                  <span class="text-ink-3 text-[11px] flex-1">Choisir une icône</span>
                  <svg class="w-3 h-3 text-ink-3 shrink-0 transition-transform" :class="iconPickerOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div v-if="iconPickerOpen" class="absolute z-50 top-full mt-1 left-0 right-0 bg-bg-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                  <div class="flex flex-col max-h-52 overflow-y-auto p-2 gap-2">
                    <div v-for="cat in iconCategories" :key="cat.label">
                      <div class="text-[9px] font-bold text-ink-3 uppercase tracking-widest px-1 mb-1">{{ cat.label }}</div>
                      <div class="flex flex-wrap gap-0.5">
                        <button
                          v-for="ico in cat.icons" :key="ico"
                          type="button"
                          @mousedown.prevent="selectIcon(ico)"
                          class="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg hover:bg-white/[0.08] transition-colors"
                          :class="form.icon === ico ? 'bg-orange/20 ring-1 ring-orange/50' : ''"
                        >{{ ico }}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gradient builder -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Couleur de fond</span>
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
                <div
                  class="flex-1 h-12 rounded-lg border border-white/10 min-w-0 flex items-center justify-center text-[22px]"
                  :style="{ background: form.color || '#1a1a2a' }"
                >{{ form.icon || '🎯' }}</div>
              </div>
              <input v-model="form.color" class="admin-input font-mono text-[11px]" placeholder="linear-gradient(135deg,#1a0d2e,#2a1050)" @change="parseGradient" />
            </div>

            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Description</span>
              <textarea v-model="form.description" class="admin-input resize-none h-20" placeholder="Description du poste…"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Tags <span class="normal-case font-normal">(séparés par des virgules)</span></span>
              <input v-model="form.tagsStr" class="admin-input" placeholder="Japonais N3+, Rédaction FR" />
            </label>
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" v-model="form.open" class="w-4 h-4 accent-orange" />
              <span class="text-[12px] text-ink-1">Poste ouvert au recrutement</span>
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

const roles     = ref([])
const loading   = ref(true)
const modal     = ref(null)
const saving    = ref(false)
const formError = ref('')
const form      = ref({})

const openCount = computed(() => roles.value.filter(r => r.open).length)

// ── Drag & drop ────────────────────────────────────────────────────
const dragIndex = ref(null)

function onDragStart(i) {
  dragIndex.value = i
}

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
  await Promise.all(
    roles.value.map((r, i) => http.put(`/recruit/${r._id}`, { order: i + 1 }))
  )
}

// ── Icon picker ────────────────────────────────────────────────────
const iconPickerOpen = ref(false)
const iconPickerRef  = ref(null)
const iconCategories = [
  { label: 'Recrutement', icons: ['🎯','📝','✏️','🖊️','📋','📌','🔍','🔎','💼','🎓'] },
  { label: 'Langues',     icons: ['🈳','🇯🇵','🇫🇷','🌐','📖','📚','🗣️','💬','🔤','🔡'] },
  { label: 'Tech',        icons: ['🖥️','💻','⌨️','🖱️','🛠️','⚙️','🔧','💾','🚀','⚡'] },
  { label: 'Médias',      icons: ['🎬','🎥','📺','🎞️','🎵','🎙️','🎤','🎧','🎨','✍️'] },
  { label: 'Divers',      icons: ['🔥','⭐','🌟','💎','👑','🏆','🥇','💡','🎁','❤️'] },
]
function selectIcon(ico) { form.value.icon = ico; iconPickerOpen.value = false }

// ── Gradient builder ───────────────────────────────────────────────
const gradStops = ref(['#1a0d2e', '#2a1050', '#0d0d1a'])
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
function resetGradient() { gradStops.value = ['#1a0d2e', '#2a1050', '#0d0d1a']; gradAngle.value = 135; buildGradient() }

// ── Slug auto ──────────────────────────────────────────────────────
function toSlug(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function autoSlug() {
  if (modal.value?.mode === 'add') form.value.slug = toSlug(form.value.title)
}

onMounted(async () => {
  try {
    const data = await http.get('/recruit')
    roles.value = data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  } catch {}
  loading.value = false
})

function openAdd() {
  form.value  = { slug: '', title: '', icon: '🎯', color: '', description: '', tagsStr: '', order: roles.value.length + 1, open: true }
  formError.value = ''
  resetGradient()
  modal.value = { mode: 'add' }
}

function openEdit(r) {
  form.value  = { ...r, tagsStr: (r.tags ?? []).join(', ') }
  formError.value = ''
  parseGradient()
  modal.value = { mode: 'edit', id: r._id }
}

async function toggleOpen(r) {
  try {
    const updated = await http.put(`/recruit/${r._id}`, { open: !r.open })
    const idx = roles.value.findIndex(x => x._id === r._id)
    if (idx !== -1) roles.value[idx] = updated
  } catch (e) { showAlert(e.message) }
}

async function deleteRole(r) {
  if (!await showConfirm(`Supprimer « ${r.title} » ?`)) return
  try {
    await http.delete(`/recruit/${r._id}`)
    roles.value = roles.value.filter(x => x._id !== r._id)
  } catch (e) { showAlert(e.message) }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.title) { formError.value = 'Le titre est requis.'; return }
  if (modal.value.mode === 'add' && !form.value.slug) form.value.slug = toSlug(form.value.title)
  saving.value = true
  try {
    const payload = { ...form.value, tags: form.value.tagsStr.split(',').map(t => t.trim()).filter(Boolean) }
    delete payload.tagsStr
    if (modal.value.mode === 'add') {
      payload.order = roles.value.length + 1
      const created = await http.post('/recruit', payload)
      roles.value.push(created)
    } else {
      const updated = await http.put(`/recruit/${modal.value.id}`, payload)
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
