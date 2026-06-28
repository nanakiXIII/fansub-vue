import { ref } from 'vue'
import { http } from '@/services/http.js'
import { socket } from '@/services/socket.js'
import { getCookie } from '@/utils/cookies.js'
import { theme, themes, layout, layouts } from '@/composables/useTheme.js'

const betaEnabled             = ref(false)
const maintenanceEnabled      = ref(false)
const maintenanceAllowedRoles = ref([])
const foundedYear             = ref(2019)
const registrationEnabled     = ref(true)
const chatEnabled             = ref(true)
const defaultTheme            = ref('braise')
const defaultLayout           = ref('default')
let fetchPromise = null

function applyData(data) {
  if (!data) return
  betaEnabled.value             = data.betaEnabled             ?? false
  maintenanceEnabled.value      = data.maintenanceEnabled      ?? false
  maintenanceAllowedRoles.value = data.maintenanceAllowedRoles ?? []
  foundedYear.value             = data.foundedYear             ?? 2019
  registrationEnabled.value     = data.registrationEnabled     ?? true
  chatEnabled.value              = data.chatEnabled             ?? true
  defaultTheme.value            = data.defaultTheme            ?? 'braise'
  defaultLayout.value           = data.defaultLayout           ?? 'default'

  // Applique le défaut admin uniquement si le visiteur n'a pas déjà sa propre préférence
  if (!getCookie('theme')  && themes.some(t => t.id === defaultTheme.value))   theme.value  = defaultTheme.value
  if (!getCookie('layout') && layouts.some(l => l.id === defaultLayout.value)) layout.value = defaultLayout.value
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

  async function setFoundedYear(year) {
    applyData(await http.patch('/settings', { foundedYear: year }))
  }

  async function setRegistrationEnabled(value) {
    applyData(await http.patch('/settings', { registrationEnabled: value }))
  }

  async function setChatEnabled(value) {
    applyData(await http.patch('/settings', { chatEnabled: value }))
  }

  async function setDefaultTheme(value) {
    applyData(await http.patch('/settings', { defaultTheme: value }))
  }

  async function setDefaultLayout(value) {
    applyData(await http.patch('/settings', { defaultLayout: value }))
  }

  return {
    betaEnabled, maintenanceEnabled, maintenanceAllowedRoles, foundedYear, registrationEnabled, chatEnabled,
    defaultTheme, defaultLayout,
    setBeta, setMaintenance, setAllowedRoles, setFoundedYear, setRegistrationEnabled, setChatEnabled,
    setDefaultTheme, setDefaultLayout,
  }
}
