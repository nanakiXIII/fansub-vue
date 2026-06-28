const passport      = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User         = require('./models/User')
const SiteSettings = require('./models/SiteSettings')

const OAUTH_BASE = process.env.OAUTH_CALLBACK_BASE || 'http://localhost:5173'

async function ensureUniqueUsername(base) {
  const clean = (base || 'user').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 18)
  if (!await User.exists({ username: clean })) return clean
  for (let i = 1; i <= 99; i++) {
    const candidate = `${clean.slice(0, 15)}_${String(i).padStart(2, '0')}`
    if (!await User.exists({ username: candidate })) return candidate
  }
  return `user_${Date.now().toString(36)}`
}

async function findOrCreate({ provider, id, email, username, avatar }) {
  const providerField = provider === 'google' ? 'googleId' : 'discordId'

  let user = await User.findOne({ [providerField]: id })
  if (user) return user

  if (email) {
    user = await User.findOne({ email })
    if (user) {
      user[providerField] = id
      if (!user.avatar && avatar) user.avatar = avatar
      // Connexion OAuth réussie sur cette adresse → l'email est de facto confirmé.
      user.emailVerified = true
      await user.save()
      return user
    }
  }

  const settings = await SiteSettings.get()
  if (settings.registrationEnabled === false) {
    throw new Error('REGISTRATION_DISABLED')
  }

  user = new User({
    [providerField]: id,
    username: await ensureUniqueUsername(username),
    email:    email || null,
    avatar:   avatar || null,
    password: null,
  })
  await user.save()
  return user
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  `${OAUTH_BASE}/api/auth/google/callback`,
    },
    async (_at, _rt, profile, done) => {
      try {
        const user = await findOrCreate({
          provider: 'google',
          id:       profile.id,
          email:    profile.emails?.[0]?.value ?? null,
          username: profile.displayName || profile.name?.givenName || `google_${profile.id.slice(-6)}`,
          avatar:   profile.photos?.[0]?.value ?? null,
        })
        done(null, user)
      } catch (e) {
        if (e.message === 'REGISTRATION_DISABLED') return done(null, false)
        done(e)
      }
    }
  ))
}

module.exports = { passport, findOrCreate, ensureUniqueUsername }
