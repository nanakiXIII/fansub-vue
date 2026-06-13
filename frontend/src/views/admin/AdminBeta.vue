<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-[20px] font-extrabold text-white">Bêta &amp; Maintenance</h1>
      <p class="text-[12px] text-ink-3 mt-0.5">Gestion du mode bêta, de la maintenance et des rapports de bugs.</p>
    </div>

    <!-- Toggle bêta -->
    <div class="sidebar-card p-5 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[14px] font-bold text-white mb-1">Mode bêta</div>
          <div class="text-[11px] text-ink-3">
            Quand activé, un widget de rapport de bug apparaît en bas à gauche pour tous les visiteurs.
          </div>
        </div>
        <button
          @click="toggleBeta"
          :disabled="togglingBeta"
          class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none"
          :class="betaEnabled ? 'bg-orange-500' : 'bg-bg-3'"
        >
          <span
            class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
            :class="betaEnabled ? 'translate-x-6' : 'translate-x-1'"
          ></span>
        </button>
      </div>
      <div v-if="betaEnabled" class="mt-3 flex items-center gap-2 text-[11px] text-orange-400 bg-orange-500/10 rounded-lg px-3 py-2 border border-orange-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
        Mode bêta actif — le widget est visible sur le site
      </div>
    </div>

    <!-- ── Mode maintenance ── -->
    <div class="sidebar-card p-5 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            <div class="text-[14px] font-bold text-white">Mode maintenance</div>
          </div>
          <div class="text-[11px] text-ink-3">
            Rend le site inaccessible aux visiteurs. Seuls les admins et les grades autorisés peuvent naviguer.
          </div>
        </div>
        <button
          @click="toggleMaintenance"
          :disabled="togglingMaintenance"
          class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
          :class="maintenanceEnabled ? 'bg-red-500' : 'bg-bg-3'"
        >
          <span
            class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200"
            :class="maintenanceEnabled ? 'translate-x-6' : 'translate-x-1'"
          ></span>
        </button>
      </div>

      <!-- Alerte active -->
      <div v-if="maintenanceEnabled" class="mt-4 flex items-start gap-2.5 text-[11px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2.5 border border-red-500/20">
        <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mt-1 shrink-0"></span>
        <span><strong>Maintenance active</strong> — les visiteurs voient une page de maintenance. Les admins et grades autorisés accèdent au site normalement.</span>
      </div>

      <!-- Grades autorisés -->
      <div class="mt-4">
        <div class="text-[10px] font-bold text-ink-3 uppercase tracking-widest mb-3">
          Grades autorisés à naviguer pendant la maintenance
        </div>

        <div v-if="loadingRoles" class="text-[11px] text-ink-3">Chargement des grades…</div>
        <div v-else-if="!allRoles.length" class="text-[11px] text-ink-3">Aucun grade défini</div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="role in allRoles" :key="role.name"
            type="button"
            @click="toggleRole(role.name)"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors"
            :class="isRoleAllowed(role.name)
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'border-white/[0.07] bg-bg-2 text-ink-2 hover:text-white hover:border-white/20'"
          >
            <span
              v-if="isRoleAllowed(role.name)"
              class="w-3.5 h-3.5 shrink-0"
            >
              <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </span>
            <span
              v-else
              class="w-3.5 h-3.5 shrink-0 opacity-40"
            >
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </span>
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :style="{ background: role.color || '#888' }"
            ></span>
            {{ role.label || role.name }}
          </button>
        </div>

        <div class="mt-3 flex items-center gap-1.5 text-[10px] text-ink-3">
          <svg class="w-3 h-3 shrink-0 text-yellow-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
          Les administrateurs ont toujours accès, quel que soit ce réglage.
        </div>
      </div>
    </div>

    <!-- Bug reports -->
    <div class="sidebar-card">
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div class="text-[13px] font-bold text-white">
          Rapports de bugs
          <span class="ml-2 text-[11px] font-normal text-ink-3">{{ total }} total</span>
        </div>
        <div class="flex items-center gap-2">
          <select v-model="filterStatus" @change="loadBugs(1)" class="admin-select text-[11px]">
            <option value="">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="resolved">Résolu</option>
            <option value="closed">Fermé</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12 text-ink-3 text-[12px]">Chargement…</div>

      <!-- Empty -->
      <div v-else-if="!bugs.length" class="text-center py-12 text-ink-3 text-[12px]">
        Aucun rapport de bug.
      </div>

      <!-- List -->
      <div v-else>
        <div
          v-for="bug in bugs"
          :key="bug._id"
          class="px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
        >
          <div class="flex items-start gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-[9px] font-bold px-1.5 py-px rounded"
                  :class="statusClass(bug.status)"
                >{{ statusLabel(bug.status) }}</span>
                <span
                  class="text-[9px] font-bold px-1.5 py-px rounded"
                  :class="priorityClass(bug.priority)"
                >{{ priorityLabel(bug.priority) }}</span>
                <span class="text-[10px] text-ink-3 ml-auto shrink-0">{{ formatDate(bug.createdAt) }}</span>
              </div>
              <div class="text-[12px] font-semibold text-white mb-0.5">
                {{ bug.title || '(sans titre)' }}
              </div>
              <p class="text-[11px] text-ink-2 line-clamp-2 mb-1.5">{{ bug.description }}</p>
              <div class="flex items-center gap-3 text-[10px] text-ink-3">
                <span>👤 {{ bug.username }}</span>
                <span v-if="bug.url" class="truncate max-w-[200px]" :title="bug.url">🔗 {{ bug.url.replace(/^https?:\/\/[^/]+/, '') }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col gap-1.5 shrink-0">
              <select
                :value="bug.status"
                @change="updateBug(bug._id, { status: $event.target.value })"
                class="admin-select text-[10px]"
              >
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
              <select
                :value="bug.priority"
                @change="updateBug(bug._id, { priority: $event.target.value })"
                class="admin-select text-[10px]"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyen</option>
                <option value="high">Élevé</option>
                <option value="critical">Critique</option>
              </select>
              <button @click="deleteBug(bug._id)" class="text-[10px] text-red-400 hover:text-red-300 text-center">Supprimer</button>
            </div>
          </div>

          <!-- Réponse existante -->
          <div v-if="bug.reply?.text" class="mt-2 bg-orange/5 border border-orange/20 rounded-lg px-3 py-2">
            <div class="flex items-center gap-1.5 mb-1">
              <svg class="w-3 h-3 text-orange shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="text-[9px] font-bold text-orange">{{ bug.reply.author }}</span>
              <span class="text-[9px] text-ink-3 ml-auto">{{ formatDate(bug.reply.repliedAt) }}</span>
            </div>
            <p class="text-[10px] text-ink-1 whitespace-pre-wrap">{{ bug.reply.text }}</p>
          </div>

          <!-- Zone de réponse -->
          <div class="mt-2">
            <div v-if="replyingId !== bug._id">
              <button
                @click="openReply(bug)"
                class="text-[10px] text-orange hover:text-orange/80 transition-colors"
              >{{ bug.reply?.text ? '✏ Modifier la réponse' : '↩ Répondre' }}</button>
            </div>
            <div v-else class="flex flex-col gap-1.5">
              <textarea
                v-model="replyText"
                rows="3"
                placeholder="Votre réponse visible par l'utilisateur…"
                class="admin-input text-[11px] resize-none"
              ></textarea>
              <div class="flex items-center gap-2">
                <button @click="submitReply(bug._id)" :disabled="sendingReply" class="btn-primary text-[10px] py-1 px-3">
                  {{ sendingReply ? 'Envoi…' : 'Envoyer' }}
                </button>
                <button @click="replyingId = null" class="text-[10px] text-ink-3 hover:text-white">Annuler</button>
              </div>
            </div>
          </div>

          <!-- User agent (collapsible) -->
          <details v-if="bug.userAgent" class="mt-2">
            <summary class="text-[9px] text-ink-3 cursor-pointer hover:text-ink-2">Infos navigateur</summary>
            <p class="text-[9px] text-ink-3 mt-1 font-mono break-all">{{ bug.userAgent }}</p>
          </details>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pages > 1" class="flex items-center justify-center gap-2 px-4 py-3 border-t border-white/[0.06]">
        <button
          v-for="p in pages"
          :key="p"
          @click="loadBugs(p)"
          class="w-7 h-7 rounded text-[11px] font-medium transition-colors"
          :class="p === currentPage ? 'bg-accent-1 text-white' : 'text-ink-3 hover:text-white hover:bg-white/[0.06]'"
        >{{ p }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { http } from '@/services/http.js'
import { useDialog } from '@/composables/useDialog.js'

const { showConfirm } = useDialog()
import { useBeta } from '@/composables/useBeta.js'

const { betaEnabled, setBeta, maintenanceEnabled, maintenanceAllowedRoles, setMaintenance, setAllowedRoles } = useBeta()
const togglingBeta        = ref(false)
const togglingMaintenance = ref(false)
const allRoles            = ref([])
const loadingRoles        = ref(false)

async function toggleMaintenance() {
  togglingMaintenance.value = true
  try { await setMaintenance(!maintenanceEnabled.value) } finally { togglingMaintenance.value = false }
}

function isRoleAllowed(name) {
  return maintenanceAllowedRoles.value.includes(name)
}

async function toggleRole(name) {
  const current = maintenanceAllowedRoles.value
  const next = current.includes(name)
    ? current.filter(r => r !== name)
    : [...current, name]
  await setAllowedRoles(next)
}

const bugs        = ref([])
const loading     = ref(true)
const total       = ref(0)
const pages       = ref(1)
const currentPage = ref(1)
const filterStatus = ref('')

const replyingId  = ref(null)
const replyText   = ref('')
const sendingReply = ref(false)

function openReply(bug) {
  replyingId.value = bug._id
  replyText.value  = bug.reply?.text ?? ''
}

async function submitReply(id) {
  if (!replyText.value.trim()) return
  sendingReply.value = true
  try {
    const updated = await http.patch(`/bugs/${id}/reply`, { text: replyText.value })
    const idx = bugs.value.findIndex(b => b._id === id)
    if (idx !== -1) bugs.value[idx] = updated
    replyingId.value = null
    replyText.value  = ''
  } catch {}
  finally { sendingReply.value = false }
}

async function toggleBeta() {
  togglingBeta.value = true
  try { await setBeta(!betaEnabled.value) } finally { togglingBeta.value = false }
}

async function loadBugs(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const params = new URLSearchParams({ page })
    if (filterStatus.value) params.set('status', filterStatus.value)
    const data = await http.get(`/bugs?${params}`)
    bugs.value  = data.items
    total.value = data.total
    pages.value = data.pages
  } catch {}
  finally { loading.value = false }
}

async function updateBug(id, patch) {
  try {
    const updated = await http.patch(`/bugs/${id}`, patch)
    const idx = bugs.value.findIndex(b => b._id === id)
    if (idx !== -1) bugs.value[idx] = updated
  } catch {}
}

async function deleteBug(id) {
  if (!await showConfirm('Supprimer ce rapport ?')) return
  try {
    await http.delete(`/bugs/${id}`)
    bugs.value = bugs.value.filter(b => b._id !== id)
    total.value--
  } catch {}
}

function statusLabel(s) {
  return { open: 'Ouvert', in_progress: 'En cours', resolved: 'Résolu', closed: 'Fermé' }[s] || s
}
function statusClass(s) {
  return {
    open:        'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-yellow-500/20 text-yellow-400',
    resolved:    'bg-emerald-500/20 text-emerald-400',
    closed:      'bg-bg-3 text-ink-3',
  }[s] || ''
}
function priorityLabel(p) {
  return { low: 'Faible', medium: 'Moyen', high: 'Élevé', critical: 'Critique' }[p] || p
}
function priorityClass(p) {
  return {
    low:      'bg-bg-3 text-ink-3',
    medium:   'bg-bg-3 text-ink-2',
    high:     'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400',
  }[p] || ''
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  loadBugs()
  loadingRoles.value = true
  try { allRoles.value = await http.get('/roles') } catch {}
  loadingRoles.value = false
})
</script>

<style scoped>
.admin-select {
  background-color: rgb(var(--color-bg-2));
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 6px;
  color: rgb(var(--color-ink-1));
  padding: 3px 22px 3px 8px;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%235a5a72'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 6px center;
}
.admin-select:focus { border-color: rgba(255,255,255,0.2); }
.admin-select option {
  background-color: rgb(var(--color-bg-2));
  color: rgb(var(--color-ink-1));
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
