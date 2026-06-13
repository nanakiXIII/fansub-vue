const express    = require('express')
const jwt        = require('jsonwebtoken')
const User       = require('../models/User')
const InProgress = require('../models/InProgress')
const { requireAuth, requireAdmin, requirePermission } = require('../middleware/auth')

const router = express.Router()

// GET /api/inprogress — public (visible=true) ou tout si admin
router.get('/', async (req, res, next) => {
  try {
    let isAdmin = false
    const auth = req.headers.authorization
    if (auth?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('isAdmin')
        isAdmin = user?.isAdmin ?? false
      } catch {}
    }
    const filter = isAdmin ? {} : { visible: true }
    const items = await InProgress.find(filter).sort({ order: 1, createdAt: 1 })
    res.json(items)
  } catch (err) { next(err) }
})

// POST /api/inprogress — admin uniquement
router.post('/', requireAuth, requirePermission('inprogress.manage'), async (req, res, next) => {
  try {
    const item = await InProgress.create(req.body)
    res.status(201).json(item)
  } catch (err) { next(err) }
})

// PUT /api/inprogress/:id — admin uniquement
router.put('/:id', requireAuth, requirePermission('inprogress.manage'), async (req, res, next) => {
  try {
    const item = await InProgress.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!item) return res.status(404).json({ error: 'Entrée introuvable' })
    res.json(item)
  } catch (err) { next(err) }
})

// DELETE /api/inprogress/:id — admin uniquement
router.delete('/:id', requireAuth, requirePermission('inprogress.manage'), async (req, res, next) => {
  try {
    const item = await InProgress.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Entrée introuvable' })
    res.json({ message: 'Entrée supprimée' })
  } catch (err) { next(err) }
})

module.exports = router
