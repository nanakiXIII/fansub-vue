const express         = require('express')
const Achievement     = require('../models/Achievement')
const UserAchievement = require('../models/UserAchievement')
const User            = require('../models/User')
const Download        = require('../models/Download')
const Comment         = require('../models/Comment')
const WatchProgress   = require('../models/WatchProgress')
const Favorite        = require('../models/Favorite')
const { requireAuth, requireAdmin, requirePermission } = require('../middleware/auth')
const { checkForUser, invalidateCache } = require('../services/achievementChecker')
const { logAudit } = require('../services/audit')

const router = express.Router()

// GET /api/achievements — liste publique (toutes les actives)
router.get('/', async (_req, res, next) => {
  try {
    const list = await Achievement.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean()
    res.json(list)
  } catch (err) { next(err) }
})

// GET /api/achievements/all — admin : toutes (actives + inactives)
router.get('/all', requireAuth, requirePermission('achievements.manage'), async (_req, res, next) => {
  try {
    const list = await Achievement.find().sort({ order: 1, createdAt: 1 }).lean()
    res.json(list)
  } catch (err) { next(err) }
})

// GET /api/achievements/my — succès débloqués par l'utilisateur connecté
router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const entries = await UserAchievement.find({ userId: req.user._id })
      .populate('achievementId')
      .sort({ unlockedAt: -1 })
      .lean()
    const result = entries
      .filter(e => e.achievementId)
      .map(e => ({ ...e.achievementId, unlockedAt: e.unlockedAt }))
    res.json(result)
  } catch (err) { next(err) }
})

// GET /api/achievements/stats — stats actuelles du user pour chaque type de condition
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id
    const [downloads, comments, watched, favorites, user] = await Promise.all([
      Download.countDocuments({ userId }),
      Comment.countDocuments({ userId, status: { $ne: 'rejected' } }),
      WatchProgress.countDocuments({ userId, pct: { $gte: 90 } }),
      Favorite.countDocuments({ userId }),
      User.findById(userId).select('createdAt').lean(),
    ])
    const days = user ? Math.floor((Date.now() - user.createdAt.getTime()) / 86400000) : 0
    res.json({ downloads, comments, watched, favorites, days })
  } catch (err) { next(err) }
})

// POST /api/achievements/check — vérification manuelle (appelé par le front)
router.post('/check', requireAuth, async (req, res, next) => {
  try {
    const newOnes = await checkForUser(req.user._id)
    res.json({ newlyUnlocked: newOnes })
  } catch (err) { next(err) }
})

// PATCH /api/achievements/active — définir le titre actif
router.patch('/active', requireAuth, async (req, res, next) => {
  try {
    const { achievementId } = req.body
    if (achievementId) {
      // Vérifier que l'utilisateur a bien débloqué ce succès
      const ua = await UserAchievement.findOne({ userId: req.user._id, achievementId })
      if (!ua) return res.status(403).json({ error: 'Succès non débloqué' })
      const ach = await Achievement.findById(achievementId).lean()
      if (!ach?.rewardTitle) return res.status(400).json({ error: 'Ce succès n\'a pas de titre de récompense' })
    }
    await User.findByIdAndUpdate(req.user._id, { activeTitleId: achievementId ?? null })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── Admin CRUD ────────────────────────────────────────────────────

// POST /api/achievements
router.post('/', requireAuth, requirePermission('achievements.manage'), async (req, res, next) => {
  try {
    const count = await Achievement.countDocuments()
    const ach   = await Achievement.create({ ...req.body, order: count })
    invalidateCache()
    logAudit(req, 'achievement.create', ach._id, { title: ach.title })
    res.status(201).json(ach)
  } catch (err) { next(err) }
})

// PUT /api/achievements/:id
router.put('/:id', requireAuth, requirePermission('achievements.manage'), async (req, res, next) => {
  try {
    const ach = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!ach) return res.status(404).json({ error: 'Succès introuvable' })
    invalidateCache()
    logAudit(req, 'achievement.update', req.params.id, { title: ach.title })
    res.json(ach)
  } catch (err) { next(err) }
})

// DELETE /api/achievements/:id
router.delete('/:id', requireAuth, requirePermission('achievements.manage'), async (req, res, next) => {
  try {
    const ach = await Achievement.findByIdAndDelete(req.params.id)
    if (!ach) return res.status(404).json({ error: 'Succès introuvable' })
    await User.updateMany({ activeTitleId: req.params.id }, { $set: { activeTitleId: null } })
    await UserAchievement.deleteMany({ achievementId: req.params.id })
    invalidateCache()
    logAudit(req, 'achievement.delete', req.params.id, { title: ach.title })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
