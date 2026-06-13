const express = require('express')
const Role    = require('../models/Role')
const User    = require('../models/User')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/roles — public
router.get('/', async (_req, res, next) => {
  try {
    res.json(await Role.find().sort({ level: 1 }))
  } catch (err) { next(err) }
})

// POST /api/roles — admin
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const role = await Role.create(req.body)
    res.status(201).json(role)
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Ce nom de grade est déjà utilisé' })
    next(err)
  }
})

// PUT /api/roles/:id — admin
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!role) return res.status(404).json({ error: 'Grade introuvable' })
    res.json(role)
  } catch (err) { next(err) }
})

// DELETE /api/roles/:id — admin
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id)
    if (!role) return res.status(404).json({ error: 'Grade introuvable' })
    await User.updateMany({ role: role.name }, { $set: { role: null } })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
