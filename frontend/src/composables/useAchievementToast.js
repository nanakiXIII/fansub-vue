import { ref } from 'vue'

const toasts = ref([])
let counter = 0

export function useAchievementToast() {
  function show(achievement) {
    const id = ++counter
    toasts.value.push({ ...achievement, id })
    setTimeout(() => dismiss(id), 5500)
  }

  function showAll(achievements) {
    achievements.forEach((a, i) => setTimeout(() => show(a), i * 1200))
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, showAll, dismiss }
}
