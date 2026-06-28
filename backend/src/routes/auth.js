const express  = require('express')
const jwt      = require('jsonwebtoken')
const multer   = require('multer')
const path     = require('path')
const crypto   = require('crypto')
const fs       = require('fs')
const { body, validationResult } = require('express-validator')
const User        = require('../models/User')
const Role        = require('../models/Role')
const SiteSettings = require('../models/SiteSettings')
const Achievement = require('../models/Achievement')
const { checkForUser } = require('../services/achievementChecker')
const Favorite    = require('../models/Favorite')
const WatchProgress = require('../models/WatchProgress')
const Download    = require('../models/Download')
const { requireAuth, requireAdmin, requirePermission } = require('../middleware/auth')
const { authLimiter, sensitiveLimiter } = require('../middleware/rateLimit')
const { passport, findOrCreate } = require('../passport')
const { logAudit } = require('../services/audit')
const { sendMail } = require('../services/mailer')

const uploadsDir = path.join(__dirname, '../../uploads/avatars')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
      cb(null, `${req.user._id}-${crypto.randomBytes(6).toString('hex')}${ext}`)
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Format non supporté. PNG, JPG, GIF ou WebP uniquement.'))
  },
})

const router = express.Router()

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  })
}

function signRefreshToken(id) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
    expiresIn: '7d',
  })
}

async function resolvePermissions(user) {
  if (user.isAdmin) return ['*']
  if (!user.role) return []
  const role = await Role.findOne({ name: user.role }).lean()
  return role?.permissions ?? []
}

async function sanitizeUser(user) {
  const permissions = await resolvePermissions(user)
  let roleLabel = null
  let roleColor = null
  if (user.role) {
    const roleDoc = await Role.findOne({ name: user.role }).lean()
    roleLabel = roleDoc?.label ?? null
    roleColor = roleDoc?.color ?? null
  }
  let activeTitle = null
  if (user.activeTitleId) {
    const ach = await Achievement.findById(user.activeTitleId).select('rewardTitle color').lean()
    if (ach?.rewardTitle) activeTitle = { label: ach.rewardTitle, color: ach.color ?? null }
  }
  return { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin, emailVerified: user.emailVerified, avatar: user.avatar, role: user.role ?? null, roleLabel, roleColor, activeTitle, permissions, socials: user.socials ?? {}, favoriteMedia: user.favoriteMedia ?? [] }
}

// Tokens (vérification email / reset mot de passe) : on ne stocke jamais la valeur brute,
// seulement son hash — comme un mot de passe, en cas de fuite de la base ça ne suffit pas
// à réutiliser le lien.
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function sendVerificationEmail(user, rawToken) {
  const url = `${FRONTEND_URL}/verifier-email?token=${rawToken}`
  await sendMail({
    to: user.email,
    subject: 'Confirme ton adresse e-mail',
    text: `Bienvenue ! Clique sur ce lien pour confirmer ton adresse e-mail : ${url}\nCe lien expire dans 24h.`,
    html: `<p>Bienvenue !</p><p>Clique sur ce lien pour confirmer ton adresse e-mail : <a href="${url}">${url}</a></p><p>Ce lien expire dans 24h.</p>`,
  })
}

const SOCIAL_KEYS = ['discord', 'psn', 'xbox', 'switch', 'steam', 'myanimelist']

function sanitizeFavoriteMedia(list) {
  if (!Array.isArray(list)) return undefined
  return list
    .filter(m => m && Number.isFinite(Number(m.tmdbId)) && ['movie', 'tv'].includes(m.mediaType) && m.title)
    .slice(0, 6)
    .map(m => ({
      tmdbId:     Number(m.tmdbId),
      mediaType:  m.mediaType,
      title:      String(m.title).slice(0, 200),
      posterPath: String(m.posterPath ?? '').slice(0, 300),
      year:       String(m.year ?? '').slice(0, 8),
    }))
}

