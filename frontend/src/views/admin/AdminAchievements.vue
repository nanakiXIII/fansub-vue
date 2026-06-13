<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Succès</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ items.length }} succès configuré(s)</p>
      </div>
      <button @click="openAdd" class="btn-primary text-[12px] py-2 px-3 gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter
      </button>
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="item in items"
        :key="item._id"
        class="bg-bg-1 border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <!-- Icône -->
        <div class="text-[22px] shrink-0 w-9 text-center">{{ item.icon }}</div>

        <!-- Infos -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[13px] font-bold text-white">{{ item.name }}</span>
            <span v-if="item.rewardTitle" class="text-[9px] font-bold px-1.5 py-px rounded-full border"
              :style="{ background: item.color + '22', color: item.color, borderColor: item.color + '44' }">
              « {{ item.rewardTitle }} »
            </span>
            <span v-if="!item.isActive" class="text-[9px] font-bold bg-bg-2 text-ink-3 rounded px-1.5 py-px">Inactif</span>
          </div>
          <div class="text-[11px] text-ink-3 mt-0.5">{{ item.description }}</div>
          <div class="text-[10px] text-ink-3 mt-1">
            <span class="text-ink-2">{{ conditionLabel(item.condition.type) }}</span> ≥ <span class="text-white font-bold">{{ item.condition.threshold }}</span>
          </div>
        </div>

        <button @click="testToast(item)" title="Tester l'animation" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-orange hover:bg-orange/10 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/></svg>
        </button>
        <button @click="openEdit(item)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-white hover:bg-white/[0.08] transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="deleteItem(item)" class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!items.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun succès configuré.</div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="modal = null">
        <div class="bg-bg-1 border border-white/[0.1] rounded-2xl w-full max-w-md p-6">
          <div class="text-[15px] font-extrabold text-white mb-4">{{ modal.mode === 'add' ? 'Nouveau succès' : 'Modifier le succès' }}</div>

          <div class="flex flex-col gap-3">

            <!-- Icône + Nom -->
            <!-- Icône + Nom -->
            <div class="flex gap-2">
              <!-- Icon picker -->
              <div class="flex flex-col gap-1 w-28 shrink-0">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Icône</span>
                <div class="relative" ref="iconPickerRef">
                  <button
                    type="button"
                    @click="iconPickerOpen = !iconPickerOpen"
                    class="admin-input flex items-center gap-1.5 cursor-pointer w-full text-left"
                  >
                    <span class="text-[20px] leading-none">{{ form.icon || '🏆' }}</span>
                    <svg class="w-3 h-3 text-ink-3 shrink-0 ml-auto transition-transform" :class="iconPickerOpen ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div v-if="iconPickerOpen" class="absolute z-50 top-full mt-1 left-0 w-72 bg-bg-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div class="flex flex-col max-h-64 overflow-y-auto p-2 gap-2">
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
              <label class="flex flex-col gap-1 flex-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Nom *</span>
                <input v-model="form.name" class="admin-input" placeholder="Grand Téléchargeur" />
              </label>
            </div>

            <!-- Description -->
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Description</span>
              <input v-model="form.description" class="admin-input" placeholder="Télécharger 50 épisodes" />
            </label>

            <!-- Condition -->
            <div class="grid grid-cols-2 gap-2">
              <label class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Condition *</span>
                <select v-model="form.condition.type" class="admin-input">
                  <option v-for="c in conditionTypes" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Seuil *</span>
                <input v-model.number="form.condition.threshold" type="number" min="1" class="admin-input" placeholder="50" />
              </label>
            </div>

            <!-- Titre de récompense -->
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Titre récompense <span class="normal-case font-normal">(affiché à côté du pseudo)</span></span>
              <input v-model="form.rewardTitle" class="admin-input" placeholder="Téléchargeur (optionnel)" />
            </label>

            <!-- Couleur + preview -->
            <label class="flex flex-col gap-1">
              <span class="text-[10px] font-bold text-ink-3 uppercase tracking-wide">Couleur du badge</span>
              <div class="flex items-center gap-2">
                <input type="color" v-model="form.color" class="w-10 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <div class="flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                  :style="{ background: form.color + '22', color: form.color, borderColor: form.color + '44' }">
                  {{ form.icon || '🏆' }} {{ form.name || 'Aperçu' }}
                  <span v-if="form.rewardTitle" class="opacity-70 font-normal">· « {{ form.rewardTitle }} »</span>
                </div>
              </div>
            </label>

            <!-- Actif -->
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" v-model="form.isActive" class="w-4 h-4 accent-orange" />
              <span class="text-[12px] text-ink-1">Succès actif (visible et débloquable)</span>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { http } from '@/services/http.js'
