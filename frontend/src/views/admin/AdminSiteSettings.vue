<template>
  <div class="flex flex-col gap-5">

    <!-- Header -->
    <div>
      <h1 class="text-[18px] font-extrabold text-white">Paramètres du site</h1>
      <p class="text-[11px] text-ink-3 mt-0.5">Informations générales affichées sur le site public.</p>
    </div>

    <!-- Apparence par défaut -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Palette par défaut -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Palettes de couleurs</div>
        <div class="p-3.5">
          <p class="text-[10px] text-ink-3 mb-3 leading-relaxed">Coche celles proposées aux membres · l'étoile fixe la palette par défaut du site.</p>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="t in allThemes" :key="t.id"
              class="relative rounded-lg border-2 p-2 text-left transition-colors"
              :class="[
                form.defaultTheme === t.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2',
                !form.enabledThemes.includes(t.id) ? 'opacity-40' : ''
              ]">
              <button v-if="t.custom" type="button" class="absolute top-1.5 left-1.5 w-4 h-4 rounded flex items-center justify-center border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors z-10"
                title="Supprimer ce thème personnalisé"
                @click.stop="deleteTheme(t.id)">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <button type="button" class="absolute top-1.5 right-1.5 w-4 h-4 rounded flex items-center justify-center border transition-colors"
                :class="form.enabledThemes.includes(t.id) ? 'bg-orange border-orange' : 'border-white/25 bg-bg-3'"
                :disabled="form.defaultTheme === t.id"
                :title="form.defaultTheme === t.id ? 'Palette par défaut — ne peut pas être désactivée' : (form.enabledThemes.includes(t.id) ? 'Désactiver pour les membres' : 'Activer pour les membres')"
                @click.stop="toggleThemeEnabled(t.id)">
                <svg v-if="form.enabledThemes.includes(t.id)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button type="button" class="w-full text-left cursor-pointer" :disabled="!form.enabledThemes.includes(t.id)" @click="form.enabledThemes.includes(t.id) && (form.defaultTheme = t.id)">
                <div class="flex gap-0.5 mb-1.5">
                  <span v-for="(c, i) in t.swatch" :key="i" class="w-3 h-3 rounded-full block border border-white/10" :style="{ background: c }"></span>
                </div>
                <div class="flex items-center gap-1 text-[11px] font-semibold text-ink-1 pr-4">
                  {{ t.label }}
                  <svg v-if="form.defaultTheme === t.id" class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6z"/></svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Création d'un thème personnalisé -->
          <div class="mt-4 pt-3.5 border-t border-white/10">
            <div class="text-[11px] font-bold text-ink-1 mb-2.5">Créer un thème personnalisé</div>
            <div class="flex flex-wrap items-end gap-3">
              <div>
                <span class="field-label block mb-1">Nom</span>
                <input v-model="newThemeLabel" type="text" maxlength="30" placeholder="Ex : Océan"
                  class="field-input w-40" />
              </div>
              <div>
                <span class="field-label block mb-1">Fond</span>
                <input v-model="newThemeBase" type="color" class="h-9 w-11 rounded border border-white/15 bg-bg-2 cursor-pointer" />
              </div>
              <div>
                <span class="field-label block mb-1">Accent</span>
                <input v-model="newThemeAccent" type="color" class="h-9 w-11 rounded border border-white/15 bg-bg-2 cursor-pointer" />
              </div>
              <div>
                <span class="field-label block mb-1">Texte</span>
                <input v-model="newThemeInk" type="color" class="h-9 w-11 rounded border border-white/15 bg-bg-2 cursor-pointer" />
              </div>
              <div class="flex gap-0.5 pb-2">
                <span v-for="(c, i) in previewSwatch" :key="i" class="w-5 h-5 rounded-full block border border-white/10" :style="{ background: c }"></span>
              </div>
              <button type="button" class="btn-primary text-[11px] py-2 px-3.5 disabled:opacity-50"
                :disabled="!newThemeLabel.trim() || creatingTheme"
                @click="createTheme">
                {{ creatingTheme ? 'Création…' : '+ Ajouter' }}
              </button>
            </div>
            <label class="flex items-center gap-2 mt-3 cursor-pointer select-none w-fit">
              <button type="button"
                class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200"
                :class="livePreview ? 'bg-orange-500' : 'bg-bg-3'"
                @click="livePreview = !livePreview">
                <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                  :class="livePreview ? 'translate-x-4' : 'translate-x-1'"></span>
              </button>
              <span class="text-[11px] text-ink-2">
                Aperçu en direct sur le site
                <span v-if="livePreview" class="text-orange">— actif, visible uniquement par toi</span>
              </span>
            </label>
            <p v-if="createThemeError" class="text-[11px] text-red-400 mt-2">{{ createThemeError }}</p>
          </div>
        </div>
      </div>

      <!-- Mise en page par défaut -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Mises en page</div>
        <div class="p-3.5">
          <p class="text-[10px] text-ink-3 mb-3 leading-relaxed">Coche celles proposées aux membres · l'étoile fixe la mise en page par défaut du site.</p>
          <div class="flex gap-2">
            <div v-for="l in layouts" :key="l.id"
              class="relative flex-1 rounded-lg border-2 p-2 text-center transition-all"
              :class="[
                form.defaultLayout === l.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2',
                !form.enabledLayouts.includes(l.id) ? 'opacity-40' : ''
              ]">
              <button type="button" class="absolute top-1.5 right-1.5 w-4 h-4 rounded flex items-center justify-center border transition-colors"
                :class="form.enabledLayouts.includes(l.id) ? 'bg-orange border-orange' : 'border-white/25 bg-bg-3'"
                :disabled="form.defaultLayout === l.id"
                :title="form.defaultLayout === l.id ? 'Mise en page par défaut — ne peut pas être désactivée' : (form.enabledLayouts.includes(l.id) ? 'Désactiver pour les membres' : 'Activer pour les membres')"
                @click.stop="toggleLayoutEnabled(l.id)">
                <svg v-if="form.enabledLayouts.includes(l.id)" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <button type="button" class="w-full cursor-pointer" :disabled="!form.enabledLayouts.includes(l.id)" @click="form.enabledLayouts.includes(l.id) && (form.defaultLayout = l.id)">
                <div class="text-[16px] mb-1 leading-none">{{ l.icon }}</div>
                <div class="text-[10px] font-semibold text-ink-1 flex items-center justify-center gap-1">
                  {{ l.label }}
                  <svg v-if="form.defaultLayout === l.id" class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6z"/></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Effet saisonnier -->
    <div class="sidebar-card">
      <div class="sidebar-card-header">Effet saisonnier</div>
      <div class="p-3.5">
        <p class="text-[10px] text-ink-3 mb-3 leading-relaxed max-w-md">Superpose une animation décorative sur tout le site (neige, pétales de sakura...) pour marquer une saison ou un événement. Visible par tous les visiteurs.</p>
        <div class="grid grid-cols-3 gap-2 max-w-lg">
          <button v-for="opt in seasonalOptions" :key="opt.id" type="button"
            class="rounded-lg border-2 p-2.5 text-center transition-colors cursor-pointer"
            :class="form.seasonalEffect === opt.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2 hover:border-white/25'"
            @click="form.seasonalEffect = opt.id">
            <div class="text-[20px] mb-1 leading-none">{{ opt.icon }}</div>
            <div class="flex items-center justify-center gap-1 text-[11px] font-semibold text-ink-1">
              {{ opt.label }}
              <svg v-if="form.seasonalEffect === opt.id" class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Identité -->
      <div class="sidebar-card p-5 flex flex-col gap-4">
        <div>
          <span class="field-label block mb-1.5">Année de création du fansub</span>
          <input
            v-model.number="form.foundedYear"
            type="number"
            min="2000"
            :max="new Date().getFullYear()"
            class="field-input max-w-[140px]"
          />
          <p class="text-[10px] text-ink-3 mt-1.5">Affichée dans la stat « Création du fansub » sur la page Équipe.</p>
        </div>
      </div>

      <!-- Inscriptions -->
      <div class="sidebar-card p-5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[14px] font-bold text-white mb-1">Inscriptions ouvertes</div>
            <div class="text-[11px] text-ink-3 max-w-sm">
              Quand désactivé, les nouveaux comptes (e-mail et OAuth) ne peuvent plus être créés. Les comptes existants peuvent toujours se connecter.
            </div>
          </div>
          <button
            @click="form.registrationEnabled = !form.registrationEnabled"
            class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
            :class="form.registrationEnabled ? 'bg-orange-500' : 'bg-bg-3'"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
              :class="form.registrationEnabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
        <div v-if="!form.registrationEnabled" class="mt-3 flex items-center gap-2 text-[11px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          Inscriptions fermées — la page /inscription affiche un message aux visiteurs
        </div>
      </div>

      <!-- Chat -->
      <div class="sidebar-card p-5">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[14px] font-bold text-white mb-1">Chat activé</div>
            <div class="text-[11px] text-ink-3 max-w-sm">
              Quand désactivé, le widget de chat et la page /chat sont masqués et l'envoi de messages est bloqué côté serveur.
            </div>
          </div>
          <button
            @click="form.chatEnabled = !form.chatEnabled"
            class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
            :class="form.chatEnabled ? 'bg-orange-500' : 'bg-bg-3'"
          >
            <span
              class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
              :class="form.chatEnabled ? 'translate-x-6' : 'translate-x-1'"
            ></span>
          </button>
        </div>
        <div v-if="!form.chatEnabled" class="mt-3 flex items-center gap-2 text-[11px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
          <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
          Chat désactivé sur tout le site
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onBeforeUnmount } from 'vue'
import { useBeta } from '@/composables/useBeta.js'
import { allThemes, layouts, refreshCustomThemes, previewThemeColors, stopThemePreview } from '@/composables/useTheme.js'
import { deriveTheme, slugify } from '@/utils/themeColor.js'
import { http } from '@/services/http.js'
import { useToast } from '@/composables/useToast.js'