// POST /api/auth/register
router.post('/register',
  authLimiter,
  body('username').trim().isLength({ min: 3, max: 20 }).withMessage('Pseudo : 3–20 caractères'),
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const settings = await SiteSettings.get()
      if (settings.registrationEnabled === false) {
        return res.status(403).json({ error: 'Les inscriptions sont actuellement fermées.' })
      }
      const { username, email, password } = req.body
      const verifyToken = crypto.randomBytes(32).toString('hex')
      const user = await User.create({
        username, email, password,
        emailVerified:      false,
        emailVerifyToken:   hashToken(verifyToken),
        emailVerifyExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      sendVerificationEmail(user, verifyToken).catch(err => console.error('[mailer] vérification', err.message))
      res.status(201).json({ token: signToken(user._id), refreshToken: signRefreshToken(user._id), user: await sanitizeUser(user) })
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern ?? {})[0]
        if (field === 'username') return res.status(409).json({ error: 'Ce pseudo est déjà pris.' })
        if (field === 'email')    return res.status(409).json({ error: 'Cette adresse e-mail est déjà utilisée.' })
        return res.status(409).json({ error: 'Compte déjà existant.' })
      }
      next(err)
    }
  }
)

// POST /api/auth/resend-verification
router.post('/resend-verification', requireAuth, sensitiveLimiter, async (req, res, next) => {
  try {
    if (req.user.emailVerified) return res.status(400).json({ error: 'Adresse e-mail déjà vérifiée.' })
    if (!req.user.email) return res.status(400).json({ error: 'Aucune adresse e-mail associée à ce compte.' })
    const verifyToken = crypto.randomBytes(32).toString('hex')
    req.user.emailVerifyToken   = hashToken(verifyToken)
    req.user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await req.user.save()
    await sendVerificationEmail(req.user, verifyToken)
    res.json({ message: 'E-mail de vérification renvoyé.' })
  } catch (err) { next(err) }
})

// POST /api/auth/verify-email
router.post('/verify-email', sensitiveLimiter, body('token').notEmpty(), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const user = await User.findOne({
      emailVerifyToken:   hashToken(req.body.token),
      emailVerifyExpires: { $gt: new Date() },
    })
    if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré.' })
    user.emailVerified      = true
    user.emailVerifyToken   = null
    user.emailVerifyExpires = null
    await user.save()
    res.json({ message: 'Adresse e-mail confirmée.' })
  } catch (err) { next(err) }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', sensitiveLimiter, body('email').isEmail().normalizeEmail(), async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex')
      user.passwordResetToken   = hashToken(resetToken)
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
      await user.save()
      const url = `${FRONTEND_URL}/reinitialiser-mot-de-passe?token=${resetToken}`
      sendMail({
        to:      user.email,
        subject: 'Réinitialisation de ton mot de passe',
        text:    `Clique sur ce lien pour choisir un nouveau mot de passe : ${url}\nCe lien expire dans 1h. Si tu n'es pas à l'origine de cette demande, ignore cet e-mail.`,
        html:    `<p>Clique sur ce lien pour choisir un nouveau mot de passe : <a href="${url}">${url}</a></p><p>Ce lien expire dans 1h. Si tu n'es pas à l'origine de cette demande, ignore cet e-mail.</p>`,
      }).catch(err => console.error('[mailer] reset', err.message))
    }
    // Réponse identique que l'adresse existe ou non, pour ne pas permettre d'énumérer les comptes.
    res.json({ message: 'Si cette adresse existe, un e-mail de réinitialisation a été envoyé.' })
  } catch (err) { next(err) }
})

// POST /api/auth/reset-password
router.post('/reset-password',
  sensitiveLimiter,
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const user = await User.findOne({
        passwordResetToken:   hashToken(req.body.token),
        passwordResetExpires: { $gt: new Date() },
      })
      if (!user) return res.status(400).json({ error: 'Lien invalide ou expiré.' })
      user.password             = req.body.password
      user.passwordResetToken   = null
      user.passwordResetExpires = null
      await user.save()
      res.json({ token: signToken(user._id), refreshToken: signRefreshToken(user._id), user: await sanitizeUser(user) })
    } catch (err) { next(err) }
  }
)

