const AuditLog = require('../models/AuditLog')

async function logAudit(req, action, target = null, details = null) {
  try {
    await AuditLog.create({
      userId:   req.user?._id?.toString() ?? null,
      username: req.user?.username ?? 'Système',
      action,
      target:   target ? String(target) : null,
      details,
      ip:       req.ip ?? req.headers['x-forwarded-for'] ?? null,
    })
  } catch {}
}

module.exports = { logAudit }
