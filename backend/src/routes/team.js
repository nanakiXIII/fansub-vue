const express = require('express')
const { body, validationResult } = require('express-validator')
const Team    = require('../models/Team')
const User    = require('../models/User')
const { requireAuth, requireAdmin, requirePermission } = require('../middleware/auth')

const router = express.Router()

// GET /api/team/available-users — utilisateurs pas encore dans l'équipe (admin)
router.get('/available-users', requireAuth, requirePermission('team.manage'), async (_req, res, next) => {
  try {
    const teamMembers = await Team.find({ active: true, userId: { $ne: null } }, 'userId').lean()
    const usedIds = teamMembers.map(m => m.userId.toString())
    const users = await User.find({}, '_id username avatar isAdmin').lean()
    res.json(users.filter(u => !usedIds.includes(u._id.toString())))
  } catch (err) { next(err) }
})

// GET /api/team?department=
router.get('/', async (req, res, next) => {
  try {
    const { department } = req.query
    const filter = { active: true }
    if (department) filter.department = department
    const members = await Team.find(filter).sort({ createdAt: 1 })
    res.json(members)
  } catch (err) { next(err) }
})

// POST /api/team — admin uniquement
router.post('/',
  requireAuth, requirePermission('team.manage'),
  body('slug').notEmpty(),
  body('name').notEmpty(),
  body('department').notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const member = await Team.create(req.body)
      res.status(201).json(member)
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: 'Slug déjà utilisé' })
      next(err)
    }
  }
)

// PUT /api/team/:id — admin uniquement
router.put('/:id', requireAuth, requirePermission('team.manage'), async (req, res, next) => {
  try {
    const member = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!member) return res.status(404).json({ error: 'Membre introuvable' })
    res.json(member)
  } catch (err) { next(err) }
})

// DELETE /api/team/:id — soft delete (active: false)
router.delete('/:id', requireAuth, requirePermission('team.manage'), async (req, res, next) => {
  try {
    const member = await Team.findByIdAndUpdate(req.params.id, { active: false }, { new: true })
    if (!member) return res.status(404).json({ error: 'Membre introuvable' })
    res.json({ message: 'Membre retiré de l\'équipe' })
  } catch (err) { next(err) }
})

module.exports = router
