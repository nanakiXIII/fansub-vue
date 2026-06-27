const express  = require('express')
const Release  = require('../models/Release')
const Series   = require('../models/Series')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { emit } = require('../socket')
const { notifyFollowers } = require('../services/notificationService')
const { findEpisode } = require('../utils/episodeLookup')

const router = express.Router()

// GET /api/releases?limit=N — public
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)

    // On récupère plus que nécessaire pour compenser le filtrage des épisodes masqués
    const candidates = await Release.find().sort({ releasedAt: -1 }).limit(limit * 4)

    const serieIds  = [...new Set(candidates.map(r => r.serieId))]
    const seriesDocs = await Series.find(
      { id: { $in: serieIds }, visible: { $ne: false } },
      'id seasons episodes'
    ).lean()
    const seriesMap = Object.fromEntries(seriesDocs.map(s => [s.id, s]))

    const visible = candidates.filter(r => {
      const serie = seriesMap[r.serieId]
      if (!serie) return false

      const episode = findEpisode(serie, r.seasonSlug, r.epNum)
      return episode?.visible !== false
    }).slice(0, limit)

    res.json(visible)
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
