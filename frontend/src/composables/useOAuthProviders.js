import { ref } from 'vue'
import { http } from '@/services/http.js'

const providers = ref({ google: false, discord: false })
let fetched = false

export async function loadProviders() {
  if (fetched) return
  fetched = true
  try {
    const data = await http.get('/auth/providers')
    providers.value = data
  } catch {}
}

export function useOAuthProviders() {
  return providers
}
