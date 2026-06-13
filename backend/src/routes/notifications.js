const express      = require('express')
const Notification = require('../models/Notification')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/notifications — 50 dernières pour l'utilisateur connecté
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const notifs = await Notification
      .find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    res.json(notifs)
  } catch (err) { next(err) }
})

// PATCH /api/notifications/read-all — tout marquer comme lu
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id.toString(), read: false },
      { $set: { read: true } }
    )
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// PATCH /api/notifications/:id — marquer une notification comme lue
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id.toString() },
      { $set: { read: true } },
      { new: true }
    )
    if (!notif) return res.status(404).json({ error: 'Introuvable' })
    res.json(notif)
  } catch (err) { next(err) }
})

// DELETE /api/notifications/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id.toString() })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