// POST /api/auth/login
router.post('/login',
  authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const { email, password } = req.body
      const user = await User.findOne({ email })
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
      }
      res.json({ token: signToken(user._id), refreshToken: signRefreshToken(user._id), user: await sanitizeUser(user) })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token manquant' })
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
    const payload = jwt.verify(refreshToken, secret)
    const token = signToken(payload.id)
    res.json({ token })
  } catch {
    res.status(401).json({ error: 'Refresh token invalide ou expiré' })
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  // Vérification succès fire-and-forget (ne bloque pas la réponse)
  if (req.user._id) checkForUser(req.user._id).catch(() => {})
  res.json(await sanitizeUser(req.user))
})

// POST /api/auth/claim-admin — token usage unique défini dans ADMIN_CLAIM_TOKEN.
// Le fichier claimFlagPath agit comme verrou : sa simple présence invalide le token
// pour toute tentative suivante, même après redémarrage du serveur.
const claimFlagPath = path.join(__dirname, '../../data/admin-claim.used')
router.post('/claim-admin',
  requireAuth,
  sensitiveLimiter,
  body('token').notEmpty().withMessage('Token requis'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const expected = process.env.ADMIN_CLAIM_TOKEN
      if (!expected) return res.status(403).json({ error: 'Fonctionnalité désactivée.' })

      const given = Buffer.from(String(req.body.token))
      const ref   = Buffer.from(expected)
      const valid = given.length === ref.length && crypto.timingSafeEqual(given, ref)
      if (!valid) return res.status(403).json({ error: 'Token invalide.' })

      try {
        fs.mkdirSync(path.dirname(claimFlagPath), { recursive: true })
        fs.writeFileSync(claimFlagPath, JSON.stringify({ usedAt: new Date(), userId: req.user._id, username: req.user.username }), { flag: 'wx' })
      } catch (e) {
        if (e.code === 'EEXIST') return res.status(410).json({ error: 'Ce token a déjà été utilisé.' })
        throw e
      }

      req.user.isAdmin = true
      await req.user.save()
      logAudit(req, 'user.admin_claim', req.user._id, { username: req.user.username })
      res.json({ user: await sanitizeUser(req.user) })
    } catch (err) { next(err) }
  }
)

// PATCH /api/auth/me
router.patch('/me',
  requireAuth,
  body('email').optional().isEmail().normalizeEmail().withMessage('Email invalide'),
  body('avatar').optional({ nullable: true }).isString(),
  body('newPassword').optional().isLength({ min: 8 }).withMessage('Nouveau mot de passe : 8 caractères minimum'),
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    try {
      const user = await User.findById(req.user._id)
      if (req.body.newPassword) {
        if (!req.body.currentPassword) {
          return res.status(400).json({ error: 'Mot de passe actuel requis.' })
        }
        const valid = await user.comparePassword(req.body.currentPassword)
        if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect.' })
        user.password = req.body.newPassword
      }
      if (req.body.email  !== undefined) user.email  = req.body.email
      if (req.body.avatar !== undefined) user.avatar = req.body.avatar
      if (req.body.socials !== undefined && typeof req.body.socials === 'object') {
        const socials = user.socials?.toObject?.() ?? user.socials ?? {}
        for (const key of SOCIAL_KEYS) {
          if (req.body.socials[key] !== undefined) {
            socials[key] = String(req.body.socials[key] ?? '').trim().slice(0, 50)
          }
        }
        user.socials = socials
      }
      if (req.body.favoriteMedia !== undefined) {
        const cleaned = sanitizeFavoriteMedia(req.body.favoriteMedia)
        if (cleaned !== undefined) user.favoriteMedia = cleaned
      }
      await user.save()
      res.json(await sanitizeUser(user))
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: 'Cet email est déjà utilisé.' })
      next(err)
    }
  }
)

