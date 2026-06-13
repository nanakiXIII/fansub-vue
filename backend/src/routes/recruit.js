const express = require('express')
const { body, validationResult } = require('express-validator')
const Recruit = require('../models/Recruit')
const { requireAuth, requirePermission } = require('../middleware/auth')

const router = express.Router()

// GET /api/recruit
router.get('/', async (req, res, next) => {
  try {
    const roles = await Recruit.find().sort({ order: 1 }).lean()
    res.json(roles)
  } catch (err) { next(err) }
})

// POST /api/recruit — admin uniquement
router.post('/',
  requireAuth, requirePermission('recruit.manage'),
  body('slug').notEmpty(),
  body('title').notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const role = await Recruit.create(req.body)
      res.status(201).json(role)
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: 'Slug déjà utilisé' })
      next(err)
    }
  }
)

// PUT /api/recruit/:id — admin uniquement
router.put('/:id', requireAuth, requirePermission('recruit.manage'), async (req, res, next) => {
  try {
    const role = await Recruit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!role) return res.status(404).json({ error: 'Poste introuvable' })
    res.json(role)
  } catch (err) { next(err) }
})

// DELETE /api/recruit/:id — admin uniquement
router.delete('/:id', requireAuth, requirePermission('recruit.manage'), async (req, res, next) => {
  try {
    const role = await Recruit.findByIdAndDelete(req.params.id)
    if (!role) return res.status(404).json({ error: 'Poste introuvable' })
    res.json({ message: 'Poste supprimé' })
  } catch (err) { next(err) }
})

module.exports = router
