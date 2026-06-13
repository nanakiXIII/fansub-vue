const express = require('express')
const Follow  = require('../models/Follow')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// GET /api/follows — liste des serieId suivis par l'utilisateur
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const follows = await Follow.find({ userId: req.user._id.toString() }).select('serieId').lean()
    res.json(follows.map(f => f.serieId))
  } catch (err) { next(err) }
})

// POST /api/follows/:serieId — toggle suivi
router.post('/:serieId', requireAuth, async (req, res, next) => {
  try {
    const userId  = req.user._id.toString()
    const { serieId } = req.params
    const existing = await Follow.findOne({ userId, serieId })
    if (existing) {
      await existing.deleteOne()
      res.json({ following: false })
    } else {
      await Follow.create({ userId, serieId })
      res.json({ following: true })
    }
  } catch (err) { next(err) }
})

module.exports = router
