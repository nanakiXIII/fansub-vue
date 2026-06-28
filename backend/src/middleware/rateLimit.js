const rateLimit = require('express-rate-limit')

// Login/register : brute-force et création de comptes en masse.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessaie dans quelques minutes.' },
})

// Routes plus sensibles : claim-admin, reset/forgot password, vérification email.
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessaie dans quelques minutes.' },
})

module.exports = { authLimiter, sensitiveLimiter }
