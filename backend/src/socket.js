const jwt         = require('jsonwebtoken')
const User        = require('./models/User')
const Role        = require('./models/Role')
const ChatMessage = require('./models/ChatMessage')

let _io = null
const cooldowns     = new Map() // userId → lastMessageAt
const onlineUsers   = new Map() // userId|socketId → refCount (tab count)
const userLocations = new Map() // socketId → location snapshot

const VALID_TYPES = new Set(['home','episode','serie','catalogue','news','releases','team','profile','admin','other'])

// ── Singleton ─────────────────────────────────────────────────────
function getIO() { return _io }

function emit(event, data) {
  _io?.emit(event, data)
}

function emitToUser(userId, event, data) {
  _io?.to(`user:${userId}`).emit(event, data)
}

// ── Auth middleware socket ────────────────────────────────────────
async function authMiddleware(socket, next) {
  const token = socket.handshake.auth?.token
  if (!token) return next() // visiteur anonyme
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(payload.id).select('username avatar role isAdmin').lean()
    if (!user) return next()
    let roleLabel = null
    let roleColor = null
    if (user.role) {
      const role = await Role.findOne({ name: user.role }).lean()
      roleLabel  = role?.label ?? null
      roleColor  = role?.color ?? null
    }
    socket.user = { id: user._id.toString(), username: user.username, avatar: user.avatar, isAdmin: user.isAdmin, roleLabel, roleColor }
  } catch {}
  next()
}

// ── Initialisation ────────────────────────────────────────────────
function init(io) {
  _io = io

  io.use(authMiddleware)

  io.on('connection', async (socket) => {
    // Rejoindre la room personnelle si authentifié
    if (socket.user) {
      socket.join(`user:${socket.user.id}`)
    }

    // Compteur d'utilisateurs uniques
    const onlineKey = socket.user?.id ?? socket.id
    onlineUsers.set(onlineKey, (onlineUsers.get(onlineKey) ?? 0) + 1)
    io.emit('online:count', onlineUsers.size)

    // Snapshot de localisation initial
    userLocations.set(socket.id, {
      socketId:   socket.id,
      userId:     socket.user?.id      ?? null,
      username:   socket.user?.username ?? 'Anonyme',
      avatar:     socket.user?.avatar   ?? null,
      isAdmin:    socket.user?.isAdmin  ?? false,
      roleLabel:  socket.user?.roleLabel ?? null,
      roleColor:  socket.user?.roleColor ?? null,
      type:       'other',
      path:       '/',
      label:      '',
      serieId:    null,
      epNum:      null,
      connectedAt: new Date(),
      lastSeen:   new Date(),
    })

    // Envoyer l'historique des 60 derniers messages
    try {
      const history = await ChatMessage.find({ room: 'global' })
        .sort({ createdAt: -1 }).limit(60).lean()
      socket.emit('chat:history', history.reverse())
    } catch {}

    // ── Réception d'un message ────────────────────────────────────
    socket.on('chat:send', async (data) => {
      if (!socket.user) return // non connecté → refus silencieux

      const text = String(data?.text ?? '').trim().slice(0, 500)
      if (!text) return

      // Compte local (pas de rôle, pas admin) → 1 msg/min ; staff/admin → 2 s
      const isPrivileged = socket.user.isAdmin || !!socket.user.roleLabel
      const limit  = isPrivileged ? 2_000 : 60_000
      const lastAt = cooldowns.get(socket.user.id) ?? 0
      const waited = Date.now() - lastAt
      if (waited < limit) {
        const remaining = Math.ceil((limit - waited) / 1000)
        socket.emit('chat:error',
          remaining >= 60
            ? 'Tu peux envoyer un message par minute.'
            : `Attends encore ${remaining} seconde${remaining > 1 ? 's' : ''}.`
        )
        return
      }
      cooldowns.set(socket.user.id, Date.now())

      try {
        const msg = await ChatMessage.create({
          userId:    socket.user.id,
          username:  socket.user.username,
          avatar:    socket.user.avatar,
          roleLabel: socket.user.roleLabel,
          roleColor: socket.user.roleColor,
          text,
          room:      'global',
        })
        io.emit('chat:message', msg)
      } catch {}
    })

    // Mise à jour de la localisation
    socket.on('user:location', (data) => {
      if (typeof data !== 'object' || data === null) return
      const loc = userLocations.get(socket.id)
      if (!loc) return
      const type    = VALID_TYPES.has(data.type) ? data.type : 'other'
      const path    = typeof data.path    === 'string' ? data.path.slice(0, 200)    : '/'
      const label   = typeof data.label   === 'string' ? data.label.slice(0, 100)   : ''
      const serieId = typeof data.serieId === 'string' ? data.serieId.slice(0, 100) : null
      const epNum   = data.epNum != null               ? String(data.epNum).slice(0, 10) : null
      userLocations.set(socket.id, { ...loc, type, path, label, serieId, epNum, lastSeen: new Date() })
      io.to('analytics').emit('analytics:update', [...userLocations.values()])
    })

    // Abonnement à la room analytics (admins uniquement)
    socket.on('analytics:subscribe', () => {
      if (!socket.user?.isAdmin) return
      socket.join('analytics')
      socket.emit('analytics:update', [...userLocations.values()])
    })

    socket.on('analytics:unsubscribe', () => socket.leave('analytics'))

    socket.on('disconnect', () => {
      userLocations.delete(socket.id)
      io.to('analytics').emit('analytics:update', [...userLocations.values()])
      const count = (onlineUsers.get(onlineKey) ?? 1) - 1
      if (count <= 0) onlineUsers.delete(onlineKey)
      else            onlineUsers.set(onlineKey, count)
      io.emit('online:count', onlineUsers.size)
    })
  })
}

module.exports = { init, getIO, emit, emitToUser }
