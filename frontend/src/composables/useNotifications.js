import { ref, computed } from 'vue'
import { http } from '@/services/http.js'

const notifications = ref([])
let loaded = false

export function useNotifications() {
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  async function load(userId) {
    if (!userId || loaded) return
    loaded = true
    try {
      notifications.value = await http.get('/notifications')
    } catch {
      loaded = false
    }
  }

  function reset() {
    notifications.value = []
    loaded = false
  }

  function prepend(notif) {
    notifications.value = [notif, ...notifications.value.filter(n => String(n._id) !== String(notif._id))]
  }

  async function markRead(id) {
    try {
      await http.patch(`/notifications/${id}`)
      notifications.value = notifications.value.map(n =>
        String(n._id) === String(id) ? { ...n, read: true } : n
      )
    } catch {}
  }

  async function markAllRead() {
    try {
      await http.patch('/notifications/read-all')
      notifications.value = notifications.value.map(n => ({ ...n, read: true }))
    } catch {}
  }

  async function remove(id) {
    try {
      await http.delete(`/notifications/${id}`)
      notifications.value = notifications.value.filter(n => String(n._id) !== String(id))
    } catch {}
  }

  return { notifications, unreadCount, load, reset, prepend, markRead, markAllRead, remove }
}