const toast = useToast()

const {
  foundedYear, registrationEnabled, chatEnabled, defaultTheme, defaultLayout, enabledThemes, enabledLayouts, seasonalEffect,
  setFoundedYear, setRegistrationEnabled, setChatEnabled, setDefaultTheme, setDefaultLayout,
  setEnabledThemes, setEnabledLayouts, setSeasonalEffect,
} = useBeta()

const seasonalOptions = [
  { id: 'none',   label: 'Aucun',  icon: '·' },
  { id: 'snow',   label: 'Neige',  icon: '❄️' },
  { id: 'sakura', label: 'Sakura', icon: '🌸' },
]

const form = reactive({
  foundedYear:         foundedYear.value,
  registrationEnabled: registrationEnabled.value,
  chatEnabled:         chatEnabled.value,
  defaultTheme:        defaultTheme.value,
  defaultLayout:       defaultLayout.value,
  enabledThemes:       [...enabledThemes.value],
  enabledLayouts:      [...enabledLayouts.value],
  seasonalEffect:      seasonalEffect.value,
})

// Resynchronise le formulaire si les settings arrivent après le montage (premier fetch async)
watch([foundedYear, registrationEnabled, chatEnabled, defaultTheme, defaultLayout, enabledThemes, enabledLayouts, seasonalEffect],
  ([fy, re, ce, dt, dl, et, el, se]) => {
    form.foundedYear         = fy
    form.registrationEnabled = re
    form.chatEnabled         = ce
    form.defaultTheme        = dt
    form.defaultLayout       = dl
    form.enabledThemes       = [...et]
    form.enabledLayouts      = [...el]
    form.seasonalEffect      = se
  })

