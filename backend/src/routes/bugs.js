const express   = require('express')
const BugReport = require('../models/BugReport')
const { requireAuth, requirePermission, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// POST /api/bugs — public (ou authentifié)
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { title, description, url, userAgent } = req.body
    if (!description?.trim()) return res.status(400).json({ error: 'Description requise' })
    const report = await BugReport.create({
      title:     title?.slice(0, 200) || '',
      description: description.slice(0, 2000),
      url:       url || '',
      userAgent: userAgent || req.headers['user-agent'] || '',
      userId:    req.user?._id ?? null,
      username:  req.user?.username ?? 'Anonyme',
    })
    res.status(201).json({ id: report._id })
  } catch (err) { next(err) }
})

// GET /api/bugs/mine — rapports soumis par l'utilisateur connecté
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const items = await BugReport.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
    res.json(items)
  } catch (err) { next(err) }
})

// GET /api/bugs — admin
router.get('/', requireAuth, requirePermission('beta.manage'), async (req, res, next) => {
  try {
    const { status, priority, page = 1 } = req.query
    const filter = {}
    if (status)   filter.status   = status
    if (priority) filter.priority = priority
    const limit = 30
    const skip  = (parseInt(page) - 1) * limit
    const [items, total] = await Promise.all([
      BugReport.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      BugReport.countDocuments(filter),
    ])
    res.json({ items, total, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// PATCH /api/bugs/:id — admin
router.patch('/:id', requireAuth, requirePermission('beta.manage'), async (req, res, next) => {
  try {
    const allowed = ['status', 'priority']
    const data = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const report = await BugReport.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!report) return res.status(404).json({ error: 'Rapport introuvable' })
    res.json(report)
  } catch (err) { next(err) }
})

// PATCH /api/bugs/:id/reply — répondre à un rapport
router.patch('/:id/reply', requireAuth, requirePermission('beta.manage'), async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Réponse vide' })
    const report = await BugReport.findByIdAndUpdate(
      req.params.id,
      { reply: { text: text.trim().slice(0, 1000), author: req.user.username, repliedAt: new Date() } },
      { new: true }
    )
    if (!report) return res.status(404).json({ error: 'Rapport introuvable' })
    res.json(report)
  } catch (err) { next(err) }
})

// DELETE /api/bugs/:id — admin
router.delete('/:id', requireAuth, requirePermission('beta.manage'), async (req, res, next) => {
  try {
    await BugReport.findByIdAndDelete(req.params.id)
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

module.exports = router
