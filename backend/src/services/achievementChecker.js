const Achievement    = require('../models/Achievement')
const UserAchievement = require('../models/UserAchievement')
const Download       = require('../models/Download')
const Comment        = require('../models/Comment')
const WatchProgress  = require('../models/WatchProgress')
const Favorite       = require('../models/Favorite')
const User           = require('../models/User')

// ── Cache en mémoire (5 min) ──────────────────────────────────────
let _cache = null
let _cacheExpiry = 0

async function getActiveAchievements() {
  if (_cache && Date.now() < _cacheExpiry) return _cache
  _cache = await Achievement.find({ isActive: true }).lean()
  _cacheExpiry = Date.now() + 5 * 60 * 1000
  return _cache
}

function invalidateCache() { _cache = null }

// ── Calcul des stats utilisateur ─────────────────────────────────
async function getUserStat(userId, type) {
  switch (type) {
    case 'downloads':
      return Download.countDocuments({ userId })
    case 'comments':
      return Comment.countDocuments({ userId, status: { $ne: 'rejected' } })
    case 'watched':
      return WatchProgress.countDocuments({ userId, pct: { $gte: 90 } })
    case 'favorites':
      return Favorite.countDocuments({ userId })
    case 'days': {
      const user = await User.findById(userId).select('createdAt').lean()
      if (!user) return 0
      return Math.floor((Date.now() - user.createdAt.getTime()) / 86400000)
    }
    default:
      return 0
  }
}

// ── Vérification principale ───────────────────────────────────────
async function checkForUser(userId) {
  try {
    const achievements = await getActiveAchievements()
    if (!achievements.length) return []

    const unlocked = await UserAchievement.find({ userId }).select('achievementId').lean()
    const unlockedIds = new Set(unlocked.map(u => u.achievementId.toString()))

    const toCheck = achievements.filter(a => !unlockedIds.has(a._id.toString()))
    if (!toCheck.length) return []

    // Regrouper par type pour minimiser les requêtes DB
    const types = [...new Set(toCheck.map(a => a.condition.type))]
    const stats = {}
    await Promise.all(types.map(async t => { stats[t] = await getUserStat(userId, t) }))

    const newlyUnlocked = toCheck.filter(a => (stats[a.condition.type] ?? 0) >= a.condition.threshold)

    if (newlyUnlocked.length) {
      await UserAchievement.insertMany(
        newlyUnlocked.map(a => ({ userId, achievementId: a._id })),
        { ordered: false }
      )
    }

    return newlyUnlocked
  } catch {
    return []
  }
}

module.exports = { checkForUser, invalidateCache }
