import { ref } from 'vue'
import { socket } from '@/services/socket.js'

const connected   = ref(false)
const onlineCount = ref(0)

socket.on('connect',    () => { connected.value = true  })
socket.on('disconnect', () => { connected.value = false })
socket.on('online:count', n => { onlineCount.value = n  })

export function useSocket() {
  function connect(token) {
    socket.auth = token ? { token } : {}
    if (!socket.connected) socket.connect()
  }

  function disconnect() { socket.disconnect() }

  return { socket, connected, onlineCount, connect, disconnect }
}
