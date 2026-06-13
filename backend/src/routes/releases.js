const express  = require('express')
const Release  = require('../models/Release')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { emit } = require('../socket')
const { notifyFollowers } = require('../services/notificationService')

const router = express.Router()

// GET /api/releases?limit=N — public
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)
    const items = await Release.find().sort({ releasedAt: -1 }).limit(limit)
    res.json(items)
  } catch (err) { next(err) }
})

// POST /api/releases — admin uniquement, upsert
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { serieId, seasonSlug, epNum, quality, releasedAt } = req.body
    const item = await Release.findOneAndUpdate(
      { serieId, seasonSlug, epNum },
      { serieId, seasonSlug, epNum, quality, releasedAt },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    )
    emit('new:release', item)
    notifyFollowers(serieId, { seasonSlug, epNum }).catch(() => {})
    res.status(201).json(item)
  } catch (err) { next(err) }
})

// DELETE /api/releases/:id — admin uniquement
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const item = await Release.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ error: 'Release introuvable' })
    res.json({ message: 'Release supprimée' })
  } catch (err) { next(err) }
})

module.exports = router
