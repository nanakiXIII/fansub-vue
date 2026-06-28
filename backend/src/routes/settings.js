const express      = require('express')
const SiteSettings = require('../models/SiteSettings')
const { requireAuth } = require('../middleware/auth')
const { emit } = require('../socket')

const router = express.Router()

// Bascules sensibles : réservées aux admins complets (impact site-wide fort).
const ADMIN_ONLY_KEYS = ['betaEnabled', 'maintenanceEnabled', 'maintenanceAllowedRoles']
// Réglages généraux : accessibles aux grades avec la permission settings.manage.
const MANAGEABLE_KEYS = ['foundedYear', 'registrationEnabled', 'chatEnabled', 'defaultTheme', 'defaultLayout']

// Doit rester synchronisé avec frontend/src/composables/useTheme.js
const VALID_THEMES  = ['braise', 'ametiste', 'abysses', 'sakura', 'air']
const VALID_LAYOUTS = ['default', 'glass', 'gundam', 'flux']

function toPublic(s) {
  return {
    betaEnabled:             s.betaEnabled,
    maintenanceEnabled:      s.maintenanceEnabled,
    maintenanceAllowedRoles: s.maintenanceAllowedRoles ?? [],
    foundedYear:             s.foundedYear ?? 2019,
    registrationEnabled:     s.registrationEnabled ?? true,
    chatEnabled:             s.chatEnabled ?? true,
    defaultTheme:            s.defaultTheme  ?? 'braise',
    defaultLayout:           s.defaultLayout ?? 'default',
  }
}

// GET /api/settings — public (frontend en a besoin avant auth)
router.get('/', async (req, res, next) => {
  try {
    res.json(toPublic(await SiteSettings.get()))
  } catch (err) { next(err) }
})

// PATCH /api/settings — admin (bascules sensibles) ou grade avec settings.manage (réglages généraux)
router.patch('/', requireAuth, async (req, res, next) => {
  try {
    const keys = Object.keys(req.body).filter(k => ADMIN_ONLY_KEYS.includes(k) || MANAGEABLE_KEYS.includes(k))
    const needsAdmin = keys.some(k => ADMIN_ONLY_KEYS.includes(k))
    const perms   = req.userPermissions ?? []
    const allowed = req.user.isAdmin || (!needsAdmin && perms.includes('settings.manage'))
    if (!allowed) {
      return res.status(403).json({ error: needsAdmin ? 'Accès réservé aux admins' : 'Permission insuffisante' })
    }
    if ('defaultTheme'  in req.body && !VALID_THEMES.includes(req.body.defaultTheme)) {
      return res.status(400).json({ error: 'Palette de couleurs invalide' })
    }
    if ('defaultLayout' in req.body && !VALID_LAYOUTS.includes(req.body.defaultLayout)) {
      return res.status(400).json({ error: 'Mise en page invalide' })
    }

    const data = {}
    for (const key of keys) data[key] = req.body[key]
    const s = await SiteSettings.patch(data)
    const payload = toPublic(s)
    emit('settings:update', payload)
    res.json(payload)
  } catch (err) { next(err) }
})

module.exports = router
