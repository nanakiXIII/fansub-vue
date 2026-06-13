const express  = require('express')
const AuditLog = require('../models/AuditLog')
const { requireAuth, requirePermission } = require('../middleware/auth')

const router = express.Router()

// GET /api/audit?page=1&limit=50&action=&userId=
router.get('/', requireAuth, requirePermission('audit.view'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, userId, search } = req.query
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * limitNum

    const filter = {}
    if (action)  filter.action  = action
    if (userId)  filter.userId  = userId
    if (search)  filter.username = { $regex: search, $options: 'i' }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      AuditLog.countDocuments(filter),
    ])

    res.json({ logs, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  } catch (err) { next(err) }
})

// GET /api/audit/actions — liste des types d'actions distincts
router.get('/actions', requireAuth, requirePermission('audit.view'), async (_req, res, next) => {
  try {
    const actions = await AuditLog.distinct('action')
    res.json(actions.sort())
  } catch (err) { next(err) }
})

module.exports = router
