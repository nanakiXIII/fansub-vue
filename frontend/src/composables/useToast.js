import { ref } from 'vue'

const toasts = ref([])
let counter = 0

function show(type, message, duration = 4000) {
  const id = ++counter
  toasts.value.push({ id, type, message })
  if (duration > 0) setTimeout(() => dismiss(id), duration)
  return id
}

function dismiss(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (msg, d)  => show('success', msg, d),
    error:   (msg, d)  => show('error',   msg, d),
    warning: (msg, d)  => show('warning', msg, d),
    info:    (msg, d)  => show('info',    msg, d),
  }
}
