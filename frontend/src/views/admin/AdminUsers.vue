<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-[18px] font-extrabold text-white">Utilisateurs</h1>
        <p class="text-[11px] text-ink-3 mt-0.5">{{ users.length }} compte(s) inscrit(s)</p>
      </div>
    </div>

    <!-- Recherche -->
    <div class="relative mb-4">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-3 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="search"
        class="w-full bg-bg-1 border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-white placeholder:text-ink-3 outline-none focus:border-orange/50 transition-colors"
        placeholder="Rechercher un utilisateur…"
      />
    </div>

    <div v-if="loading" class="text-[12px] text-ink-3 py-8 text-center">Chargement…</div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="u in filtered"
        :key="u._id"
        class="bg-bg-1 border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-3"
      >
        <!-- Avatar -->
        <div
          class="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden"
          :style="isImageUrl(u.avatar) ? {} : { background: u.avatar || 'linear-gradient(135deg,#f97316,#fb923c)' }"
        >
          <img loading="lazy" v-if="isImageUrl(u.avatar)" :src="u.avatar" class="w-full h-full object-cover" />
          <span v-else>{{ initials(u.username) }}</span>
        </div>

        <!-- Infos -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[12px] font-bold text-white">{{ u.username }}</span>
            <span v-if="u.isAdmin" class="text-[9px] font-bold bg-orange/20 text-orange rounded px-1.5 py-px leading-none">ADMIN</span>
            <!-- Badge grade -->
            <span
              v-if="u.role && roleMap[u.role]"
              class="text-[9px] font-bold rounded-full px-2 py-px leading-none text-white"
              :style="{ background: roleMap[u.role].color || '#444' }"
            >{{ roleMap[u.role].label }}</span>
          </div>
          <div class="text-[10px] text-ink-3">{{ u.email }} · Inscrit {{ formatDate(u.createdAt) }}</div>
        </div>

        <!-- Grade picker -->
        <div class="relative shrink-0" :ref="el => pickerRefs[u._id] = el">
          <button
            @click="togglePicker(u._id)"
            class="text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-colors"
            :class="u.role
              ? 'border-white/20 text-ink-1 hover:border-white/30'
              : 'bg-bg-2 text-ink-3 border-white/10 hover:border-white/20 hover:text-white'"
            :style="u.role && roleMap[u.role] ? { background: roleMap[u.role].color + '33', borderColor: roleMap[u.role].color + '66' } : {}"
          >{{ u.role && roleMap[u.role] ? roleMap[u.role].label : 'Grade' }}</button>

          <div
            v-if="openPicker === u._id"
            class="absolute right-0 top-full mt-1 z-20 bg-bg-2 border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden min-w-[160px]"
          >
            <button
              @click="assignRole(u, null)"
              class="w-full text-left px-3 py-2 text-[11px] text-ink-3 hover:bg-white/[0.06] transition-colors flex items-center gap-2"
              :class="!u.role ? 'bg-white/[0.04] text-white' : ''"
            >
              <span class="w-2 h-2 rounded-full bg-white/20 shrink-0"></span>
              Aucun grade
            </button>
            <div class="border-t border-white/[0.06]"></div>
            <button
              v-for="r in roles" :key="r._id"
              @click="assignRole(u, r.name)"
              class="w-full text-left px-3 py-2 text-[11px] hover:bg-white/[0.06] transition-colors flex items-center gap-2"
              :class="u.role === r.name ? 'bg-white/[0.04]' : 'text-ink-1'"
            >
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: r.color || '#444' }"></span>
              {{ r.label }}
              <svg v-if="u.role === r.name" class="ml-auto w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Toggle admin -->
        <button
          @click="toggleAdmin(u)"
          :disabled="u._id === currentUserId"
          class="shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :class="u.isAdmin
            ? 'bg-orange/10 text-orange border-orange/30 hover:bg-orange/20'
            : 'bg-bg-2 text-ink-3 border-white/10 hover:border-white/20 hover:text-white'"
          :title="u._id === currentUserId ? 'Impossible de modifier ses propres droits' : (u.isAdmin ? 'Révoquer admin' : 'Passer admin')"
        >{{ u.isAdmin ? 'Admin' : 'Membre' }}</button>

        <!-- Supprimer (admins seulement) -->
        <button
          v-if="settings.isAdmin"
          @click="deleteUser(u)"
          :disabled="u._id === currentUserId"
          class="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
        </button>
      </div>
      <div v-if="!filtered.length" class="text-[12px] text-ink-3 py-8 text-center">Aucun utilisateur trouvé.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { http } from '@/services/http.js'
import { useSettings } from '@/composables/useSettings.js'
import { useDialog } from '@/composables/useDialog.js'

const { showAlert, showConfirm } = useDialog()

const users      = ref([])
const roles      = ref([])
const loading    = ref(true)
const search     = ref('')
const openPicker = ref(null)
const pickerRefs = ref({})
const settings   = useSettings()

const currentUserId = computed(() => settings.uid)

const roleMap = computed(() => {
  const m = {}
  for (const r of roles.value) m[r.name] = r
  return m
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const [u, r] = await Promise.all([http.get('/auth/users'), http.get('/roles')])
    users.value = u
    roles.value = r
  } catch {}
  loading.value = false
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

function onClickOutside(e) {
  if (!openPicker.value) return
  const el = pickerRefs.value[openPicker.value]
  if (el && !el.contains(e.target)) openPicker.value = null
}

function togglePicker(id) {
  openPicker.value = openPicker.value === id ? null : id
}

async function assignRole(u, roleName) {
  openPicker.value = null
  try {
    const res = await http.patch(`/auth/users/${u._id}/role`, { role: roleName })
    const idx = users.value.findIndex(x => x._id === u._id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], role: res.role }
  } catch (e) { showAlert(e.message) }
}

function initials(name) {
  return (name ?? '').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || '?'
}

function isImageUrl(val) {
  return typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'))
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function toggleAdmin(u) {
  try {
    const res = await http.patch(`/auth/users/${u._id}/admin`)
    const idx = users.value.findIndex(x => x._id === u._id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], isAdmin: res.isAdmin }
  } catch (e) { showAlert(e.message) }
}

async function deleteUser(u) {
  if (!await showConfirm(`Supprimer le compte de « ${u.username} » ? Cette action est irréversible.`)) return
  try {
    await http.delete(`/auth/users/${u._id}`)
    users.value = users.value.filter(x => x._id !== u._id)
  } catch (e) { showAlert(e.message) }
}
</script>
