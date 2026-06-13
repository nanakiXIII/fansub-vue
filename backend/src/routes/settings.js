const express      = require('express')
const SiteSettings = require('../models/SiteSettings')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { emit } = require('../socket')

const router = express.Router()

function toPublic(s) {
  return {
    betaEnabled:             s.betaEnabled,
    maintenanceEnabled:      s.maintenanceEnabled,
    maintenanceAllowedRoles: s.maintenanceAllowedRoles ?? [],
  }
}

// GET /api/settings — public (frontend en a besoin avant auth)
router.get('/', async (req, res, next) => {
  try {
    res.json(toPublic(await SiteSettings.get()))
  } catch (err) { next(err) }
})

// PATCH /api/settings — admin
router.patch('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const allowed = ['betaEnabled', 'maintenanceEnabled', 'maintenanceAllowedRoles']
    const data = {}
    for (const key of allowed) {
      if (key in req.body) data[key] = req.body[key]
    }
    const s = await SiteSettings.patch(data)
    const payload = toPublic(s)
    emit('settings:update', payload)
    res.json(payload)
  } catch (err) { next(err) }
})

module.exports = router
