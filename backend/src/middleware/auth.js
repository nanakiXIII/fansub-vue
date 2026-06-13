const jwt  = require('jsonwebtoken')
const User = require('../models/User')
const Role = require('../models/Role')

async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non authentifié' })
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    req.user = await User.findById(payload.id).select('-password')
    if (!req.user) return res.status(401).json({ error: 'Utilisateur introuvable' })

    if (req.user.isAdmin) {
      req.userPermissions = ['*']
      req.userSeriesIds   = []
    } else if (req.user.role) {
      const role = await Role.findOne({ name: req.user.role }).lean()
      req.userPermissions = role?.permissions ?? []
      req.userSeriesIds   = role?.seriesIds   ?? []
    } else {
      req.userPermissions = []
      req.userSeriesIds   = []
    }
    next()
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Accès réservé aux admins' })
  next()
}

function requirePermission(perm) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Non authentifié' })
    const perms = req.userPermissions ?? []
    if (perms.includes('*') || perms.includes(perm)) return next()
    res.status(403).json({ error: 'Permission insuffisante' })
  }
}

// Attache req.user + req.userPermissions si token présent, mais ne bloque pas les anonymes
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return next()
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    req.user = await User.findById(payload.id).select('-password')
    if (req.user) {
      if (req.user.isAdmin) {
        req.userPermissions = ['*']
        req.userSeriesIds   = []
      } else if (req.user.role) {
        const role = await Role.findOne({ name: req.user.role }).lean()
        req.userPermissions = role?.permissions ?? []
        req.userSeriesIds   = role?.seriesIds   ?? []
      } else {
        req.userPermissions = []
        req.userSeriesIds   = []
      }
    }
  } catch {}
  next()
}

module.exports = { requireAuth, requireAdmin, requirePermission, optionalAuth }
