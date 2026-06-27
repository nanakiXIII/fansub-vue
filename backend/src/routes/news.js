const express = require('express')
const { body, validationResult } = require('express-validator')
const News    = require('../models/News')
const { emit } = require('../socket')
const { notifyNewsPublished } = require('../services/discordNotify')
const { requireAuth, requirePermission, optionalAuth } = require('../middleware/auth')

const router = express.Router()

function canPreview(req) {
  const p = req.userPermissions ?? []
  return p.includes('*') || p.includes('content.preview')
}

// GET /api/news — publié uniquement pour les visiteurs, tout pour les admins
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, serieId } = req.query
    const filter = {}
    if (category) filter.category = category
    if (serieId)  filter.serieId  = serieId
    if (!canPreview(req)) filter.published = true
    const news = await News.find(filter).sort({ createdAt: -1 })
    res.json(news)
  } catch (err) { next(err) }
})

// GET /api/news/:id — brouillons accessibles aux admins uniquement
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const article = await News.findById(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article introuvable' })
    if (!article.published && !canPreview(req))
      return res.status(404).json({ error: 'Article introuvable' })
    if (!canPreview(req)) News.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec()
    res.json(article)
  } catch (err) { next(err) }
})

// POST /api/news
router.post('/',
  requireAuth, requirePermission('news.create'),
  body('title').notEmpty(),
  body('category').notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const article = await News.create({ ...req.body, author: req.user.username })
      if (article.published) {
        emit('new:news', article.toObject())
        notifyNewsPublished(article).catch(() => {})
      }
      res.status(201).json(article)
    } catch (err) { next(err) }
  }
)

// PUT /api/news/:id
router.put('/:id', requireAuth, requirePermission('news.edit'), async (req, res, next) => {
  try {
    const prev    = await News.findById(req.params.id).select('published')
    const article = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!article) return res.status(404).json({ error: 'Article introuvable' })
    // Émettre/notifier uniquement si l'article vient d'être publié
    if (article.published && !prev?.published) {
      emit('new:news', article.toObject())
      notifyNewsPublished(article).catch(() => {})
    }
    res.json(article)
  } catch (err) { next(err) }
})

// DELETE /api/news/:id
router.delete('/:id', requireAuth, requirePermission('news.delete'), async (req, res, next) => {
  try {
    const article = await News.findByIdAndDelete(req.params.id)
    if (!article) return res.status(404).json({ error: 'Article introuvable' })
    res.json({ message: 'Article supprimé' })
  } catch (err) { next(err) }
})

module.exports = router