import { useAchievementToast } from '@/composables/useAchievementToast.js'

const { show } = useAchievementToast()
function testToast(item) { show(item) }

const CONDITION_TYPES = [
  { value: 'downloads', label: 'Téléchargements' },
  { value: 'comments',  label: 'Commentaires postés' },
  { value: 'watched',   label: 'Épisodes regardés' },
  { value: 'favorites', label: 'Séries en liste' },
  { value: 'days',      label: 'Jours depuis inscription' },
]

const conditionTypes = CONDITION_TYPES
function conditionLabel(type) { return CONDITION_TYPES.find(c => c.value === type)?.label ?? type }

const items          = ref([])
const loading        = ref(true)
const modal          = ref(null)
const saving         = ref(false)
const formError      = ref('')
const form           = ref({})
const iconPickerOpen = ref(false)
const iconPickerRef  = ref(null)

const iconCategories = [
  {
    label: 'Trophées & Récompenses',
    icons: ['🏆','🥇','🥈','🥉','🎖️','🏅','👑','💎','⭐','🌟','✨','💫','🎯','🎪','🎊','🎉','🎁','🏵️','🌠','💝'],
  },
  {
    label: 'Anime & Médias',
    icons: ['📺','🎬','🎥','🎞️','🎧','🎵','🎶','🎤','🎙️','📻','📡','🖥️','💻','📱','🎮','🕹️','👾','🤖','🎭','🎨'],
  },
  {
    label: 'Puissance & Combat',
    icons: ['⚔️','🛡️','💪','🦁','🐉','🦅','🔥','⚡','💥','🥊','🗡️','🏹','🔱','⚜️','🧨','💣','🌪️','🌊','🌋','☄️'],
  },
  {
    label: 'Social & Communauté',
    icons: ['❤️','💬','👥','🤝','🌐','🗣️','📢','👍','🤩','🥳','🙌','🫂','💌','📣','🔔','🌍','🏘️','🫶','💞','🤗'],
  },
  {
    label: 'Progression & Temps',
    icons: ['🚀','📈','⏱️','🗓️','📅','🔑','🗝️','💡','🔮','🌈','🌱','🌿','🌳','🏔️','🧭','🔭','🧪','📊','🎓','🧠'],
  },
  {
    label: 'Téléchargements & Visionnage',
    icons: ['⬇️','👁️','▶️','⏭️','🔁','📥','📦','💾','📂','🗂️','🎴','📜','📋','📌','🔖','🗃️','📚','📖','🔍','📝'],
  },
]

function selectIcon(ico) { form.value.icon = ico; iconPickerOpen.value = false }
function onOutsideClick(e) {
  if (iconPickerRef.value && !iconPickerRef.value.contains(e.target)) iconPickerOpen.value = false
}

onBeforeUnmount(() => document.removeEventListener('click', onOutsideClick))

onMounted(async () => {
  try { items.value = await http.get('/achievements/all') } catch {}
  loading.value = false
  document.addEventListener('click', onOutsideClick)
})

function defaultForm() {
  return {
    name: '', description: '', icon: '🏆',
    condition: { type: 'downloads', threshold: 1 },
    rewardTitle: '', color: '#f97316', isActive: true,
  }
}

function openAdd() {
  form.value       = defaultForm()
  formError.value  = ''
  iconPickerOpen.value = false
  modal.value = { mode: 'add' }
}

function openEdit(item) {
  form.value       = { ...item, condition: { ...item.condition } }
  formError.value  = ''
  iconPickerOpen.value = false
  modal.value = { mode: 'edit', id: item._id }
}

async function deleteItem(item) {
  if (!confirm(`Supprimer « ${item.name} » ? Les utilisateurs qui ont ce succès le perdront.`)) return
  try {
    await http.delete(`/achievements/${item._id}`)
    items.value = items.value.filter(x => x._id !== item._id)
  } catch (e) { alert(e.message) }
}

async function submitForm() {
  formError.value = ''
  if (!form.value.name) { formError.value = 'Le nom est requis.'; return }
  if (!form.value.condition?.threshold || form.value.condition.threshold < 1) { formError.value = 'Le seuil doit être ≥ 1.'; return }
  saving.value = true
  try {
    if (modal.value.mode === 'add') {
      const created = await http.post('/achievements', form.value)
      items.value.push(created)
    } else {
      const updated = await http.put(`/achievements/${modal.value.id}`, form.value)
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
