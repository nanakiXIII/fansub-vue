import { ref } from 'vue'
import { useSocket } from './useSocket.js'
import { useSettings } from './useSettings.js'
import { http } from '@/services/http.js'

const messages      = ref([])
const unread        = ref(0)
const historyLoaded = ref(false)
let   handlersReady = false

function ensureHandlers() {
  if (handlersReady) return
  handlersReady = true
  const { socket } = useSocket()

  socket.on('chat:history', (history) => {
    messages.value      = history
    historyLoaded.value = true
  })

  socket.on('chat:message', (msg) => {
    if (!messages.value.find(m => String(m._id) === String(msg._id))) {
      messages.value.push(msg)
    }
    const settings = useSettings()
    if (String(msg.userId) !== String(settings.uid)) {
      unread.value++
    }
  })
}

export function useChat() {
  ensureHandlers()
  const { socket, onlineCount } = useSocket()

  async function loadHistory() {
    if (historyLoaded.value) return
    try {
      messages.value      = await http.get('/chat')
      historyLoaded.value = true
    } catch {}
  }

  function resetUnread() { unread.value = 0 }

  function sendMessage(text) {
    if (!text?.trim()) return
    socket.emit('chat:send', { text })
  }

  return { messages, unread, onlineCount, loadHistory, resetUnread, sendMessage, socket }
}
