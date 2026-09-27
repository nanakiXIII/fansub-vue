const express      = require('express')
const { body, validationResult } = require('express-validator')
const Theme        = require('../models/Theme')
const SiteSettings = require('../models/SiteSettings')
const { requireAuth, requirePermission } = require('../middleware/auth')
const { emit } = require('../socket')
const { logAudit } = require('../services/audit')

const router = express.Router()

// Identifiants réservés aux 5 thèmes intégrés (codés en dur côté frontend, useTheme.js)
const RESERVED_SLUGS = ['braise', 'ametiste', 'abysses', 'sakura', 'air']

// "R G B" (ex: "244 117 33"), même format que les variables CSS --color-*
const RGB_RE = /^\d{1,3} \d{1,3} \d{1,3}$/
const COLOR_KEYS = ['bg0', 'bg1', 'bg2', 'bg3', 'bg4', 'orange', 'orangeHover', 'ink1', 'ink2', 'ink3']

function validateColors(colors) {
  if (!colors || typeof colors !== 'object') return 'Couleurs manquantes'
  for (const key of COLOR_KEYS) {
    if (!RGB_RE.test(colors[key] ?? '')) return `Couleur "${key}" invalide`
  }
  return null
}

// GET /api/themes — public (le site en a besoin avant même la connexion)
router.get('/', async (_req, res, next) => {
  try {
    const themes = await Theme.find().sort({ createdAt: 1 }).lean()
    res.json(themes.map(t => ({ slug: t.slug, label: t.label, colors: t.colors })))
  } catch (err) { next(err) }
})

// POST /api/themes
router.post('/',
  requireAuth, requirePermission('settings.manage'),
  body('slug').trim().toLowerCase().matches(/^[a-z0-9-]{2,30}$/).withMessage('Identifiant : 2 à 30 caractères, lettres minuscules/chiffres/tirets'),
  body('label').trim().isLength({ min: 2, max: 30 }).withMessage('Nom : 2 à 30 caractères'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      if (RESERVED_SLUGS.includes(req.body.slug)) {
        return res.status(409).json({ error: 'Cet identifiant est réservé à un thème intégré' })
      }
      const colorError = validateColors(req.body.colors)
      if (colorError) return res.status(400).json({ error: colorError })

      const theme = await Theme.create({ slug: req.body.slug, label: req.body.label, colors: req.body.colors })
      emit('themes:update', {})
      logAudit(req, 'theme.create', theme.slug, { label: theme.label })
      res.status(201).json({ slug: theme.slug, label: theme.label, colors: theme.colors })
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: 'Cet identifiant de thème est déjà utilisé' })
      next(err)
    }
  }
)

// PUT /api/themes/:slug
router.put('/:slug',
  requireAuth, requirePermission('settings.manage'),
  body('label').optional().trim().isLength({ min: 2, max: 30 }).withMessage('Nom : 2 à 30 caractères'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const theme = await Theme.findOne({ slug: req.params.slug })
      if (!theme) return res.status(404).json({ error: 'Thème introuvable' })

      if (req.body.colors !== undefined) {
        const colorError = validateColors(req.body.colors)
        if (colorError) return res.status(400).json({ error: colorError })
        theme.colors = req.body.colors
      }
      if (req.body.label !== undefined) theme.label = req.body.label
      await theme.save()
      emit('themes:update', {})
      logAudit(req, 'theme.update', theme.slug, { label: theme.label })
      res.json({ slug: theme.slug, label: theme.label, colors: theme.colors })
    } catch (err) { next(err) }
  }
)

// DELETE /api/themes/:slug
router.delete('/:slug', requireAuth, requirePermission('settings.manage'), async (req, res, next) => {
  try {
    const theme = await Theme.findOneAndDelete({ slug: req.params.slug })
    if (!theme) return res.status(404).json({ error: 'Thème introuvable' })

    // Retire ce thème des réglages du site s'il y était référencé, pour ne jamais
    // laisser le site pointer vers un thème qui n'existe plus.
    const settings = await SiteSettings.get()
    const patch = {}
    if (settings.enabledThemes?.includes(theme.slug)) {
      patch.enabledThemes = settings.enabledThemes.filter(s => s !== theme.slug)
    }
    if (settings.defaultTheme === theme.slug) {
      patch.defaultTheme = 'braise'
    }
    if (Object.keys(patch).length) {
      const updated = await SiteSettings.patch(patch)
      emit('settings:update', {
        betaEnabled: updated.betaEnabled, maintenanceEnabled: updated.maintenanceEnabled,
        maintenanceAllowedRoles: updated.maintenanceAllowedRoles ?? [], foundedYear: updated.foundedYear ?? 2019,
        registrationEnabled: updated.registrationEnabled ?? true, chatEnabled: updated.chatEnabled ?? true,
        defaultTheme: updated.defaultTheme ?? 'braise', defaultLayout: updated.defaultLayout ?? 'default',
        enabledThemes: updated.enabledThemes ?? [], enabledLayouts: updated.enabledLayouts ?? [],
        seasonalEffect: updated.seasonalEffect ?? 'none',
      })
    }
    emit('themes:update', {})
    logAudit(req, 'theme.delete', theme.slug, { label: theme.label })
    res.json({ ok: true })
  } catch (err) { next(err) }
})

module.exports = router