function toggleThemeEnabled(id) {
  if (id === form.defaultTheme) return // la palette par défaut reste toujours activée
  const i = form.enabledThemes.indexOf(id)
  i === -1 ? form.enabledThemes.push(id) : form.enabledThemes.splice(i, 1)
}

function toggleLayoutEnabled(id) {
  if (id === form.defaultLayout) return // la mise en page par défaut reste toujours activée
  const i = form.enabledLayouts.indexOf(id)
  i === -1 ? form.enabledLayouts.push(id) : form.enabledLayouts.splice(i, 1)
}

// ── Thèmes personnalisés ─────────────────────────────────────────────────
const newThemeLabel   = ref('')
const newThemeBase    = ref('#161019')
const newThemeAccent  = ref('#f47521')
const newThemeInk     = ref('#e8e8f0')
const creatingTheme   = ref(false)
const createThemeError = ref('')

const previewColors = computed(() => deriveTheme(newThemeBase.value, newThemeAccent.value, newThemeInk.value))
const previewSwatch  = computed(() => [
  `rgb(${previewColors.value.bg0})`,
  `rgb(${previewColors.value.orange})`,
  `rgb(${previewColors.value.ink1})`,
])

// Aperçu en direct : applique les couleurs candidates à toute la page (visible uniquement
// dans cet onglet), et re-suit automatiquement chaque changement de couleur pendant l'édition.
const livePreview = ref(false)
watch(livePreview, (on) => { on ? previewThemeColors(previewColors.value) : stopThemePreview() })
watch(previewColors, (colors) => { if (livePreview.value) previewThemeColors(colors) })
onBeforeUnmount(() => { if (livePreview.value) stopThemePreview() })

