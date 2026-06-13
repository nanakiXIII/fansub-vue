import { ref } from 'vue'
import { http } from '@/services/http.js'
import { socket } from '@/services/socket.js'

const betaEnabled             = ref(false)
const maintenanceEnabled      = ref(false)
const maintenanceAllowedRoles = ref([])
let fetchPromise = null

function applyData(data) {
  if (!data) return
  betaEnabled.value             = data.betaEnabled             ?? false
  maintenanceEnabled.value      = data.maintenanceEnabled      ?? false
  maintenanceAllowedRoles.value = data.maintenanceAllowedRoles ?? []
}

// Mise à jour en temps réel quand un admin change les settings
socket.on('settings:update', applyData)

function ensureLoaded() {
  if (!fetchPromise) {
    fetchPromise = http.get('/settings').then(applyData).catch(() => {})
  }
  return fetchPromise
}

export function useBeta() {
  ensureLoaded()

  async function setBeta(value) {
    applyData(await http.patch('/settings', { betaEnabled: value }))
  }

  async function setMaintenance(value) {
    applyData(await http.patch('/settings', { maintenanceEnabled: value }))
  }

  async function setAllowedRoles(roles) {
    applyData(await http.patch('/settings', { maintenanceAllowedRoles: roles }))
  }

  return { betaEnabled, maintenanceEnabled, maintenanceAllowedRoles, setBeta, setMaintenance, setAllowedRoles }
}
