const express    = require('express')
const { emit, emitToUser } = require('../socket')
const { requireAuth, requirePermission } = require('../middleware/auth')
const { logAudit } = require('../services/audit')

const router = express.Router()

const VALID_TYPES = new Set(['info', 'warning', 'success', 'error'])

// POST /api/alerts — admin uniquement
router.post('/', requireAuth, requirePermission('alerts.manage'), (req, res) => {
  const { type = 'info', title, message, targetType = 'all', targetUserId } = req.body
  if (!message?.trim()) return res.status(400).json({ error: 'message requis' })
  if (!VALID_TYPES.has(type)) return res.status(400).json({ error: 'type invalide' })

  const alert = {
    id:      Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type,
    title:   title?.trim() || null,
    message: message.trim().slice(0, 500),
    from:    req.user.username,
    sentAt:  new Date(),
  }

  if (targetType === 'user' && targetUserId) {
    emitToUser(targetUserId, 'alert:new', alert)
  } else {
    emit('alert:new', alert)
  }

  logAudit(req, 'alert.send', null, { type, title, targetType, targetUserId: targetUserId ?? null })
  res.json({ ok: true, alert })
})

module.exports = router