async function createTheme() {
  const label = newThemeLabel.value.trim()
  if (!label) return
  creatingTheme.value = true
  createThemeError.value = ''
  try {
    const slug = slugify(label)
    await http.post('/themes', { slug, label, colors: previewColors.value })
    await refreshCustomThemes()
    // Active immédiatement le nouveau thème pour les membres (persisté côté serveur,
    // pas seulement dans le formulaire local — sinon il faudrait encore cliquer "Enregistrer").
    if (!enabledThemes.value.includes(slug)) await setEnabledThemes([...enabledThemes.value, slug])
    newThemeLabel.value = ''
    livePreview.value = false
  } catch (err) {
    createThemeError.value = err.message || 'Erreur lors de la création du thème'
  } finally {
    creatingTheme.value = false
  }
}

async function deleteTheme(slug) {
  if (!confirm('Supprimer ce thème personnalisé ? Les membres qui l\'utilisent reviendront à la palette par défaut du site.')) return
  try {
    await http.delete(`/themes/${slug}`)
    await refreshCustomThemes()
    const i = form.enabledThemes.indexOf(slug)
    if (i !== -1) form.enabledThemes.splice(i, 1)
    if (form.defaultTheme === slug) form.defaultTheme = 'braise'
  } catch (err) {
    createThemeError.value = err.message || 'Erreur lors de la suppression'
  }
}

const dirty = computed(() =>
  form.foundedYear !== foundedYear.value
  || form.registrationEnabled !== registrationEnabled.value
  || form.chatEnabled !== chatEnabled.value
  || form.defaultTheme !== defaultTheme.value
  || form.defaultLayout !== defaultLayout.value
  || JSON.stringify([...form.enabledThemes].sort())  !== JSON.stringify([...enabledThemes.value].sort())
  || JSON.stringify([...form.enabledLayouts].sort()) !== JSON.stringify([...enabledLayouts.value].sort())
  || form.seasonalEffect !== seasonalEffect.value
)

const saving = ref(false)
let saveTimer = null

// Sauvegarde automatique : toute modification du formulaire déclenche un enregistrement
// après une courte pause (pour regrouper des changements rapprochés, ex. cocher plusieurs
// cases de suite), avec une notification de confirmation — plus besoin de bouton "Enregistrer".
function scheduleSave(delay = 600) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(save, delay)
}

watch(form, () => { if (dirty.value) scheduleSave() }, { deep: true })

onBeforeUnmount(() => clearTimeout(saveTimer))

async function save() {
  if (saving.value || !dirty.value) return
  saving.value = true
  try {
    if (form.foundedYear !== foundedYear.value) await setFoundedYear(form.foundedYear)
    if (form.registrationEnabled !== registrationEnabled.value) await setRegistrationEnabled(form.registrationEnabled)
    if (form.chatEnabled !== chatEnabled.value) await setChatEnabled(form.chatEnabled)
    if (form.defaultTheme !== defaultTheme.value) await setDefaultTheme(form.defaultTheme)
    if (form.defaultLayout !== defaultLayout.value) await setDefaultLayout(form.defaultLayout)
    if (JSON.stringify([...form.enabledThemes].sort())  !== JSON.stringify([...enabledThemes.value].sort()))  await setEnabledThemes(form.enabledThemes)
    if (JSON.stringify([...form.enabledLayouts].sort()) !== JSON.stringify([...enabledLayouts.value].sort())) await setEnabledLayouts(form.enabledLayouts)
    if (form.seasonalEffect !== seasonalEffect.value) await setSeasonalEffect(form.seasonalEffect)
    toast.success('Modifications enregistrées')
  } catch (err) {
    toast.error(err.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
    if (dirty.value) scheduleSave()
  }
}
</script>

<style scoped>
.field-label { @apply text-[10px] font-bold text-ink-3 uppercase tracking-widest; }
.field-input { @apply w-full bg-bg-2 border border-white/[0.1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors; }
</style>
