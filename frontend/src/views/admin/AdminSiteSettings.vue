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
        <div class="sidebar-card-header">Palette par défaut</div>
        <div class="p-3.5">
          <div class="grid grid-cols-3 gap-2">
            <button v-for="t in themes" :key="t.id" type="button"
              class="rounded-lg border-2 p-2 text-left transition-colors cursor-pointer"
              :class="form.defaultTheme === t.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2 hover:border-white/25'"
              @click="form.defaultTheme = t.id">
              <div class="flex gap-0.5 mb-1.5">
                <span v-for="c in t.swatch" :key="c" class="w-3 h-3 rounded-full block border border-white/10" :style="{ background: c }"></span>
              </div>
              <div class="flex items-center gap-1 text-[11px] font-semibold text-ink-1">
                {{ t.label }}
                <svg v-if="form.defaultTheme === t.id" class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Mise en page par défaut -->
      <div class="sidebar-card">
        <div class="sidebar-card-header">Mise en page par défaut</div>
        <div class="p-3.5">
          <div class="flex gap-2">
            <button v-for="l in layouts" :key="l.id" type="button"
              class="flex-1 rounded-lg border-2 p-2 text-center transition-all cursor-pointer"
              :class="form.defaultLayout === l.id ? 'border-orange bg-orange/10' : 'border-white/10 bg-bg-2 hover:border-white/25'"
              @click="form.defaultLayout = l.id">
              <div class="text-[16px] mb-1 leading-none">{{ l.icon }}</div>
              <div class="text-[10px] font-semibold text-ink-1 flex items-center justify-center gap-1">
                {{ l.label }}
                <svg v-if="form.defaultLayout === l.id" class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          </div>
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

    <!-- Save -->
    <div class="flex items-center gap-3">
      <button @click="save" :disabled="saving || !dirty" class="btn-primary text-[12px] py-2 px-4 disabled:opacity-50">
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
      </button>
      <span v-if="saved" class="text-[11px] text-emerald-400">Enregistré ✓</span>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useBeta } from '@/composables/useBeta.js'
import { themes, layouts } from '@/composables/useTheme.js'

const {
  foundedYear, registrationEnabled, chatEnabled, defaultTheme, defaultLayout,
  setFoundedYear, setRegistrationEnabled, setChatEnabled, setDefaultTheme, setDefaultLayout,
} = useBeta()

const form = reactive({
  foundedYear:         foundedYear.value,
  registrationEnabled: registrationEnabled.value,
  chatEnabled:         chatEnabled.value,
  defaultTheme:        defaultTheme.value,
  defaultLayout:       defaultLayout.value,
})

// Resynchronise le formulaire si les settings arrivent après le montage (premier fetch async)
watch([foundedYear, registrationEnabled, chatEnabled, defaultTheme, defaultLayout], ([fy, re, ce, dt, dl]) => {
  form.foundedYear         = fy
  form.registrationEnabled = re
  form.chatEnabled         = ce
  form.defaultTheme        = dt
  form.defaultLayout       = dl
})

const dirty = computed(() =>
  form.foundedYear !== foundedYear.value
  || form.registrationEnabled !== registrationEnabled.value
  || form.chatEnabled !== chatEnabled.value
  || form.defaultTheme !== defaultTheme.value
  || form.defaultLayout !== defaultLayout.value
)

const saving = ref(false)
const saved  = ref(false)

watch(dirty, (d) => { if (d) saved.value = false })

async function save() {
  saving.value = true
  try {
    if (form.foundedYear !== foundedYear.value) await setFoundedYear(form.foundedYear)
    if (form.registrationEnabled !== registrationEnabled.value) await setRegistrationEnabled(form.registrationEnabled)
    if (form.chatEnabled !== chatEnabled.value) await setChatEnabled(form.chatEnabled)
    if (form.defaultTheme !== defaultTheme.value) await setDefaultTheme(form.defaultTheme)
    if (form.defaultLayout !== defaultLayout.value) await setDefaultLayout(form.defaultLayout)
    saved.value = true
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.field-label { @apply text-[10px] font-bold text-ink-3 uppercase tracking-widest; }
.field-input { @apply w-full bg-bg-2 border border-white/[0.1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors; }
</style>
