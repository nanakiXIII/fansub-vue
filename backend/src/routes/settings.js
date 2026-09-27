const express      = require('express')
const SiteSettings = require('../models/SiteSettings')
const Theme        = require('../models/Theme')
const { requireAuth } = require('../middleware/auth')
const { emit } = require('../socket')

const router = express.Router()

// Bascules sensibles : réservées aux admins complets (impact site-wide fort).
const ADMIN_ONLY_KEYS = ['betaEnabled', 'maintenanceEnabled', 'maintenanceAllowedRoles']
// Réglages généraux : accessibles aux grades avec la permission settings.manage.
const MANAGEABLE_KEYS = ['foundedYear', 'registrationEnabled', 'chatEnabled', 'defaultTheme', 'defaultLayout', 'enabledThemes', 'enabledLayouts', 'seasonalEffect', 'discordUrl', 'twitterUrl', 'githubUrl']

// Vide autorisé (revient au défaut compilé côté frontend) ou une URL http(s) valide
const URL_LINK_KEYS = ['discordUrl', 'twitterUrl', 'githubUrl']
function isValidLinkValue(v) {
  return v === '' || /^https?:\/\/\S+$/i.test(v)
}

// Doit rester synchronisé avec frontend/src/composables/useTheme.js
const VALID_THEMES  = ['braise', 'ametiste', 'abysses', 'sakura', 'air']
const VALID_LAYOUTS = ['default', 'glass', 'gundam', 'flux', 'stream']
const VALID_SEASONAL_EFFECTS = ['none', 'snow', 'sakura']

// Thèmes intégrés + thèmes personnalisés créés depuis l'admin (backend/src/models/Theme.js)
async function validThemeIds() {
  const custom = await Theme.find().select('slug').lean()
  return [...VALID_THEMES, ...custom.map(t => t.slug)]
}

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
    enabledThemes:           s.enabledThemes?.length  ? s.enabledThemes  : VALID_THEMES,
    enabledLayouts:          s.enabledLayouts?.length ? s.enabledLayouts : VALID_LAYOUTS,
    seasonalEffect:          s.seasonalEffect ?? 'none',
    discordUrl:              s.discordUrl ?? '',
    twitterUrl:              s.twitterUrl ?? '',
    githubUrl:               s.githubUrl  ?? '',
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
    const validThemes = await validThemeIds()
    if ('defaultTheme'  in req.body && !validThemes.includes(req.body.defaultTheme)) {
      return res.status(400).json({ error: 'Palette de couleurs invalide' })
    }
    if ('defaultLayout' in req.body && !VALID_LAYOUTS.includes(req.body.defaultLayout)) {
      return res.status(400).json({ error: 'Mise en page invalide' })
    }
    if ('enabledThemes' in req.body) {
      if (!Array.isArray(req.body.enabledThemes) || !req.body.enabledThemes.every(t => validThemes.includes(t))) {
        return res.status(400).json({ error: 'Liste de palettes invalide' })
      }
      if (!req.body.enabledThemes.length) {
        return res.status(400).json({ error: 'Au moins une palette doit rester activée' })
      }
    }
    if ('enabledLayouts' in req.body) {
      if (!Array.isArray(req.body.enabledLayouts) || !req.body.enabledLayouts.every(l => VALID_LAYOUTS.includes(l))) {
        return res.status(400).json({ error: 'Liste de mises en page invalide' })
      }
      if (!req.body.enabledLayouts.length) {
        return res.status(400).json({ error: 'Au moins une mise en page doit rester activée' })
      }
    }
    if ('seasonalEffect' in req.body && !VALID_SEASONAL_EFFECTS.includes(req.body.seasonalEffect)) {
      return res.status(400).json({ error: 'Effet saisonnier invalide' })
    }
    // Le thème/template par défaut du site doit toujours faire partie des options activées,
    // sinon les nouveaux visiteurs se retrouveraient sur une valeur qu'on vient de désactiver.
    const current = await SiteSettings.get()
    const nextEnabledThemes  = req.body.enabledThemes  ?? current.enabledThemes  ?? VALID_THEMES
    const nextEnabledLayouts = req.body.enabledLayouts ?? current.enabledLayouts ?? VALID_LAYOUTS
    const nextDefaultTheme   = req.body.defaultTheme   ?? current.defaultTheme
    const nextDefaultLayout  = req.body.defaultLayout  ?? current.defaultLayout
    if (!nextEnabledThemes.includes(nextDefaultTheme)) {
      return res.status(400).json({ error: 'Impossible de désactiver la palette par défaut du site' })
    }
    if (!nextEnabledLayouts.includes(nextDefaultLayout)) {
      return res.status(400).json({ error: 'Impossible de désactiver la mise en page par défaut du site' })
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
