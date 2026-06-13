import { io } from 'socket.io-client'

// Pas d'URL → Socket.io se connecte à la même origine que la page.
// En dev, le proxy Vite route /socket.io → backend:3000.
// En prod ou via ngrok, l'origine est celle du serveur qui sert le site.
export const socket = io({
  autoConnect: false,
  reconnectionDelay:    1000,
  reconnectionDelayMax: 5000,
})
