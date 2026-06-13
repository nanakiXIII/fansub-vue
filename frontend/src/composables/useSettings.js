import { reactive, watch } from 'vue'

const LS_KEY = 'fansub_settings'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}') }
  catch { return {} }
}

const settings = reactive({
  streaming:     true,
  catalogueView: 'grid',
  isAdmin:       false,
  username:      null,
  uid:           null,
  avatar:        null,
  role:          null,
  roleLabel:     null,
  roleColor:     null,
  activeTitle:   null,
  permissions:   [],
  ...load(),
})

watch(settings, val => {
  localStorage.setItem(LS_KEY, JSON.stringify({ ...val }))
}, { deep: true })

export function useSettings() {
  return settings
}
