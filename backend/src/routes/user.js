const express       = require('express')
const { requireAuth } = require('../middleware/auth')
const Favorite      = require('../models/Favorite')
const WatchProgress = require('../models/WatchProgress')
const Download      = require('../models/Download')

const router = express.Router()
router.use(requireAuth)

// GET /api/user/favorites
router.get('/favorites', async (req, res, next) => {
  try {
    const docs = await Favorite.find({ userId: req.user._id }).lean()
    res.json(docs.map(d => d.serieId))
  } catch (err) { next(err) }
})

// POST /api/user/favorites
router.post('/favorites', async (req, res, next) => {
  try {
    const { serieId } = req.body
    await Favorite.findOneAndUpdate(
      { userId: req.user._id, serieId },
      { userId: req.user._id, serieId },
      { upsert: true, new: true }
    )
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

// DELETE /api/user/favorites/:serieId
router.delete('/favorites/:serieId', async (req, res, next) => {
  try {
    await Favorite.deleteOne({ userId: req.user._id, serieId: req.params.serieId })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

function buildProgressResponse(docs) {
  const progress = {}
  const history  = []

  for (const d of docs) {
    if (!progress[d.serieId])                      progress[d.serieId]                      = {}
    if (!progress[d.serieId][d.seasonSlug])        progress[d.serieId][d.seasonSlug]        = {}
    progress[d.serieId][d.seasonSlug][d.epNum] = d.pct

    if (d.watchedAt) {
      history.push({ serieId: d.serieId, seasonSlug: d.seasonSlug, epNum: d.epNum, at: d.watchedAt })
    }
  }

  history.sort((a, b) => new Date(b.at) - new Date(a.at))
  return { progress, history: history.slice(0, 50) }
}

// GET /api/user/progress
router.get('/progress', async (req, res, next) => {
  try {
    const docs = await WatchProgress.find({ userId: req.user._id }).lean()
    res.json(buildProgressResponse(docs))
  } catch (err) { next(err) }
})

// PUT /api/user/progress
router.put('/progress', async (req, res, next) => {
  try {
    const { serieId, seasonSlug, epNum, pct } = req.body
    await WatchProgress.findOneAndUpdate(
      { userId: req.user._id, serieId, seasonSlug, epNum },
      { pct, watchedAt: new Date() },
      { upsert: true, new: true }
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// DELETE /api/user/progress/history
router.delete('/progress/history', async (req, res, next) => {
  try {
    await WatchProgress.updateMany({ userId: req.user._id }, { watchedAt: null })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

function buildDownloadsResponse(docs) {
  const store   = {}
  const history = []

  for (const d of docs) {
    if (!store[d.serieId])                   store[d.serieId]                   = {}
    if (!store[d.serieId][d.seasonSlug])     store[d.serieId][d.seasonSlug]     = {}
    store[d.serieId][d.seasonSlug][d.epNum] = d.downloadedAt.getTime()

    history.push({
      serieId:   d.serieId,
      seasonSlug: d.seasonSlug,
      epNum:     d.epNum,
      at:        d.downloadedAt,
      quality:   d.quality,
      lang:      d.lang,
    })
  }

  history.sort((a, b) => new Date(b.at) - new Date(a.at))
  return { store, history: history.slice(0, 50) }
}

// GET /api/user/downloads
router.get('/downloads', async (req, res, next) => {
  try {
    const docs = await Download.find({ userId: req.user._id }).lean()
    const built = buildDownloadsResponse(docs.map(d => ({
      ...d,
      downloadedAt: d.downloadedAt instanceof Date ? d.downloadedAt : new Date(d.downloadedAt),
    })))
    res.json(built)
  } catch (err) { next(err) }
})

// POST /api/user/downloads
router.post('/downloads', async (req, res, next) => {
  try {
    const { serieId, seasonSlug, epNum, quality, lang } = req.body
    await Download.findOneAndUpdate(
      { userId: req.user._id, serieId, seasonSlug, epNum },
      { quality, lang, downloadedAt: new Date() },
      { upsert: true, new: true }
    )
    res.status(201).json({ ok: true })
  } catch (err) { next(err) }
})

// DELETE /api/user/downloads
router.delete('/downloads', async (req, res, next) => {
  try {
    await Download.deleteMany({ userId: req.user._id })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// GET /api/user/all
router.get('/all', async (req, res, next) => {
  try {
    const [favDocs, progressDocs, downloadDocs] = await Promise.all([
      Favorite.find({ userId: req.user._id }).lean(),
      WatchProgress.find({ userId: req.user._id }).lean(),
      Download.find({ userId: req.user._id }).lean(),
    ])

    const favorites = favDocs.map(d => d.serieId)
    const progress  = buildProgressResponse(progressDocs)
    const downloads = buildDownloadsResponse(downloadDocs.map(d => ({
      ...d,
      downloadedAt: d.downloadedAt instanceof Date ? d.downloadedAt : new Date(d.downloadedAt),
    })))

    res.json({ favorites, progress, downloads })
  } catch (err) { next(err) }
})

module.exports = router
