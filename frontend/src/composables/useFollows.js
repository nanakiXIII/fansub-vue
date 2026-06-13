import { ref } from 'vue'
import { http } from '@/services/http.js'

const followedSeries = ref(new Set())
let loadedForUser = null

export function useFollows() {
  async function load(userId) {
    if (!userId || loadedForUser === userId) return
    loadedForUser = userId
    try {
      const ids = await http.get('/follows')
      followedSeries.value = new Set(ids)
    } catch {
      loadedForUser = null
    }
  }

  function reset() {
    followedSeries.value = new Set()
    loadedForUser = null
  }

  function isFollowing(serieId) {
    return followedSeries.value.has(serieId)
  }

  async function toggleFollow(serieId) {
    try {
      const { following } = await http.post(`/follows/${serieId}`)
      const next = new Set(followedSeries.value)
      if (following) {
        next.add(serieId)
      } else {
        next.delete(serieId)
      }
      followedSeries.value = next
      return following
    } catch { return null }
  }

  return { followedSeries, isFollowing, toggleFollow, load, reset }
}
