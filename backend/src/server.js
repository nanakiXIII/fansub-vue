const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const http     = require('http')
const mongoose = require('mongoose')
const { Server } = require('socket.io')
const app      = require('./app')
const socket   = require('./socket')

const PORT        = process.env.PORT        || 3000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fansub'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

const server = http.createServer(app)
const io     = new Server(server, {
  cors: { origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN, methods: ['GET', 'POST'], credentials: true },
})

socket.init(io)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connecté')
    server.listen(PORT, () => console.log(`🚀 API + Socket.io démarrés sur http://localhost:${PORT}`))
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err.message)
    process.exit(1)
  })
