// src/composables/useDiscordWidget.js
// Récupère les infos publiques du serveur Discord (membres en ligne, total, icône)
// via l'API publique des invitations Discord — aucun bot ni token requis.
// Doc : GET https://discord.com/api/v10/invites/{code}?with_counts=true

import { ref } from 'vue'
import { config } from '@/config.js'

const loading = ref(false)
const error   = ref(false)
const data    = ref(null)
let fetched   = false

function extractInviteCode(url) {
  if (!url) return null
  const m = url.match(/discord(?:\.gg|(?:app)?\.com\/invite)\/([a-zA-Z0-9-]+)/)
  return m ? m[1] : null
}

export function useDiscordWidget() {
  async function load() {
    if (fetched) return
    fetched = true
    const code = extractInviteCode(config.discordUrl)
    if (!code) { error.value = true; return }

    loading.value = true
    try {
      const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`)
      if (!res.ok) throw new Error('invite lookup failed')
      const json = await res.json()
      data.value = {
        guildName:    json.guild?.name ?? null,
        iconUrl:      json.guild?.icon
          ? `https://cdn.discordapp.com/icons/${json.guild.id}/${json.guild.icon}.png?size=64`
          : null,
        onlineCount:  json.approximate_presence_count ?? null,
        memberCount:  json.approximate_member_count ?? null,
      }
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, load }
}