// POST /api/auth/avatar
router.post('/avatar', requireAuth, (req, res, next) => {
  upload.single('avatar')(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' })
    const url = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`
    try {
      await User.findByIdAndUpdate(req.user._id, { avatar: url })
      res.json({ url })
    } catch (e) { next(e) }
  })
})

// GET /api/auth/users
router.get('/users', requireAuth, requirePermission('users.view'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) { next(err) }
})

// PATCH /api/auth/users/:id/admin — bascule le rôle admin
router.patch('/users/:id/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Impossible de modifier ses propres droits' })
    }
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })
    user.isAdmin = !user.isAdmin
    await user.save()
    logAudit(req, 'user.admin_toggle', req.params.id, { username: user.username, isAdmin: user.isAdmin })
    res.json({ id: user._id, username: user.username, isAdmin: user.isAdmin })
  } catch (err) { next(err) }
})

// PATCH /api/auth/users/:id/role — assigner un grade
router.patch('/users/:id/role', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role || null },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })
    logAudit(req, 'user.role_assign', req.params.id, { username: user.username, role: user.role })
    res.json({ id: user._id, username: user.username, role: user.role })
  } catch (err) { next(err) }
})

// DELETE /api/auth/users/:id — admin uniquement
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Impossible de supprimer son propre compte' })
    }
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' })
    logAudit(req, 'user.delete', req.params.id, { username: user.username })
    res.json({ message: 'Utilisateur supprimé' })
  } catch (err) { next(err) }
})

// GET /api/auth/check-username — vérifie la disponibilité d'un pseudo (public)
router.get('/check-username', async (req, res) => {
  const username = (req.query.username || '').trim()
  if (!username || username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Pseudo invalide' })
  }
  const exists = await User.exists({ username: new RegExp(`^${username}$`, 'i') })
  res.json({ available: !exists })
})

// ── OAuth ──────────────────────────────────────────────────────────────────

const FRONTEND_URL = process.env.FRONTEND_URL      || 'http://localhost:5173'
const OAUTH_BASE   = process.env.OAUTH_CALLBACK_BASE || 'http://localhost:5173'

function oauthSuccess(req, res) {
  const token        = signToken(req.user._id)
  const refreshToken = signRefreshToken(req.user._id)
  res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`)
}

// GET /api/auth/providers — providers OAuth activés (clés présentes)
router.get('/providers', (_req, res) => {
  res.json({
    google:  !!(process.env.GOOGLE_CLIENT_ID  && process.env.GOOGLE_CLIENT_SECRET),
    discord: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
  })
})

// Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/connexion?oauth=error`, session: false }),
  oauthSuccess
)

// Discord — implémenté directement (fetch natif, pas de dépendance dépréciée)
router.get('/discord', (req, res) => {
  if (!process.env.DISCORD_CLIENT_ID) return res.status(501).json({ error: 'Discord OAuth non configuré' })
  const params = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID,
    redirect_uri:  `${OAUTH_BASE}/api/auth/discord/callback`,
    response_type: 'code',
    scope:         'identify email',
  })
  res.redirect(`https://discord.com/oauth2/authorize?${params}`)
})

router.get('/discord/callback', async (req, res) => {
  const { code, error } = req.query
  if (error || !code) return res.redirect(`${FRONTEND_URL}/connexion?oauth=error`)
  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({
        client_id:     process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type:    'authorization_code',
        code,
        redirect_uri:  `${OAUTH_BASE}/api/auth/discord/callback`,
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('Pas de token Discord')

    const profileRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()

    const user = await findOrCreate({
      provider: 'discord',
      id:       profile.id,
      email:    profile.email || null,
      username: profile.global_name || profile.username || `discord_${profile.id.slice(-6)}`,
      avatar:   profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null,
    })

    const token        = signToken(user._id)
    const refreshToken = signRefreshToken(user._id)
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken)}`)
  } catch (e) {
    console.error('[Discord OAuth]', e.message)
    res.redirect(`${FRONTEND_URL}/connexion?oauth=error`)
  }
})

// ── Fin OAuth ───────────────────────────────────────────────────────────────

// DELETE /api/auth/me
router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    const uid = req.user._id
    await Promise.all([
      Favorite.deleteMany({ userId: uid }),
      WatchProgress.deleteMany({ userId: uid }),
      Download.deleteMany({ userId: uid }),
    ])
    await User.findByIdAndDelete(uid)
    res.json({ message: 'Compte supprimé.' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
