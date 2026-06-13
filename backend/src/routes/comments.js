const express = require('express')
const { body, validationResult } = require('express-validator')
const Comment = require('../models/Comment')
const { requireAuth, requirePermission } = require('../middleware/auth')
const { logAudit } = require('../services/audit')

const router = express.Router()

// GET /api/comments?articleId=&serieId=&epNum=&userId=&page=1&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { articleId, serieId, epNum, userId, page = 1, limit = 20 } = req.query
    const filter = {}

    if (articleId) filter.articleId = articleId
    if (serieId)   filter.serieId   = serieId
    if (epNum !== undefined) filter.epNum = epNum === 'null' ? null : Number(epNum)
    if (userId)    filter.userId    = userId

    // Vérifie si le requêteur est admin via le token JWT (optionnel)
    let isAdmin = false
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      try {
        const jwt  = require('jsonwebtoken')
        const User = require('../models/User')
        const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
        const user = await User.findById(payload.id).select('isAdmin')
        isAdmin = !!user?.isAdmin
      } catch {}
    }

    // Admin → tous les statuts ; userId fourni → tous les statuts pour cet utilisateur ; sinon → approuvés seulement
    if (!isAdmin && !userId) {
      filter.status = 'approved'
    }

    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * limitNum

    const [comments, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Comment.countDocuments(filter),
    ])

    res.json({ comments, total, page: pageNum, pages: Math.ceil(total / limitNum) })
  } catch (err) { next(err) }
})

// POST /api/comments
router.post('/',
  body('userId').notEmpty(),
  body('username').notEmpty(),
  body('text').trim().isLength({ min: 1, max: 2000 }),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const { articleId, serieId, epNum, userId, username, isLocal, text } = req.body
      const comment = await Comment.create({
        articleId: articleId ?? null,
        serieId:   serieId   ?? null,
        epNum:     epNum     ?? null,
        userId,
        username,
        isLocal: !!isLocal,
        text,
        status: isLocal ? 'pending' : 'approved',
      })
      res.status(201).json(comment)
    } catch (err) { next(err) }
  }
)

// PATCH /api/comments/:id/approve — admin
router.patch('/:id/approve', requireAuth, requirePermission('comments.moderate'), async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' })
    logAudit(req, 'comment.approve', req.params.id, { username: comment.username })
    res.json(comment)
  } catch (err) { next(err) }
})

// PATCH /api/comments/:id/reject — admin
router.patch('/:id/reject', requireAuth, requirePermission('comments.moderate'), async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true })
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' })
    logAudit(req, 'comment.reject', req.params.id, { username: comment.username })
    res.json(comment)
  } catch (err) { next(err) }
})

// PATCH /api/comments/:id/disapprove — admin (repasse en pending)
router.patch('/:id/disapprove', requireAuth, requirePermission('comments.moderate'), async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: 'pending' }, { new: true })
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' })
    logAudit(req, 'comment.disapprove', req.params.id, { username: comment.username })
    res.json(comment)
  } catch (err) { next(err) }
})

// DELETE /api/comments/:id — admin
router.delete('/:id', requireAuth, requirePermission('comments.moderate'), async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id)
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable' })
    logAudit(req, 'comment.delete', req.params.id, { username: comment.username, text: comment.text?.slice(0, 80) })
    res.json({ message: 'Commentaire supprimé' })
  } catch (err) { next(err) }
})

module.exports = router
