const express = require('express')
const { body, validationResult } = require('express-validator')
const Series  = require('../models/Series')
const Release = require('../models/Release')
const Stat    = require('../models/Stat')
const { emit, emitToUser } = require('../socket')
const Follow       = require('../models/Follow')
const Notification = require('../models/Notification')
const { requireAuth, requireAdmin, requirePermission, optionalAuth } = require('../middleware/auth')
const { logAudit } = require('../services/audit')
const { findEpisode } = require('../utils/episodeLookup')

const router = express.Router()

function canPreview(req) {
  const p = req.userPermissions ?? []
  return p.includes('*') || p.includes('content.preview')
}

function canModifySerie(req, serieId) {
  const perms = req.userPermissions ?? []
  if (perms.includes('*')) return true
  const ids = req.userSeriesIds ?? []
  return ids.length === 0 || ids.includes(String(serieId))
}

// GET /api/series?status=&genre=&search=&managed=1
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { status, genre, search, managed } = req.query
    const filter = {}
    if (status) filter.status = status
    if (genre)  filter.genres = genre
    if (search) filter.$or = [
      { title:     { $regex: search, $options: 'i' } },
      { titleFull: { $regex: search, $options: 'i' } },
    ]
    if (!canPreview(req)) filter.visible = { $ne: false }

    // ?managed=1 : restreindre aux séries autorisées par le grade
    const perms = req.userPermissions ?? []
    if (managed && !perms.includes('*') && req.userSeriesIds?.length > 0) {
      filter.id = { $in: req.userSeriesIds }
    }

    const series = await Series.find(filter).sort({ createdAt: -1 }).lean()
    res.json(series)
  } catch (err) { next(err) }
})

// GET /api/series/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const serie = await Series.findOne({ id: req.params.id }).lean()
    if (!serie) return res.status(404).json({ error: 'Série introuvable' })
    if (serie.visible === false && !canPreview(req))
      return res.status(404).json({ error: 'Série introuvable' })
    res.json(serie)
  } catch (err) { next(err) }
})

// POST /api/series
router.post('/',
  requireAuth, requirePermission('series.create'),
  body('id').notEmpty().withMessage('id requis'),
  body('title').notEmpty().withMessage('title requis'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const serie = await Series.create(req.body)
      emit('new:series', serie.toObject())
      logAudit(req, 'series.create', serie.id, { title: serie.title })
      res.status(201).json(serie)
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: 'ID déjà utilisé' })
      next(err)
    }
  }
)

// PUT /api/series/:id — admin uniquement
router.put('/:id', requireAuth, requirePermission('series.edit'), async (req, res, next) => {
  try {
    if (!canModifySerie(req, req.params.id))
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette série' })

    // Snapshot des épisodes existants avant mise à jour
    const before = await Series.findOne({ id: req.params.id }).lean()
    const existingKeys = new Set()
    const existingEpMap = new Map() // `slug:num` → { title, visible }
    if (before) {
      const addEps = (eps, slug) => eps?.forEach(e => {
        const key = `${slug}:${e.num}`
        existingKeys.add(key)
        existingEpMap.set(key, { title: e.title, visible: e.visible })
      })
      if (before.seasons?.length) {
        before.seasons.forEach(s => addEps(s.episodes, s.slug))
      } else {
        addEps(before.episodes, 'saison-1')
      }
    }

    const serie = await Series.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    if (!serie) return res.status(404).json({ error: 'Série introuvable' })

    // Détecte les nouveaux épisodes et crée les releases correspondantes
    const newReleases = []
    const collectNew = (eps, seasonSlug) => {
      eps?.forEach(ep => {
        if (!existingKeys.has(`${seasonSlug}:${ep.num}`)) {
          newReleases.push({ serieId: serie.id, seasonSlug, epNum: ep.num })
        }
      })
    }
    if (serie.seasons?.length) {
      serie.seasons.forEach(s => collectNew(s.episodes, s.slug))
    } else {
      collectNew(serie.episodes, 'saison-1')
    }

    // Récupère les abonnés une seule fois pour la série
    const followers = newReleases.length
      ? await Follow.find({ serieId: req.params.id }).lean()
      : []

    for (const r of newReleases) {
      // Titre de l'épisode depuis la série mise à jour
      const epTitle = findEpisode(serie, r.seasonSlug, r.epNum)?.title ?? null

      const release = await Release.findOneAndUpdate(
        { serieId: r.serieId, seasonSlug: r.seasonSlug, epNum: r.epNum },
        { ...r, releasedAt: new Date() },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
      emit('new:release', release)

      // Notifie les abonnés
      if (followers.length) {
        const notifDocs = followers.map(f => ({
          userId:      f.userId,
          serieId:     serie.id,
          serieTitle:  serie.title,
          seriePoster: serie.poster,
          seasonSlug:  r.seasonSlug,
          epNum:       r.epNum,
          epTitle,
        }))
        const created = await Notification.insertMany(notifDocs)
        created.forEach(n => emitToUser(n.userId, 'notification:new', n.toObject()))
      }
    }

    // Détecte suppressions et changements de visibilité des épisodes
    const newEpMap = new Map()
    const collectEps = (eps, slug) => eps?.forEach(e => newEpMap.set(`${slug}:${e.num}`, { title: e.title, visible: e.visible }))
    if (serie.seasons?.length) {
      serie.seasons.forEach(s => collectEps(s.episodes, s.slug))
    } else {
      collectEps(serie.episodes, 'saison-1')
    }

    for (const [key, prev] of existingEpMap) {
      if (!newEpMap.has(key)) {
        const [seasonSlug, epNum] = key.split(':')
        logAudit(req, 'episode.delete', serie.id, { title: serie.title, seasonSlug, epNum: Number(epNum), epTitle: prev.title })
      } else {
        const curr = newEpMap.get(key)
        if (Boolean(prev.visible) !== Boolean(curr.visible)) {
          const [seasonSlug, epNum] = key.split(':')
          logAudit(req, 'episode.visibility', serie.id, { title: serie.title, seasonSlug, epNum: Number(epNum), epTitle: curr.title, visible: curr.visible !== false })
        }
      }
    }
    for (const [key, curr] of newEpMap) {
      if (!existingKeys.has(key)) {
        const [seasonSlug, epNum] = key.split(':')
        logAudit(req, 'episode.add', serie.id, { title: serie.title, seasonSlug, epNum: Number(epNum), epTitle: curr.title })
      }
    }

    // Log de l'action série avec détail si visibilité changée
    const details = { title: serie.title }
    if (before && req.body.visible !== undefined && before.visible !== req.body.visible) {
      details.visible = req.body.visible
    }
    logAudit(req, 'series.update', serie.id, details)

    res.json(serie)
  } catch (err) { next(err) }
})

// DELETE /api/series/:id — admin uniquement
router.delete('/:id', requireAuth, requirePermission('series.delete'), async (req, res, next) => {
  try {
    if (!canModifySerie(req, req.params.id))
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette série' })

    const serie = await Series.findOneAndDelete({ id: req.params.id })
    if (!serie) return res.status(404).json({ error: 'Série introuvable' })
    await Stat.deleteMany({ serieId: req.params.id })
    logAudit(req, 'series.delete', req.params.id, { title: serie.title })
    res.json({ message: 'Série supprimée' })
  } catch (err) { next(err) }
})

module.exports = router
