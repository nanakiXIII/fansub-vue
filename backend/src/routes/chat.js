const express     = require('express')
const ChatMessage = require('../models/ChatMessage')

const router = express.Router()

// GET /api/chat — 60 derniers messages du salon global
router.get('/', async (req, res, next) => {
  try {
    const messages = await ChatMessage
      .find({ room: 'global' })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean()
    res.json(messages.reverse())
  } catch (err) { next(err) }
})

module.exports = router
