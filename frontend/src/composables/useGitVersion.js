import { ref, computed, onMounted } from 'vue'

const REPO      = 'nanakiXIII/fansub-vue'
const CACHE_KEY = 'fansub_git_remote'
const CACHE_TTL = 5 * 60 * 1000  // 5 min

/* eslint-disable no-undef */
const LOCAL_HASH = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : 'dev'

export function useGitVersion() {
  const remoteHash = ref(null)
  const remoteUrl  = ref('')

  const hasUpdate = computed(() =>
    !!remoteHash.value && LOCAL_HASH !== 'dev' && remoteHash.value !== LOCAL_HASH
  )

  const dismissedHash = ref(localStorage.getItem('fansub_git_dismissed') ?? '')
  const isDismissed   = computed(() => dismissedHash.value === remoteHash.value)

  function dismiss() {
    if (!remoteHash.value) return
    dismissedHash.value = remoteHash.value
    localStorage.setItem('fansub_git_dismissed', remoteHash.value)
  }

  onMounted(async () => {
    try {
      let sha = null
      let url = null

      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const c = JSON.parse(cached)
        if (Date.now() - c.ts < CACHE_TTL) { sha = c.sha; url = c.url }
      }

      if (!sha) {
        const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
          headers: { Accept: 'application/vnd.github.v3+json' },
        })
        if (!res.ok) return
        const data = await res.json()
        sha = data.sha?.slice(0, 7) ?? null
        url = data.html_url ?? ''
        if (sha) localStorage.setItem(CACHE_KEY, JSON.stringify({ sha, url, ts: Date.now() }))
      }

      remoteHash.value = sha
      remoteUrl.value  = url
    } catch {}
  })

  return { localHash: LOCAL_HASH, remoteHash, remoteUrl, hasUpdate, isDismissed, dismiss }
}
